import type { AIInsight, AlertItem, Actuator, CameraAnalysis, DoorSensor, Farm, FarmPlot, FarmValve, FertigationReading, FertigationSession, InstarStage, IrrigationSchedule, IrrigationSession, MulberryPlot, PhaseReading, Sensor, Shed, SilkwormBatch, VolumeSettings } from "@/types";

export const demoFarm: Farm = {
  id: "farm-1",
  name: "Kallakurichi Mulberry Center",
  location: "Tamil Nadu, India",
  latitude: 11.7383,
  longitude: 78.962,
  acres: 46,
  climate: "Semi-arid, irrigated",
};

export const demoShed: Shed = {
  id: "shed-1",
  name: "Shed A1",
  farmId: "farm-1",
  instar: "IV INSTAR",
  capacity: 12000,
  status: "Stable",
};

export const farmPlots: FarmPlot[] = [
  { id: "plot-1", name: "Block A", variety: "V1 (Victory-1)", area: 12, soilMoisture: 31, health: "Healthy" },
  { id: "plot-2", name: "Block B", variety: "S36", area: 10, soilMoisture: 29, health: "Monitor" },
  { id: "plot-3", name: "Block C", variety: "MR2", area: 9, soilMoisture: 34, health: "Healthy" },
];

export const sensorReadings: Sensor[] = [
  { id: "s-1", name: "Soil Moisture", unit: "%", value: 31, status: "Demo", timestamp: "Updated 10 sec ago", location: "Block A" },
  { id: "s-2", name: "Soil Temperature", unit: "°C", value: 27.2, status: "Normal", timestamp: "Updated 10 sec ago", location: "Block A" },
  { id: "s-3", name: "Soil EC", unit: "mS/cm", value: 0.82, status: "Normal", timestamp: "Updated 10 sec ago", location: "Block A" },
  { id: "s-4", name: "Soil pH", unit: "pH", value: 6.7, status: "Normal", timestamp: "Updated 10 sec ago", location: "Block A" },
  { id: "s-5", name: "Water Tank", unit: "%", value: 72, status: "Normal", timestamp: "Updated 10 sec ago", location: "Main Tank" },
  { id: "s-6", name: "Temperature", unit: "°C", value: 26.4, status: "Normal", timestamp: "Updated 10 sec ago", location: "Shed A1" },
  { id: "s-7", name: "Relative Humidity", unit: "%", value: 73, status: "Normal", timestamp: "Updated 10 sec ago", location: "Shed A1" },
  { id: "s-8", name: "NH3", unit: "ppm", value: 4.2, status: "Warning", timestamp: "Updated 10 sec ago", location: "Shed A1" },
  { id: "s-9", name: "CO2", unit: "ppm", value: 720, status: "Normal", timestamp: "Updated 10 sec ago", location: "Shed A1" },
  { id: "s-10", name: "Light", unit: "Lux", value: 18, status: "Normal", timestamp: "Updated 10 sec ago", location: "Shed A1" },
];

export const irrigationHistory = [
  { time: "00:00", value: 36 }, { time: "06:00", value: 34 }, { time: "08:00", value: 32 }, { time: "12:00", value: 31 }, { time: "18:00", value: 29 }, { time: "20:00", value: 30 }, { time: "23:00", value: 31 },
];

export const soilMoistureHistory = [
  { time: "Mon", value: 28 }, { time: "Tue", value: 30 }, { time: "Wed", value: 31 }, { time: "Thu", value: 29 }, { time: "Fri", value: 27 }, { time: "Sat", value: 32 }, { time: "Sun", value: 31 },
];

export const temperatureHistory = [
  { time: "06:00", value: 24.8 }, { time: "08:00", value: 25.2 }, { time: "10:00", value: 26.1 }, { time: "12:00", value: 26.8 }, { time: "14:00", value: 27.1 }, { time: "16:00", value: 26.5 }, { time: "18:00", value: 26.4 },
];

export const ecHistory = [
  { time: "Mon", value: 0.65 }, { time: "Tue", value: 0.71 }, { time: "Wed", value: 0.76 }, { time: "Thu", value: 0.74 }, { time: "Fri", value: 0.78 }, { time: "Sat", value: 0.82 }, { time: "Sun", value: 0.81 },
];

export const waterLevelHistory = [
  { time: "Jan", value: 54 }, { time: "Feb", value: 58 }, { time: "Mar", value: 62 }, { time: "Apr", value: 69 }, { time: "May", value: 72 }, { time: "Jun", value: 67 }, { time: "Jul", value: 72 },
];

