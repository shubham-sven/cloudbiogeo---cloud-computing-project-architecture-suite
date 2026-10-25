export type CloudProvider = 'aws' | 'gcp';
export type ProjectDomain = 'biology' | 'geoscience';

export interface ArchitectureNode {
  id: string;
  name: string;
  category: 'ingestion' | 'serverless' | 'compute' | 'storage' | 'visualization' | 'security' | 'monitoring';
  awsService: string;
  gcpService: string;
  description: string;
  bioRole: string;
  geoRole: string;
  securitySpec: string;
  costTip: string;
  terraformResource: string;
  sampleCode: string;
}

export interface PipelineStage {
  step: number;
  title: string;
  subtitle: string;
  awsTech: string;
  gcpTech: string;
  bioDetails: string;
  geoDetails: string;
  latencySla: string;
  resilienceMechanism: string;
}

export interface GeneDataPoint {
  gene: string;
  log2FoldChange: number;
  negLog10PValue: number;
  expressionLevel: number;
  regulation: 'up' | 'down' | 'neutral';
  cancerRelevance: string;
  associatedCancer: string;
}

export interface SatelliteBand {
  id: string;
  name: string;
  wavelength: string;
  resolution: string;
  useCase: string;
}

export interface VivaQuestion {
  question: string;
  category: 'Architecture' | 'Security & Compliance' | 'Cost & Scaling' | 'Disaster Recovery' | 'Data Engineering';
  answer: string;
  examinerLookout: string;
}
