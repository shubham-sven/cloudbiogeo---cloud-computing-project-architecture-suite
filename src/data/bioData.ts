import { GeneDataPoint } from '../types';

export const SAMPLE_CANCER_COHORTS = [
  { id: 'BRCA', name: 'Breast Invasive Carcinoma', samples: 1098, biomarkers: ['BRCA1', 'BRCA2', 'ERBB2', 'ESR1', 'TP53'] },
  { id: 'LUAD', name: 'Lung Adenocarcinoma', samples: 585, biomarkers: ['EGFR', 'KRAS', 'ALK', 'MET', 'BRAF'] },
  { id: 'COAD', name: 'Colon Adenocarcinoma', samples: 458, biomarkers: ['APC', 'KRAS', 'BRAF', 'PIK3CA', 'SMAD4'] },
  { id: 'GBM', name: 'Glioblastoma Multiforme', samples: 617, biomarkers: ['PTEN', 'EGFR', 'TP53', 'IDH1', 'NF1'] },
  { id: 'PRAD', name: 'Prostate Adenocarcinoma', samples: 500, biomarkers: ['AR', 'PTEN', 'SPOP', 'TP53', 'TMPRSS2'] }
];

export const GENE_EXPRESSION_DATASET: GeneDataPoint[] = [
  { gene: 'ERBB2 (HER2)', log2FoldChange: 3.84, negLog10PValue: 14.2, expressionLevel: 9840, regulation: 'up', cancerRelevance: 'Receptor tyrosine kinase amplified in 20% of breast cancers. Direct target for Trastuzumab.', associatedCancer: 'Breast (BRCA)' },
  { gene: 'EGFR', log2FoldChange: 3.12, negLog10PValue: 12.8, expressionLevel: 7520, regulation: 'up', cancerRelevance: 'Drives oncogenic cell proliferation. Tyrosine kinase inhibitor target in non-small cell lung cancer.', associatedCancer: 'Lung (LUAD)' },
  { gene: 'MYC', log2FoldChange: 2.76, negLog10PValue: 10.5, expressionLevel: 8430, regulation: 'up', cancerRelevance: 'Master proto-oncogene regulating cellular metabolism, ribosome biogenesis, and rapid tumor growth.', associatedCancer: 'Burkitt / Multi-cancer' },
  { gene: 'MKI67 (Ki-67)', log2FoldChange: 2.95, negLog10PValue: 11.9, expressionLevel: 6910, regulation: 'up', cancerRelevance: 'Key clinical marker of cellular proliferation index used to differentiate Luminal A vs Luminal B.', associatedCancer: 'Breast / Multi-cancer' },
  { gene: 'CCND1 (Cyclin D1)', log2FoldChange: 2.34, negLog10PValue: 9.1, expressionLevel: 5840, regulation: 'up', cancerRelevance: 'Cell cycle G1/S transition regulator frequently overexpressed in luminal breast carcinomas.', associatedCancer: 'Breast / Mantle Cell' },
  { gene: 'VEGFA', log2FoldChange: 2.45, negLog10PValue: 8.7, expressionLevel: 4920, regulation: 'up', cancerRelevance: 'Potent pro-angiogenic cytokine mediating tumor vascularization and oxygenation.', associatedCancer: 'Renal / Colorectal' },
  { gene: 'TP53', log2FoldChange: -0.42, negLog10PValue: 2.1, expressionLevel: 3120, regulation: 'neutral', cancerRelevance: 'Guardian of the genome. Mutated in >50% of human tumors; loss of function promotes genomic instability.', associatedCancer: 'Pan-cancer' },
  { gene: 'GAPDH', log2FoldChange: 0.08, negLog10PValue: 0.4, expressionLevel: 14200, regulation: 'neutral', cancerRelevance: 'Housekeeping glycolytic enzyme utilized as standard internal normalization control in RNA-Seq.', associatedCancer: 'Control' },
  { gene: 'ACTB (Beta-Actin)', log2FoldChange: -0.05, negLog10PValue: 0.3, expressionLevel: 16800, regulation: 'neutral', cancerRelevance: 'Constitutively expressed structural cytoskeletal gene used for library size verification.', associatedCancer: 'Control' },
  { gene: 'PTEN', log2FoldChange: -2.85, negLog10PValue: 11.4, expressionLevel: 940, regulation: 'down', cancerRelevance: 'Major tumor suppressor lipid phosphatase antagonizing PI3K-AKT signaling axis. Lost in glioblastoma.', associatedCancer: 'Glioblastoma / Prostate' },
  { gene: 'BRCA1', log2FoldChange: -2.35, negLog10PValue: 8.9, expressionLevel: 820, regulation: 'down', cancerRelevance: 'DNA double-strand break repair mediator. Downregulation impairs homologous recombination.', associatedCancer: 'Breast / Ovarian' },
  { gene: 'CDH1 (E-Cadherin)', log2FoldChange: -3.42, negLog10PValue: 13.1, expressionLevel: 610, regulation: 'down', cancerRelevance: 'Cell-cell adhesion molecule; downregulation triggers epithelial-mesenchymal transition (EMT) & metastasis.', associatedCancer: 'Gastric / Lobular Breast' },
  { gene: 'RB1', log2FoldChange: -2.18, negLog10PValue: 7.8, expressionLevel: 1150, regulation: 'down', cancerRelevance: 'Retinoblastoma tumor suppressor protein halting cell progression from G1 into S phase.', associatedCancer: 'Retinoblastoma / SCLC' },
  { gene: 'SMAD4', log2FoldChange: -2.60, negLog10PValue: 9.6, expressionLevel: 880, regulation: 'down', cancerRelevance: 'Downstream transcription factor of TGF-beta pathway. Inactivation common in pancreatic and colorectal adenocarcinoma.', associatedCancer: 'Pancreatic / Colorectal' }
];