export const alertItems: AlertItem[] = [
  { id: "a1", severity: "Warning", parameter: "NH3", value: "4.2 ppm", timestamp: "09:18", location: "Shed A1", recommendedAction: "Increase ventilation and inspect the bed.", status: "Open" },
  { id: "a2", severity: "Information", parameter: "RH", value: "73%", timestamp: "09:15", location: "Shed A1", recommendedAction: "Maintain within instar target range.", status: "Open" },
  { id: "a3", severity: "AI Recommendation", parameter: "Irrigation", value: "420 L", timestamp: "09:10", location: "Block A", recommendedAction: "Approve irrigation schedule.", status: "Review" },
  { id: "a4", severity: "Sensor Failure", parameter: "CO2", value: "offline", timestamp: "08:50", location: "Shed A1", recommendedAction: "Check sensor calibration and wiring.", status: "Open" },
];

export const aiInsights: AIInsight[] = [
  { id: "ai1", title: "IRRIGATION PREDICTION", summary: "AI predicts soil will reach critical moisture in approximately 8 hours.", detail: "Moisture trend suggests the next irrigation cycle should be reviewed before late afternoon.", badge: "AI DEMO" },
  { id: "ai2", title: "WATER REQUIREMENT", summary: "Recommended irrigation: 420 L. Expected requirement tomorrow: 350 L.", detail: "Rain probability is high and watering should be optimized accordingly.", badge: "SIMULATED INSIGHT" },
  { id: "ai3", title: "FERTIGATION", summary: "Current EC 0.72, target EC 1.05. Fertilization required: Yes.", detail: "Agronomist-approved dose recommendation is available for farmer review.", badge: "DEMO RECOMMENDATION" },
  { id: "ai4", title: "MULBERRY HEALTH", summary: "Leaf colour and density remain stable; damage is low.", detail: "Growth variation remains controlled within expected range for this stage.", badge: "AI DEMO" },
  { id: "ai5", title: "SILKWORM RISK", summary: "Risk zone score 18 / 100; stress risk moderate.", detail: "Environmental factors and ventilation conditions should be reviewed with the farmer.", badge: "DEMO AI INSIGHT" },
];

export const actuators: Actuator[] = [
  { id: "a-1", name: "Water Pump", status: "OFF", mode: "AUTO", lastAction: "2h ago" },
  { id: "a-2", name: "Solenoid Valve", status: "OFF", mode: "SCHEDULED", lastAction: "30m ago" },
  { id: "a-3", name: "Exhaust Fans", status: "ON", mode: "AUTO", lastAction: "5m ago" },
  { id: "a-4", name: "Humidifier", status: "OFF", mode: "MANUAL", lastAction: "1h ago" },
  { id: "a-5", name: "Heater", status: "OFF", mode: "AUTO", lastAction: "20m ago" },
];

export const silkwormBatch: SilkwormBatch = {
  id: "batch-1",
  instar: "IV",
  condition: "Good",
  riskZone: 18,
  stressRisk: "Moderate",
  temperature: 26.4,
  humidity: 73,
  nh3: 4.2,
  co2: 720,
  ventilation: "Insufficient",
  feeding: "On schedule",
  bedCondition: "Stable",
  cleaning: "Scheduled",
  mortality: "Low",
  mulberryQuality: "Good",
};

export const mulberryPlots: MulberryPlot[] = [
  { id: "m1", variety: "V1 (Victory-1)", growthStage: "Active canopy growth", leafSize: "Medium", leafColour: "Green", leafDensity: "Consistent", visibleDamage: "Low", growthVariation: "Normal", soilCondition: "Balanced", irrigation: "Scheduled", fertilization: "Approved" },
  { id: "m2", variety: "S36", growthStage: "Leaf expansion", leafSize: "Medium-large", leafColour: "Deep green", leafDensity: "Moderate", visibleDamage: "Minimal", growthVariation: "Minor variation", soilCondition: "Stable", irrigation: "On track", fertilization: "Monitoring" },
];

export const irrigationSessions: IrrigationSession[] = [
  { id: "i1", duration: "42 min", waterUsed: 420, start: "08:15", status: "Successful" },
  { id: "i2", duration: "38 min", waterUsed: 390, start: "Yesterday 17:40", status: "Successful" },
  { id: "i3", duration: "46 min", waterUsed: 470, start: "2 days ago 18:20", status: "Successful" },
];

export const fertigationSessions: FertigationSession[] = [
  { id: "f1", recipe: "Agronomist approved nutrient blend", ecTarget: 1.05, dose: 84, status: "Ready" },
  { id: "f2", recipe: "Balanced nutrient infusion", ecTarget: 1.02, dose: 76, status: "Scheduled" },
];

export const doorSensor: DoorSensor = { location: "Shed A1 main door", state: "Closed", since: "08:42", openedToday: 6 };

export const farmValves: FarmValve[] = [
  { id: "v1", name: "Valve 1", zone: "Block A", flowRate: 30, volume: 420, infinite: false, delivered: 126, open: true },
  { id: "v2", name: "Valve 2", zone: "Block B", flowRate: 30, volume: 390, infinite: false, delivered: 0, open: false },
  { id: "v3", name: "Valve 3", zone: "Block C", flowRate: 25, volume: 350, infinite: false, delivered: 0, open: false },
  { id: "v4", name: "Valve 4", zone: "Nursery", flowRate: 12, volume: 100, infinite: true, delivered: 0, open: false },
];

