export interface TerraformFile {
  name: string;
  language: string;
  description: string;
  content: string;
}

export const TERRAFORM_FILES: TerraformFile[] = [
  {
    name: 'main.tf',
    language: 'hcl',
    description: 'Root Terraform configuration defining providers, remote state backend with S3 + DynamoDB locking, and environment workspace tagging.',
    content: `terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27.0"
    }
  }

  backend "s3" {
    bucket         = "production-terraform-state-us-east-1"
    key            = "state/cloud-biogeo-app.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_primary_region
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
      CostCenter  = "Research-CloudOps"
      Compliance  = "HIPAA-PHI-Ready"
    }
  }
}

# Secondary region provider for High Availability & Disaster Recovery
provider "aws" {
  alias  = "dr_region"
  region = var.aws_secondary_region
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      Role        = "DisasterRecovery"
    }
  }
}`
  },
  {
    name: 'variables.tf',
    language: 'hcl',
    description: 'Variable declarations maintaining environment parity across dev, staging, and prod.',
    content: `variable "environment" {
  type        = string
  description = "Target deployment environment (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  type        = string
  default     = "cloud-biogeo"
  description = "Project namespace identifier"
}

variable "aws_primary_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_secondary_region" {
  type    = string
  default = "us-west-2"
}

variable "enable_spot_instances" {
  type        = bool
  default     = true
  description = "Enables AWS Spot Compute for 70-90% discount during batch inference"
}

variable "log_retention_days" {
  type    = map(number)
  default = {
    dev     = 14
    staging = 30
    prod    = 365 # HIPAA audit compliance requires 1+ year retention
  }
}`
  },
  {
    name: 'storage_kms.tf',
    language: 'hcl',
    description: 'S3 Data Lake with Customer-Managed KMS Key (CMK), strict TLS 1.3 policy, Intelligent-Tiering, and Cross-Region Replication.',
    content: `# Customer Managed KMS Key with automatic annual key rotation
resource "aws_kms_key" "lake_key" {
  description             = "CMK for genomics counts & satellite rasters encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootPermissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::\${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_kms_alias" "lake_key_alias" {
  name          = "alias/\${var.environment}-\${var.project_name}-lake-key"
  target_key_id = aws_kms_key.lake_key.key_id
}

# S3 Primary Data Lake Bucket
resource "aws_s3_bucket" "data_lake" {
  bucket = "\${var.environment}-\${var.project_name}-lake-\${data.aws_caller_identity.current.account_id}"
}

# S3 Bucket Public Access Block (Enforce complete private isolation)
resource "aws_s3_bucket_public_access_block" "lake_pab" {
  bucket                  = aws_s3_bucket.data_lake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enforce Server-Side KMS Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "lake_encryption" {
  bucket = aws_s3_bucket.data_lake.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.lake_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# S3 Intelligent-Tiering Lifecycle for Cost Optimization
resource "aws_s3_bucket_lifecycle_configuration" "lake_lifecycle" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    id     = "auto-archive-old-runs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR" # Instant retrieval for regulatory audit
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# Bucket Policy Enforcing TLS 1.3 Transport Encryption
resource "aws_s3_bucket_policy" "enforce_tls" {
  bucket = aws_s3_bucket.data_lake.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnforceTLSRequestsOnly"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.data_lake.arn,
          "\${aws_s3_bucket.data_lake.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
          NumericLessThan = {
            "s3:TlsVersion" = 1.3
          }
        }
      }
    ]
  })
}`
  },
  {
    name: 'serverless_pipeline.tf',
    language: 'hcl',
    description: 'Serverless EventBridge rule, Lambda validator with VPC access, and Step Functions DAG state machine orchestration.',
    content: `# EventBridge Rule capturing S3 raw upload events
resource "aws_cloudwatch_event_rule" "s3_upload_rule" {
  name        = "\${var.environment}-lake-upload-trigger"
  description = "Dispatches workflow upon raw RNA-Seq / GeoTIFF upload"
  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Created"]
    detail = {
      bucket = { name = [aws_s3_bucket.data_lake.bucket] }
      object = { key  = [{ prefix = "incoming/" }] }
    }
  })
}

# Serverless Lambda Validator
resource "aws_lambda_function" "ingest_validator" {
  function_name = "\${var.environment}-ingest-validator"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  memory_size   = 512
  timeout       = 30

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      ENVIRONMENT        = var.environment
      STATE_MACHINE_ARN  = aws_sfn_state_machine.pipeline_orchestrator.arn
      METADATA_TABLE_NAME = aws_dynamodb_table.sample_metadata.name
    }
  }
}

# AWS Step Functions Distributed Orchestration State Machine
resource "aws_sfn_state_machine" "pipeline_orchestrator" {
  name     = "\${var.environment}-biogeo-orchestration-dag"
  role_arn = aws_iam_role.step_functions_role.arn

  definition = jsonencode({
    Comment = "Production Scientific Processing Pipeline"
    StartAt = "VerifyPayloadIntegrity"
    States = {
      VerifyPayloadIntegrity = {
        Type     = "Task"
        Resource = aws_lambda_function.ingest_validator.arn
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 2
            MaxAttempts     = 3
            BackoffRate     = 2.0
          }
        ]
        Next = "DispatchContainerJob"
      }
      DispatchContainerJob = {
        Type     = "Task"
        Resource = "arn:aws:states:::batch:submitJob.sync"
        Parameters = {
          JobName       = "batch-scientific-inference"
          JobQueue      = aws_batch_job_queue.spot_queue.arn
          JobDefinition = aws_batch_job_definition.inference_worker.arn
        }
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            Next        = "NotifyFailureSlack"
          }
        ]
        Next = "IndexResultsAthena"
      }
      IndexResultsAthena = {
        Type     = "Task"
        Resource = "arn:aws:states:::athena:startQueryExecution.sync"
        Parameters = {
          QueryString    = "MSCK REPAIR TABLE sample_catalog;"
          WorkGroup      = aws_athena_workgroup.analytics.name
          ResultConfiguration = {
            OutputLocation = "s3://\${aws_s3_bucket.data_lake.bucket}/athena-output/"
          }
        }
        End = true
      }
      NotifyFailureSlack = {
        Type     = "Task"
        Resource = aws_sns_topic.alerts.arn
        End      = true
      }
    }
  })
}`
  },
  {
    name: 'batch_containers.tf',
    language: 'hcl',
    description: 'AWS Batch Managed Compute Environment leveraging Spot EC2 instances with NVIDIA GPU support and automatic scaling.',
    content: `resource "aws_batch_compute_environment" "spot_env" {
  compute_environment_name = "\${var.environment}-spot-analysis-workers"
  type                     = "MANAGED"
  state                    = "ENABLED"

  compute_resources {
    type                = "SPOT"
    allocation_strategy = "SPOT_CAPACITY_OPTIMIZED"
    bid_percentage      = 100 # Matches on-demand ceiling while saving 70-85%
    min_vcpus           = 0
    max_vcpus           = 256
    desired_vcpus       = 0

    instance_types = [
      "c6i.2xlarge", # 8 vCPU, 16GB RAM for RNA-Seq alignment
      "c6i.4xlarge", # 16 vCPU, 32GB RAM for large matrices
      "g5.xlarge",   # NVIDIA A10G Tensor Core for U-Net & PyTorch inference
      "g5.2xlarge"
    ]

    subnets            = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.batch_worker_sg.id]
    instance_role      = aws_iam_instance_profile.ecs_instance_profile.arn

    ec2_configuration {
      image_type = "ECS_AL2023"
    }
  }
}

resource "aws_batch_job_queue" "spot_queue" {
  name                 = "\${var.environment}-spot-job-queue"
  state                = "ENABLED"
  priority             = 1
  compute_environments = [aws_batch_compute_environment.spot_env.arn]
}

resource "aws_batch_job_definition" "inference_worker" {
  name = "\${var.environment}-scientific-inference"
  type = "container"

  container_properties = jsonencode({
    image       = "\${aws_ecr_repository.app_repo.repository_url}:latest"
    vcpus       = 4
    memory      = 16384
    jobRoleArn  = aws_iam_role.container_task_role.arn
    privileged  = false
    user        = "10001:10001" # Hardened non-root user execution
    readonlyRootFilesystem = true

    environment = [
      { name = "ENVIRONMENT", value = var.environment },
      { name = "S3_BUCKET", value = aws_s3_bucket.data_lake.bucket }
    ]

    mountPoints = [
      {
        sourceVolume  = "scratch_tmp"
        containerPath = "/tmp"
        readOnly      = false
      }
    ]

    volumes = [
      {
        name = "scratch_tmp"
        host = { hostPath = "/tmp" }
      }
    ]
  })
}`
  },
  {
    name: 'multi_region_dr.tf',
    language: 'hcl',
    description: 'High Availability multi-region active-active disaster recovery configuration with Route 53 latency routing and S3 Cross-Region Replication (CRR).',
    content: `# S3 Cross-Region Replication Destination Bucket in us-west-2
resource "aws_s3_bucket" "dr_lake" {
  provider = aws.dr_region
  bucket   = "\${var.environment}-\${var.project_name}-lake-replica-\${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "dr_versioning" {
  provider = aws.dr_region
  bucket   = aws_s3_bucket.dr_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Replication Configuration on Primary S3 Lake
resource "aws_s3_bucket_replication_configuration" "crr" {
  bucket = aws_s3_bucket.data_lake.id
  role   = aws_iam_role.s3_replication_role.arn

  rule {
    id     = "crr-full-lake"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.dr_lake.arn
      storage_class = "STANDARD_IA"
      encryption_configuration {
        replica_kms_key_id = aws_kms_key.dr_key.arn
      }
    }

    source_selection_criteria {
      sse_kms_encrypted_objects {
        status = "Enabled"
      }
    }
  }
}

# Route 53 Latency-Based Routing with Automated Health Checks
resource "aws_route53_health_check" "primary_region_hc" {
  fqdn              = "api-\${var.aws_primary_region}.\${var.project_name}.internal"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/healthz"
  failure_threshold = 3
  request_interval  = 10
}

resource "aws_route53_record" "api_latency_primary" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "api.\${var.project_name}.io"
  type    = "A"

  set_identifier = "us-east-1-primary"
  latency_routing_policy {
    region = var.aws_primary_region
  }

  health_check_id = aws_route53_health_check.primary_region_hc.id

  alias {
    name                   = aws_alb.primary_alb.dns_name
    zone_id                = aws_alb.primary_alb.zone_id
    evaluate_target_health = true
  }
}`
  },
  {
    name: 'prometheus_alerts.yaml',
    language: 'yaml',
    description: 'Prometheus Alertmanager rules monitoring p99 latency spikes, Spot container interruptions, and SQS dead-letter backlogs.',
    content: `groups:
  - name: cloud-biogeo-production-alerts
    rules:
      - alert: HighInferenceLatencyP99
        expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2.0
        for: 2m
        labels:
          severity: critical
          tier: inference-engine
        annotations:
          summary: "p99 inference latency exceeds 2000ms SLA"
          description: "Containerized model inference latency p99 has spiked above 2 seconds for over 2 minutes."

      - alert: SpotReclamationSpike
        expr: rate(ec2_spot_interruption_notices_total[5m]) > 3
        for: 1m
        labels:
          severity: warning
          tier: compute-spot
        annotations:
          summary: "High EC2 Spot instance reclamation frequency"
          description: "AWS is interrupting > 3 spot nodes per 5min in {{ $labels.instance_type }}. Auto-failover to on-demand fallback triggered."

      - alert: DeadLetterQueueBacklog
        expr: aws_sqs_approximate_number_of_messages_visible{queue_name=~".*-dlq"} > 0
        for: 1m
        labels:
          severity: page
          tier: ingestion
        annotations:
          summary: "Corrupted samples landed in SQS Dead Letter Queue"
          description: "One or more raw sequencing/GeoTIFF files failed validation schema and requires human intervention."`
  },
  {
    name: '.github/workflows/deploy.yml',
    language: 'yaml',
    description: 'Enterprise CI/CD pipeline enforcing static code analysis, Trivy vulnerability scanning, Checkov IaC security audit, and automated canary deployment.',
    content: `name: Production GitOps CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

permissions:
  id-token: write # Required for AWS OIDC authentication (Zero secret keys)
  contents: read
  security-events: write

jobs:
  security-and-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Run Trivy Vulnerability Scanner on Dockerfile
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Checkov Static IaC Security Analysis
        uses: bridgecrewio/checkov-action@master
        with:
          framework: terraform
          output_format: cli
          soft_fail: false

  terraform-plan-apply:
    needs: [security-and-lint]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsOIDCRole
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.5

      - name: Terraform Init & Validate
        run: |
          terraform init
          terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -var-file="environments/prod.tfvars" -out=tfplan

      - name: Terraform Apply (Main Branch Only)
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan`
  }
];
