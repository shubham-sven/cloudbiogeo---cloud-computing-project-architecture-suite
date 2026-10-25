import { SatelliteBand } from '../types';

export const SENTINEL2_BANDS: SatelliteBand[] = [
  { id: 'B02', name: 'Blue (490 nm)', wavelength: '0.490 µm', resolution: '10m', useCase: 'Atmosphere aerosol scattering, coastal water bathymetry, soil/vegetation distinction' },
  { id: 'B03', name: 'Green (560 nm)', wavelength: '0.560 µm', resolution: '10m', useCase: 'Peak vegetation reflectance, aquatic chlorophyll measurement, true color composite' },
  { id: 'B04', name: 'Red (665 nm)', wavelength: '0.665 µm', resolution: '10m', useCase: 'Chlorophyll absorption band; essential denominator for Normalized Difference Vegetation Index (NDVI)' },
  { id: 'B08', name: 'Near Infrared / NIR (842 nm)', wavelength: '0.842 µm', resolution: '10m', useCase: 'High cellular leaf mesophyll reflection; primary numerator for biomass and plant canopy vigor' },
  { id: 'B11', name: 'SWIR-1 (1610 nm)', wavelength: '1.610 µm', resolution: '20m', useCase: 'Moisture content detection in vegetation and soil; snow vs cloud differentiation' },
  { id: 'B12', name: 'SWIR-2 (2190 nm)', wavelength: '2.190 µm', resolution: '20m', useCase: 'Burned area assessment (NBR index), mineral and geology identification, wildfire smoke penetration' }
];

export const SPECTRAL_INDICES = [
  {
    name: 'NDVI (Normalized Difference Vegetation Index)',
    formula: '(B08 - B04) / (B08 + B04)',
    range: '-1.0 to +1.0',
    interpretation: '> 0.6 dense healthy forest canopy; 0.2–0.4 sparse grassland/shrubs; < 0.1 barren rock, sand, concrete; < 0 water bodies.',
    useCase: 'Agricultural crop health, drought monitoring, Amazon deforestation tracking, carbon sequestration estimations.'
  },
  {
    name: 'NDWI (Normalized Difference Water Index)',
    formula: '(B03 - B08) / (B03 + B08)',
    range: '-1.0 to +1.0',
    interpretation: '> 0.2 clear deep water bodies, wetlands, reservoirs; < 0 non-water terrestrial features.',
    useCase: 'Flood extent inundation mapping, reservoir volume drawdown, wetland conservation, coastal shoreline erosion.'
  },
  {
    name: 'NBR (Normalized Burn Ratio)',
    formula: '(B08 - B12) / (B08 + B12)',
    range: '-1.0 to +1.0',
    interpretation: 'High values = healthy unburned canopy; Low/Negative values = high wildfire burn severity and char.',
    useCase: 'Wildfire damage appraisal, post-fire soil burn severity classification (USGS BAER program), emergency recovery.'
  },
  {
    name: 'NDMI (Normalized Difference Moisture Index)',
    formula: '(B08 - B11) / (B08 + B11)',
    range: '-1.0 to +1.0',
    interpretation: 'Correlates with canopy leaf water content and soil root-zone moisture.',
    useCase: 'Early agricultural drought early-warning, wildfire fuel moisture tracking, irrigation efficiency audits.'
  }
];

export const SAMPLE_GEO_LOCATIONS = [
  {
    id: 'amazon',
    name: 'Amazon Rainforest Basin (Rondônia, Brazil)',
    coordinates: '-10.8261° S, -61.9312° W',
    description: 'Critical monitoring zone for illegal logging, fishbone deforestation corridors, and agricultural cattle ranch expansion.',
    baselineNDVI: 0.82,
    degradedNDVI: 0.28,
    cloudCover: '4.2%'
  },
  {
    id: 'california',
    name: 'Sierra Nevada Wildfire Zone (California, USA)',
    coordinates: '39.7596° N, -121.6219° W',
    description: 'Post-wildfire burn scar assessment using multitemporal Sentinel-2 SWIR-2 and NIR differential NBR imagery.',
    baselineNDVI: 0.68,
    degradedNDVI: -0.15,
    cloudCover: '1.8%'
  },
  {
    id: 'punjab',
    name: 'Punjab Agricultural Belt (India)',
    coordinates: '30.9010° N, 75.8573° W',
    description: 'High-frequency wheat/rice crop phenology, rotational irrigation schedules, and post-harvest crop residue burning.',
    baselineNDVI: 0.74,
    degradedNDVI: 0.35,
    cloudCover: '6.5%'
  }
];
