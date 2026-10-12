export type TrendPoint = {
  time: string;
  value: number;
};

export type SensorStatus = "Normal" | "Warning" | "Critical" | "Offline" | "Demo";

export interface Farm {
  id: string;
  name: string;
  location: string;
  acres: number;
  climate: string;
}

export interface FarmPlot {
  id: string;
  name: string;
  variety: string;
  area: number;
  soilMoisture: number;
  health: string;
}

export interface Shed {
  id: string;
  name: string;
  farmId: string;
  instar: string;
  capacity: number;
  status: string;
}

export interface Sensor {
  id: string;
  name: string;
  unit: string;
  value: number;
  status: SensorStatus;
  timestamp: string;
  location: string;
}

export interface SensorReading {
  timestamp: string;
  value: number;
}

export interface Actuator {
  id: string;
  name: string;
  status: "ON" | "OFF" | "AUTO" | "MANUAL";
  mode: "AUTO" | "MANUAL" | "SCHEDULED";
  lastAction: string;
}

export interface AlertItem {
  id: string;
  severity: "Critical" | "Warning" | "Information" | "Sensor Failure" | "Automation" | "AI Recommendation";
  parameter: string;
  value: string;
  timestamp: string;
  location: string;
  recommendedAction: string;
  status: string;
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  detail: string;
  badge: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  mode: "AUTO" | "MANUAL" | "SCHEDULED";
}

export interface SilkwormBatch {
  id: string;
  instar: string;
  condition: string;
  riskZone: number;
  stressRisk: "Low" | "Moderate" | "High";
  temperature: number;
  humidity: number;
  nh3: number;
  co2: number;
  ventilation: string;
  feeding: string;
  bedCondition: string;
  cleaning: string;
  mortality: string;
  mulberryQuality: string;
}

export interface MulberryPlot {
  id: string;
  variety: string;
  growthStage: string;
  leafSize: string;
  leafColour: string;
  leafDensity: string;
  visibleDamage: string;
  growthVariation: string;
  soilCondition: string;
  irrigation: string;
  fertilization: string;
}

export interface IrrigationSession {
  id: string;
  duration: string;
  waterUsed: number;
  start: string;
  status: string;
}

export interface FertigationSession {
  id: string;
  recipe: string;
  ecTarget: number;
  dose: number;
  status: string;
}

export interface CameraAnalysis {
  id: string;
  name: string;
  status: string;
  metrics: string[];
}

export interface InstarStage {
  stage: string;
  temperature: string;
  humidity: string;
  description: string;
}
