import { VivaQuestion } from '../types';

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    category: 'Architecture',
    question: 'Why choose a decoupled serverless pipeline (S3/GCS -> EventBridge/PubSub -> Step Functions) instead of running a continuous EC2/Compute instance?',
    answer: 'Decoupling ensures zero idle costs (scale-to-zero), infinite instantaneous scalability during data bursts (e.g., 50 hospital sequencers uploading simultaneously or batch Sentinel-2 ingestion), and fault isolation. If a downstream ML container crashes, the event remains durable in SQS/Step Functions with automatic exponential backoff, preventing data loss without paying $150+/month for an idle EC2 instance.',
    examinerLookout: 'Check if student understands event-driven architecture, scale-to-zero economics, and dead-letter queue (DLQ) resilience.'
  },
  {
    category: 'Cost & Scaling',
    question: 'How do you handle the high compute cost of genomic alignment (STAR/Salmon) or U-Net satellite segmentation?',
    answer: 'We leverage AWS Batch with EC2 Spot Instances (allocation strategy SPOT_CAPACITY_OPTIMIZED) or GCP Preemptible VMs, which delivers a 70% to 90% cost reduction over on-demand pricing. To handle potential spot interruptions (2-minute warning), our containers checkpoint partial batch states to S3 every epoch/chunk, allowing the orchestrator to resume on another instance seamlessly.',
    examinerLookout: 'Looking for Spot instance allocation strategies, 2-minute interruption handler (SIGTERM), and S3 checkpointing.'
  },
  {
    category: 'Security & Compliance',
    question: 'How does your architecture enforce HIPAA & PHI compliance for cancer genomic data?',
    answer: '1) At-rest encryption: S3/GCS buckets utilize Customer-Managed KMS Keys (CMK) with annual automated key rotation and bucket key caching. 2) In-transit: Strict TLS 1.3 encryption is enforced via S3 bucket policies rejecting any non-TLS or TLS < 1.3 requests. 3) RBAC & Least Privilege: Pre-signed upload URLs expire in 15 minutes; patient genomic data is pseudonymized using SHA-256 cryptographic salts before landing in the data lake. 4) Auditability: CloudTrail logs every data access API call to an immutable S3 bucket with Object Lock enabled.',
    examinerLookout: 'Verify understanding of envelope encryption, KMS key policies, HIPAA pseudonymization, and immutable audit logs.'
  },
  {
    category: 'Disaster Recovery',
    question: 'Explain your High Availability and Disaster Recovery (DR) strategy across multiple cloud regions.',
    answer: 'We employ an Active-Active (for APIs/Visualization) and Active-Passive (for heavy batch compute) multi-region architecture spanning us-east-1 and us-west-2. S3 Cross-Region Replication (CRR) maintains continuous data synchronization with an RPO (Recovery Point Objective) under 15 minutes. Route 53 latency-based routing combined with HTTPS health checks reroutes user traffic automatically to the healthy region within 30 seconds (RTO < 30 minutes).',
    examinerLookout: 'Assess whether student knows the exact difference between RPO and RTO, and how Route 53 health checks work.'
  },
  {
    category: 'Data Engineering',
    question: 'What is a Cloud-Optimized GeoTIFF (COG) and why is it superior to traditional GeoTIFFs for satellite imagery?',
    answer: 'A COG is a regular GeoTIFF file structured internally with tiled overviews (pyramids) and HTTP Range request support. Instead of downloading a full 1GB satellite scene just to view a small farm plot, client web viewers (like TiTiler/Deck.gl) request only the exact byte range corresponding to the current viewport zoom/pan level, reducing network transfer by 99% and enabling sub-100ms tile rendering.',
    examinerLookout: 'Look for explanation of HTTP GET Range requests and internal image pyramids/overviews.'
  }
];

export const RESUME_BULLETS = {
  biology: [
    'Architected an event-driven cancer transcriptomics pipeline on AWS using S3, EventBridge, Step Functions, and AWS Batch, processing 100+ patient RNA-Seq count matrices with sub-5-minute end-to-end turnaround.',
    'Engineered a containerized PyTorch multi-cancer classifier achieving 94.2% diagnostic accuracy across 5 TCGA cohorts (BRCA, LUAD, COAD, GBM, PRAD) on Spot GPU instances, cutting compute expenses by 76%.',
    'Enforced strict HIPAA compliance by implementing AWS KMS envelope encryption, TLS 1.3-only bucket policies, Cognito MFA authentication, and immutable CloudTrail audit logging.'
  ],
  geoscience: [
    'Designed a serverless Earth Observation pipeline ingesting Sentinel-2 multispectral imagery via STAC API, computing dynamic NDVI, NDWI, and NBR spectral indices for deforestation & wildfire tracking.',
    'Developed high-performance dynamic tile generation utilizing Cloud-Optimized GeoTIFFs (COGs) and TiTiler on ECS Fargate, slashing tile request latency to < 120ms with 96% edge cache hit ratio on CloudFront.',
    'Provisioned multi-region active-active infrastructure using modular Terraform (HCL), establishing cross-region replication (CRR), Route 53 latency routing, and RPO < 15 min / RTO < 30 min disaster recovery protocols.'
  ]
};