// Nutrient solution readings; TDS follows EC (ppm ≈ EC mS/cm × 640).
export const fertigationReadings: FertigationReading[] = [
  { key: "ph", label: "pH", name: "Water pH", unit: "", value: 6.4, min: 5.8, max: 6.8, decimals: 1 },
  { key: "tds", label: "TDS", name: "Total dissolved solids", unit: "ppm", value: 653, min: 575, max: 770, decimals: 0 },
  { key: "ec", label: "EC", name: "Electrical conductivity", unit: "mS/cm", value: 1.02, min: 0.9, max: 1.2, decimals: 2 },
  { key: "n", label: "N", name: "Nitrogen", unit: "ppm", value: 148, min: 120, max: 180, decimals: 0 },
  { key: "p", label: "P", name: "Phosphorus", unit: "ppm", value: 46, min: 35, max: 60, decimals: 0 },
  { key: "k", label: "K", name: "Potassium", unit: "ppm", value: 182, min: 150, max: 220, decimals: 0 },
];

export const cameraAnalyses: CameraAnalysis[] = [
  { id: "cam-s", name: "Silkworm", status: "Future Module", metrics: ["Larvae count", "Activity", "Size variation", "Growth", "Abnormal behaviour", "Mortality"] },
  { id: "cam-m", name: "Mulberry", status: "Future Module", metrics: ["Leaf colour", "Leaf area", "Plant growth", "Damage", "Canopy"] },
  { id: "cam-c", name: "Cocoon", status: "Future Module", metrics: ["Size", "Shape", "Colour", "Defects", "Batch quality", "Weight correlation"] },
];

export const instarStages: InstarStage[] = [
  { stage: "1st & 2nd Instar", temperature: "27–28 °C", humidity: "85–90% RH", description: "Early larval stability" },
  { stage: "3rd Instar", temperature: "26–27 °C", humidity: "75–80% RH", description: "Growth acceleration" },
  { stage: "4th & 5th Instar", temperature: "25–26 °C", humidity: "70–75% RH", description: "Late-stage care and ventilation" },
];

export const knowledgeSections = {
  mulberry: ["V1 (Victory-1)", "S36", "S1635", "M5 / K2", "MR2", "DD", "S1", "S13", "S34", "Vishala", "Anantha", "C-2038", "G4"],
  silkworm: ["Multivoltine", "Bivoltine", "Bivoltine hybrids", "Multivoltine × Bivoltine hybrids", "Improved hybrids"],
  tamilNadu: ["Pure Mysore", "CSR2", "CSR4", "CSR2 × CSR4", "PM × CSR2", "PM × CSR4"],
};

export const irrigationSchedules: IrrigationSchedule[] = [
  { id: "sch-1", valveId: "v1", start: "06:00", days: ["Mon", "Wed", "Fri"], limit: "volume", volume: 420, duration: 15, enabled: true },
  { id: "sch-2", valveId: "v2", start: "06:30", days: ["Tue", "Thu", "Sat"], limit: "volume", volume: 390, duration: 14, enabled: true },
  { id: "sch-3", valveId: "v3", start: "17:30", days: ["Mon", "Thu"], limit: "duration", volume: 350, duration: 14, enabled: false },
  { id: "sch-4", valveId: "v4", start: "07:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], limit: "duration", volume: 100, duration: 8, enabled: true },
];

export const volumeSettings: VolumeSettings = {
  dailyBudget: 1600,
  perCycle: { v1: 420, v2: 390, v3: 350, v4: 100 },
  tankReserve: 30,
  maxFlow: 90,
};

// Pump panel supply: 415 V line / 240 V phase nominal, motor running near 5 HP.
export const phaseReadings: PhaseReading[] = [
  { phase: "R", voltage: 236.4, current: 6.2, powerFactor: 0.86 },
  { phase: "Y", voltage: 233.1, current: 6.0, powerFactor: 0.85 },
  { phase: "B", voltage: 238.2, current: 6.4, powerFactor: 0.86 },
];

// Energy used by the pump panel in each hour today (kWh).
export const powerHistory = [
  { time: "05:00", value: 0.2 }, { time: "06:00", value: 3.4 }, { time: "07:00", value: 3.1 }, { time: "08:00", value: 1.2 }, { time: "09:00", value: 0.3 }, { time: "10:00", value: 0.2 },
  { time: "11:00", value: 0.2 }, { time: "12:00", value: 0.3 }, { time: "13:00", value: 0.2 }, { time: "14:00", value: 0.2 }, { time: "15:00", value: 0.4 }, { time: "16:00", value: 0.3 },
  { time: "17:00", value: 2.9 }, { time: "18:00", value: 1.6 },
];

export const pumpProtection = { runHoursToday: 2.6, runHoursTotal: 1842, starts: 4, lastTrip: "None in 30 days" };