export const SUBTYPE_PREDICTION_MODELS = [
  {
    subtype: 'Luminal A (ER+/PR+, HER2-, low Ki-67)',
    probability: 0.88,
    prognosis: 'Favorable (5-year survival > 92%)',
    recommendedTherapy: 'Endocrine therapy (Tamoxifen, Aromatase Inhibitors). Chemotherapy generally omitted.',
    signatureGenes: ['ESR1 ↑', 'PGR ↑', 'MKI67 ↓', 'BCL2 ↑']
  },
  {
    subtype: 'HER2-Enriched (HER2+, ER-/PR-)',
    probability: 0.08,
    prognosis: 'Aggressive without targeted therapy (5-year survival ~ 75-80%)',
    recommendedTherapy: 'Dual HER2-targeted blockade (Trastuzumab + Pertuzumab) combined with taxane chemotherapy.',
    signatureGenes: ['ERBB2 ↑↑', 'GRB7 ↑', 'ESR1 ↓', 'PGR ↓']
  },
  {
    subtype: 'Triple Negative / Basal-like (ER-, PR-, HER2-)',
    probability: 0.03,
    prognosis: 'High risk of early recurrence (5-year survival ~ 68%)',
    recommendedTherapy: 'Neoadjuvant platinum chemotherapy + Immunotherapy (Pembrolizumab anti-PD-1) or PARP inhibitors if BRCA-mutated.',
    signatureGenes: ['KRT5/6 ↑', 'EGFR ↑', 'TP53 mut', 'ESR1 ↓↓']
  },
  {
    subtype: 'Luminal B (ER+, HER2+/- with high Ki-67)',
    probability: 0.01,
    prognosis: 'Intermediate (5-year survival ~ 82%)',
    recommendedTherapy: 'Endocrine therapy plus adjuvant chemotherapy; CDK4/6 inhibitors (Abemaciclib) for high-risk nodes.',
    signatureGenes: ['ESR1 ↑', 'MKI67 ↑↑', 'CCND1 ↑']
  }
];

export const HEATMAP_SAMPLE_DATA = [
  { gene: 'ERBB2', tumor1: 9.8, tumor2: 9.4, tumor3: 8.9, normal1: 3.2, normal2: 3.4, normal3: 3.1 },
  { gene: 'EGFR', tumor1: 8.9, tumor2: 8.5, tumor3: 9.1, normal1: 4.1, normal2: 3.9, normal3: 4.2 },
  { gene: 'MYC', tumor1: 9.1, tumor2: 8.8, tumor3: 8.6, normal1: 4.5, normal2: 4.8, normal3: 4.4 },
  { gene: 'MKI67', tumor1: 7.9, tumor2: 8.2, tumor3: 7.5, normal1: 2.1, normal2: 2.0, normal3: 2.3 },
  { gene: 'PTEN', tumor1: 2.8, tumor2: 3.1, tumor3: 2.6, normal1: 7.8, normal2: 8.1, normal3: 7.9 },
  { gene: 'BRCA1', tumor1: 3.1, tumor2: 2.9, tumor3: 3.3, normal1: 7.2, normal2: 7.5, normal3: 7.4 },
  { gene: 'CDH1', tumor1: 2.4, tumor2: 2.1, tumor3: 2.7, normal1: 8.9, normal2: 9.2, normal3: 9.0 }
];
