import { ArchitectureNode, PipelineStage } from '../types';

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'edge-ingestion',
    name: 'Secure Ingestion Gateway',
    category: 'ingestion',
    awsService: 'Amazon S3 + CloudFront + API Gateway (Pre-Signed URLs)',
    gcpService: 'Google Cloud Storage + Cloud CDN + Cloud Endpoints',
    description: 'High-throughput edge ingestion endpoint enforcing TLS 1.3 encryption, chunked multi-part parallel uploads, and time-bounded signed upload credentials.',
    bioRole: 'Receives raw sequencing FASTQ/BAM files (10GB–50GB per sample) or gene count matrices from clinical hospital sequencers with HMAC token validation.',
    geoRole: 'Ingests multi-gigabyte Sentinel-2 / Landsat-9 L1C/L2A granules and STAC catalog metadata feeds from ESA/USGS open telemetry streams.',
    securitySpec: 'Enforces TLS 1.3 ciphers (TLS_AES_256_GCM_SHA384), IAM pre-signed PUT URLs expiring in 900 seconds, and strict MD5/SHA256 checksum verification.',
    costTip: 'Direct client-to-bucket upload bypasses compute layers, eliminating EC2/Container data transfer ingress bottlenecks.',
    terraformResource: 'aws_s3_bucket + aws_s3_bucket_lifecycle_configuration',
    sampleCode: `# S3 Ingestion Bucket with TLS 1.3 & KMS
resource "aws_s3_bucket" "raw_ingest" {
  bucket = "\${var.environment}-\${var.project_name}-raw-ingest"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms_enc" {
  bucket = aws_s3_bucket.raw_ingest.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.project_cmk.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}`
  },
  {
    id: 'serverless-event',
    name: 'Serverless Event Router',
    category: 'serverless',
    awsService: 'Amazon EventBridge + AWS Lambda Fan-Out',
    gcpService: 'Google Cloud Pub/Sub + Cloud Functions (Gen 2)',
    description: 'Decoupled event-driven backbone capturing ObjectCreated events, executing immediate validation, metadata extraction, and workflow state fan-out.',
    bioRole: 'Extracts patient sample ID, sequencing protocol metadata, verifies FASTQ gzip integrity, and writes staging event to audit trail.',
    geoRole: 'Parses GeoTIFF geospatial bounding boxes (EPSG projection), date timestamps, cloud coverage percentages, and triggers tiling pipelines.',
    securitySpec: 'Execution role scoped with strict least-privilege IAM policies, VPC endpoints (PrivateLink) avoiding public internet transit, dead-letter SQS for corrupted payloads.',
    costTip: 'Scale-to-zero compute: pay strictly for execution milliseconds ($0.20 per 1M requests), zero cost when idle.',
    terraformResource: 'aws_cloudwatch_event_rule + aws_lambda_function',
    sampleCode: `resource "aws_cloudwatch_event_rule" "s3_upload_trigger" {
  name        = "capture-ingested-objects"
  description = "Triggers workflow upon new raw data arrival"
  event_pattern = jsonencode({
    source      = ["aws.s3"],
    detail-type = ["Object Created"],
    detail = {
      bucket = { name = [aws_s3_bucket.raw_ingest.bucket] }
    }
  })
}`
  },
  {
    id: 'workflow-orchestrator',
    name: 'State Machine Orchestrator',
    category: 'serverless',
    awsService: 'AWS Step Functions (Distributed Map)',
    gcpService: 'Google Cloud Workflows',
    description: 'Visual DAG-based state machine managing error retries, exponential backoffs, human-in-the-loop approvals, and parallel container execution.',
    bioRole: 'Coordinates alignment (STAR/Salmon), quality control checks, DESeq2 differential expression, and AI diagnostic inference tasks.',
    geoRole: 'Orchestrates atmospheric correction, cloud masking, multi-band spectral indexing (NDVI/NDWI), and raster tile pyramidal generation.',
    securitySpec: 'IAM state execution role with conditions ensuring tasks run only within approved VPC subnets; encrypted execution histories.',
    costTip: 'Step Functions Express workflows for sub-second high-volume bursts; Standard workflows for long-running hours-scale genomic aligners.',
    terraformResource: 'aws_sfn_state_machine',
    sampleCode: `resource "aws_sfn_state_machine" "pipeline" {
  name     = "\${var.environment}-processing-pipeline"
  role_arn = aws_iam_role.step_functions_role.arn
  definition = jsonencode({
    Comment = "Genomics / Earth Observation Orchestrator"
    StartAt = "ValidatePayload"
    States = {
      ValidatePayload = {
        Type = "Task"
        Resource = aws_lambda_function.validator.arn
        Next = "DispatchBatchCompute"
      }
      DispatchBatchCompute = {
        Type = "Task"
        Resource = "arn:aws:states:::batch:submitJob.sync"
        End = true
      }
    }
  })
}`
  },
  {
    id: 'container-compute',
    name: 'Containerized Analysis Engine',
    category: 'compute',
    awsService: 'AWS Batch (EC2 Spot / ECS Fargate) or Amazon EKS',
    gcpService: 'Google Cloud Batch / Cloud Run Jobs / GKE Autopilot',
    description: 'Hardened Docker container workers with custom scientific runtimes, running on dynamically scaled Spot/Preemptible compute instances.',
    bioRole: 'Executes Bioconductor, R/DESeq2, Scanpy, PyTorch multi-cancer classifier predicting primary site & tumor molecular subtype.',
    geoRole: 'Runs GDAL/Rasterio C-extensions, computes NDVI/NDWI/NBR indices, and executes U-Net segmentation models on GPU Spot instances.',
    securitySpec: 'Read-only root filesystems, unprivileged non-root UID 10001, no host IPC/network sharing, Trivy vulnerability scanned images in ECR.',
    costTip: 'Spot instances slash compute costs by 70% to 90%. Spot interruption handler checkpoints training/processing state to S3.',
    terraformResource: 'aws_batch_compute_environment + aws_batch_job_definition',
    sampleCode: `resource "aws_batch_compute_environment" "spot_workers" {
  compute_environment_name = "spot-compute-env"
  type                     = "MANAGED"
  compute_resources {
    type                = "SPOT"
    allocation_strategy = "SPOT_CAPACITY_OPTIMIZED"
    bid_percentage      = 100
    instance_types      = ["c6i.2xlarge", "c6i.4xlarge", "g5.xlarge"]
    min_vcpus           = 0
    max_vcpus           = 128
    subnets             = aws_subnet.private[*].id
    security_group_ids  = [aws_security_group.batch_sg.id]
  }
}`
  },
  {
    id: 'analytical-catalog',
    name: 'Data Lake & Metadata Catalog',
    category: 'storage',
    awsService: 'Amazon Athena + AWS Glue Catalog + Amazon DynamoDB',
    gcpService: 'Google BigQuery + Dataproc Metastore + Cloud Spanner',
    description: 'Serverless columnar query engine querying Snappy-compressed Parquet files and Cloud-Optimized GeoTIFFs (COGs) partitioned by date & cohort.',
    bioRole: 'Queries millions of normalized gene expression values across TCGA cohorts, patient phenotypes, mutation statuses, and survival records.',
    geoRole: 'Queries STAC metadata catalog, spatial indexes (H3 / S2 geometry), average NDVI trends across polygons over 5-year intervals.',
    securitySpec: 'Athena workgroup encrypted query results; DynamoDB point-in-time recovery (PITR); column-level masking for patient identifiers (PHI).',
    costTip: 'Partition projection and Apache Parquet columnar formatting cut scanned data volume by up to 95%, dropping Athena query costs to pennies.',
    terraformResource: 'aws_glue_catalog_database + aws_athena_workgroup',
    sampleCode: `resource "aws_athena_workgroup" "analytics" {
  name = "analytics-workgroup"
  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true
    bytes_scanned_cutoff_per_query     = 10737418240 # 10 GB limit safety
    result_configuration {
      output_location = "s3://\${aws_s3_bucket.query_results.bucket}/output/"
      encryption_configuration {
        encryption_option = "SSE_KMS"
        kms_key_arn       = aws_kms_key.project_cmk.arn
      }
    }
  }
}`
  },
  {
    id: 'scalable-edge-viz',
    name: 'Scalable Visualization Layer',
    category: 'visualization',
    awsService: 'Amazon CloudFront + S3 Static Hosting + TiTiler (ECS Fargate)',
    gcpService: 'Google Cloud CDN + Cloud Storage + Cloud Run Dynamic Tiler',
    description: 'Sub-millisecond cached global edge distribution serving responsive React web applications, dynamic map tile endpoints, and interactive scientific plots.',
    bioRole: 'Renders high-density interactive Volcano plots, Clustered Heatmaps, PCA 3D projections, and Kaplan-Meier prognostic survival curves.',
    geoRole: 'Streams XYZ map tiles dynamically generated from S3 COGs using Range requests via TiTiler into Deck.gl and Leaflet viewports.',
    securitySpec: 'CloudFront Origin Access Control (OAC) prevents direct S3 access; strict Content-Security-Policy (CSP) headers, HSTS preloaded.',
    costTip: 'Global edge cache hits (95%+ hit ratio for tiles and web assets) reduce backend compute roundtrips by 90%.',
    terraformResource: 'aws_cloudfront_distribution + aws_cloudfront_origin_access_control',
    sampleCode: `resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }
  enabled             = true
  default_root_object = "index.html"
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.3_2021"
  }
}`
  },
  {
    id: 'security-governance',
    name: 'Security, RBAC & Audit Engine',
    category: 'security',
    awsService: 'AWS KMS + AWS IAM + AWS Cognito + AWS CloudTrail',
    gcpService: 'Google Cloud KMS + Cloud IAM + Cloud Identity + Cloud Audit Logs',
    description: 'Zero-trust enterprise security plane enforcing envelope encryption, strict role-based access control, FIDO2/TOTP MFA, and immutable compliance audit trails.',
    bioRole: 'Guarantees HIPAA, HITECH, and GDPR compliance; enforces pseudonymization of patient genomic records and cryptographic access logging.',
    geoRole: 'Governs high-resolution commercial satellite imagery access tiers, defense/commercial license boundaries, and download auditing.',
    securitySpec: 'KMS Key Policy enforces PrincipalOrgID check; CloudTrail logs all read/write S3 calls with S3 Object Lock compliance retention.',
    costTip: 'AWS KMS alias reuse and cached envelope data keys reduce per-call KMS cryptographic request fees.',
    terraformResource: 'aws_kms_key + aws_cloudtrail',
    sampleCode: `resource "aws_kms_key" "project_cmk" {
  description             = "CMK for genomics & satellite data encryption at rest"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy = data.aws_iam_policy_document.kms_policy.json
}`
  },
  {
    id: 'observability-prom',
    name: 'Observability & Prometheus Alerting',
    category: 'monitoring',
    awsService: 'Prometheus Operator + Grafana + Amazon CloudWatch Alarms',
    gcpService: 'Managed Service for Prometheus + Grafana + Cloud Monitoring',
    description: 'Real-time telemetry and alerting monitoring queue depth, container memory saturation, p99 latency spikes, and automated failover signals.',
    bioRole: 'Monitors alignment throughput, memory usage during matrix factorization, and pipeline completion alerts sent to Slack/SNS.',
    geoRole: 'Monitors dynamic tile rendering latency (<150ms target), GDAL IOPS bottlenecks, and SPOT instance reclamation rate.',
    securitySpec: 'Scrape endpoints isolated within private VPC; TLS mutual authentication (mTLS) between Prometheus and node exporters.',
    costTip: 'Metrics retention downsampling (15s scrape for 7 days, 5m rollup for 90 days) cuts Prometheus storage by 80%.',
    terraformResource: 'helm_release.prometheus_operator',
    sampleCode: `resource "helm_release" "kube_prometheus" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "56.0.0"
  values = [file("\${path.module}/prometheus-values.yaml")]
}`
  }
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    step: 1,
    title: 'Data Ingestion & Verification',
    subtitle: 'Edge acceleration, TLS 1.3, Pre-signed tokens',
    awsTech: 'S3 Transfer Acceleration + Lambda Validator + KMS',
    gcpTech: 'Cloud Storage Dual-Region + Cloud Functions + Cloud KMS',
    bioDetails: 'Hospital clinical upload of RNA-Seq FASTQ files / counts matrix. Validates format checksums (MD5), checks sequencing depth (>30M reads), strips PHI metadata.',
    geoDetails: 'Automated polling of ESA Copernicus Hub / USGS EarthExplorer or AWS Open Data Sentinel-2 L2A tiles. Ingests STAC JSON and GeoTIFFs.',
    latencySla: '< 1.5s validation',
    resilienceMechanism: 'Multi-part parallel uploads with automated retry on network drop.'
  },
  {
    step: 2,
    title: 'Serverless Event Orchestration',
    subtitle: 'Decoupled state management & fan-out',
    awsTech: 'EventBridge -> Step Functions Distributed Map',
    gcpTech: 'Cloud Pub/Sub -> Cloud Workflows',
    bioDetails: 'Splits gene sample batches into parallel processing branches; checks reference genome indexing (GRCh38 / Ensembl) and allocates worker pools.',
    geoDetails: 'Fans out spatial grid into quadtree tile chunks (Z/X/Y); schedules concurrent spectral index calculations across available Spot instances.',
    latencySla: '< 50ms trigger latency',
    resilienceMechanism: 'Dead-letter queues (DLQ) with 14-day retention and automated exponential backoff.'
  },
  {
    step: 3,
    title: 'Containerized Analysis & AI Inference',
    subtitle: 'Spot compute, isolated Docker containers, GPU inference',
    awsTech: 'AWS Batch (Spot EC2 / EKS) + ECR',
    gcpTech: 'Google Cloud Batch + GKE Autopilot + Artifact Registry',
    bioDetails: 'Runs DESeq2 differential expression, identifies biomarker up/down-regulation, executes 1D-CNN / Random Forest classifier to predict tumor subtype.',
    geoDetails: 'Rasterio reads multi-band arrays, computes NDVI = (B08-B04)/(B08+B04), applies cloud-mask from SCL band, runs U-Net for building/water/forest segmentation.',
    latencySla: '4–8 mins (Genomics) / 12–35s (Satellite)',
    resilienceMechanism: 'State checkpointing to object storage; automatic spot replacement without loss of progress.'
  },
  {
    step: 4,
    title: 'Analytical Indexing & Cataloging',
    subtitle: 'Serverless columnar queries & geospatial indexing',
    awsTech: 'AWS Glue + Amazon Athena + DynamoDB',
    gcpTech: 'Dataplex + BigQuery + Cloud Spanner',
    bioDetails: 'Stores normalized TPM/FPKM expression matrices in Snappy-compressed Parquet. DynamoDB stores patient diagnostic predictions and confidence scores.',
    geoDetails: 'Converts rasters to Cloud-Optimized GeoTIFFs (COGs). Populates SpatioTemporal Asset Catalog (STAC) and spatial H3 hex indexes for instant spatial queries.',
    latencySla: '< 300ms query time',
    resilienceMechanism: 'Point-in-time recovery (PITR) with continuous incremental replication.'
  },
  {
    step: 5,
    title: 'Scalable Visualization & API Delivery',
    subtitle: 'Global CDN distribution & interactive web client',
    awsTech: 'CloudFront OAC + TiTiler Fargate + S3',
    gcpTech: 'Cloud CDN + Cloud Run Dynamic Tiler + Cloud Storage',
    bioDetails: 'Interactive clinical dashboard: Volcano Plot, Hierarchical Clustered Heatmap, PCA scatter, and Kaplan-Meier survival curves for oncologists.',
    geoDetails: 'Tile Map Service (TMS) streaming COG tiles into Deck.gl/Leaflet. Split-screen before/after slider for deforestation and flood monitoring.',
    latencySla: '< 80ms edge cached response',
    resilienceMechanism: 'Multi-region active-active failover with Route 53 latency routing.'
  }
];
