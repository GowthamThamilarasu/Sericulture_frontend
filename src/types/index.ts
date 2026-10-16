export type TrendPoint = {
  time: string;
  value: number;
};

export type SensorStatus = "Normal" | "Warning" | "Critical" | "Offline" | "Demo";

export interface Farm {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  acres: number;
  climate: string;
}

/** Door contact sensor: reports only whether the door is open or closed. */
export interface DoorSensor {
  location: string;
  state: "Open" | "Closed";
  since: string;
  openedToday: number;
}

/** One irrigation valve. Volume is in litres; when infinite the valve runs until it is closed. */
export interface FarmValve {
  id: string;
  name: string;
  zone: string;
  flowRate: number; // litres per minute
  volume: number;
  infinite: boolean;
  delivered: number;
  open: boolean;
}

/** A fertigation water-quality reading with its target range. */
export interface FertigationReading {
  key: "ph" | "tds" | "ec" | "n" | "p" | "k";
  label: string;
  name: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  decimals: number;
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

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/** A timed irrigation run for one valve: stops after `volume` litres or `duration` minutes. */
export interface IrrigationSchedule {
  id: string;
  valveId: string;
  start: string; // "HH:MM", 24-hour
  days: Weekday[];
  limit: "volume" | "duration";
  volume: number; // litres
  duration: number; // minutes
  enabled: boolean;
}

/** Water volume limits that the scheduler and automation work within. */
export interface VolumeSettings {
  dailyBudget: number; // litres per day across all valves
  perCycle: Record<string, number>; // default litres per run, by valve id
  tankReserve: number; // % of tank kept back; irrigation stops below it
  maxFlow: number; // L/min the pump line can carry
}

/** One phase of the 3-phase supply to the pump panel. */
export interface PhaseReading {
  phase: "R" | "Y" | "B";
  voltage: number; // phase-to-neutral volts
  current: number; // amps
  powerFactor: number;
}
