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
  flowRate: number; // litres per minute, read by the valve's flow meter while open
  pressure: number; // bar, read by the valve's pressure sensor while open
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

export type InstarKey = "I" | "II" | "III" | "IV" | "V" | "Spinning";

/** Live condition of the batch being reared; which batch it is comes from the batch list (BatchRecord). */
export interface SilkwormBatch {
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

/** A rearing batch, running or finished. Dates are "YYYY-MM-DD". */
export interface BatchRecord {
  id: string; // batch number, e.g. "SB-2026-014"
  farm: string;
  shed: string;
  breed: string; // race / hybrid, e.g. "CSR2 × CSR4"
  breedType: string; // e.g. "Bivoltine hybrid"
  brushedOn: string; // day the larvae were brushed onto the rearing bed
  instar: InstarKey | "Auto"; // "Auto" works the instar out from the brushing date
  harvestedOn: string | null; // null while still rearing
  layings: number; // disease-free layings (DFLs) brushed
  cocoonKg: number | null;
  grade: "A" | "B" | "C" | null;
  mortality: number | null; // %
  status: "Rearing" | "Harvested" | "Failed";
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

/** A mulberry block as set up on the Mulberry tab. Dates are "YYYY-MM-DD". */
export interface MulberryBlock {
  id: string;
  name: string;
  variety: string;
  area: number; // acres cultivated
  irrigation: string; // e.g. "Drip", "Underground drip", "Sprinkler"
  plantingSystem: string; // e.g. "Paired row"
  plantedOn: string;
  manuringEveryDays: number; // days between manuring splits
}

export type FieldActivityType = "Manuring" | "Medication" | "Pest control" | "Defect" | "Pruning" | "Weeding" | "Leaf harvest" | "Irrigation" | "Soil test" | "Other";

/** One entry in the mulberry field log. */
export interface FieldActivity {
  id: string;
  date: string; // "YYYY-MM-DD"
  blockId: string; // a block id, or "all"
  type: FieldActivityType;
  title: string;
  status: "Done" | "Planned";
  product?: string; // manure, fertiliser, medicine or pesticide used
  dose?: string;
  waitDays?: number; // days before the leaf is safe to feed silkworms after a spray
  defect?: string;
  severity?: "Low" | "Moderate" | "High";
  affected?: number; // % of leaves / area affected
  notes?: string;
  photo?: string; // small JPEG data URL of the leaf
  aiFinding?: string;
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
