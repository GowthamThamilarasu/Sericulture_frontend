import type { AIInsight, AlertItem, Actuator, BatchRecord, FieldActivity, MulberryBlock, CameraAnalysis, DoorSensor, Farm, FarmPlot, FarmValve, FertigationReading, FertigationSession, InstarStage, IrrigationSchedule, IrrigationSession, MulberryPlot, PhaseReading, Sensor, Shed, SilkwormBatch, VolumeSettings } from "@/types";

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

// Farms and their rearing sheds, for the batch settings.
export const farmSheds: { farm: string; sheds: string[] }[] = [
  { farm: "Kallakurichi Mulberry Center", sheds: ["Shed A1", "Shed A2"] },
  { farm: "Hosur Sericulture Unit", sheds: ["Shed H1", "Shed H2", "Shed H3"] },
  { farm: "Dharmapuri Silk Farm", sheds: ["Shed D1"] },
];

// Silkworm races and hybrids reared in Tamil Nadu, with the breed type each belongs to.
export const silkwormBreeds: { breed: string; type: string }[] = [
  { breed: "CSR2 × CSR4", type: "Bivoltine hybrid" },
  { breed: "FC1 × FC2", type: "Bivoltine hybrid" },
  { breed: "PM × CSR2", type: "Multivoltine × Bivoltine" },
  { breed: "PM × CSR4", type: "Multivoltine × Bivoltine" },
  { breed: "CSR2", type: "Bivoltine" },
  { breed: "CSR4", type: "Bivoltine" },
  { breed: "Pure Mysore", type: "Multivoltine" },
];

export const breedTypes = ["Bivoltine hybrid", "Bivoltine", "Multivoltine × Bivoltine", "Multivoltine", "Improved hybrid"];

// Rearing batches, newest first. Yield is cocoon weight for the batch; per 100 DFLs is the usual comparison.
export const batchHistory: BatchRecord[] = [
  { id: "SB-2026-014", farm: "Kallakurichi Mulberry Center", shed: "Shed A1", breed: "CSR2 × CSR4", breedType: "Bivoltine hybrid", brushedOn: "2026-10-03", instar: "Auto", harvestedOn: null, layings: 100, cocoonKg: null, grade: null, mortality: null, status: "Rearing" },
  { id: "SB-2026-013", farm: "Kallakurichi Mulberry Center", shed: "Shed A1", breed: "CSR2 × CSR4", breedType: "Bivoltine hybrid", brushedOn: "2026-08-28", instar: "Auto", harvestedOn: "2026-09-24", layings: 100, cocoonKg: 68.4, grade: "A", mortality: 3.1, status: "Harvested" },
  { id: "SB-2026-012", farm: "Kallakurichi Mulberry Center", shed: "Shed A1", breed: "CSR2 × CSR4", breedType: "Bivoltine hybrid", brushedOn: "2026-07-20", instar: "Auto", harvestedOn: "2026-08-16", layings: 100, cocoonKg: 64.2, grade: "A", mortality: 4.0, status: "Harvested" },
  { id: "SB-2026-011", farm: "Kallakurichi Mulberry Center", shed: "Shed A2", breed: "PM × CSR2", breedType: "Multivoltine × Bivoltine", brushedOn: "2026-06-10", instar: "Auto", harvestedOn: "2026-07-05", layings: 75, cocoonKg: 39.1, grade: "B", mortality: 6.2, status: "Harvested" },
  { id: "SB-2026-010", farm: "Kallakurichi Mulberry Center", shed: "Shed A1", breed: "CSR2 × CSR4", breedType: "Bivoltine hybrid", brushedOn: "2026-04-30", instar: "Auto", harvestedOn: "2026-05-27", layings: 100, cocoonKg: 61.0, grade: "A", mortality: 3.8, status: "Harvested" },
  { id: "SB-2026-009", farm: "Kallakurichi Mulberry Center", shed: "Shed A2", breed: "FC1 × FC2", breedType: "Bivoltine hybrid", brushedOn: "2026-03-22", instar: "Auto", harvestedOn: "2026-04-09", layings: 50, cocoonKg: null, grade: null, mortality: 41, status: "Failed" },
];

export const irrigationTypes = ["Drip", "Underground drip", "Sprinkler", "Micro-sprinkler / mist", "Open field (flood)", "Furrow", "Rain-fed"];
export const plantingSystems = ["Paired row", "Row system", "Pit system", "Tree / bush"];
export const leafDefects = ["Leaf spot", "Powdery mildew", "Leaf rust", "Root rot", "Tukra (mealybug)", "Thrips", "Whitefly", "Leaf roller", "Yellowing / nutrient deficiency", "Mosaic", "Other"];

export const mulberryBlocks: MulberryBlock[] = [
  { id: "blk-a", name: "Block A", variety: "V1 (Victory-1)", area: 12, irrigation: "Drip", plantingSystem: "Paired row", plantedOn: "2022-07-12", manuringEveryDays: 70 },
  { id: "blk-b", name: "Block B", variety: "S36", area: 10, irrigation: "Underground drip", plantingSystem: "Paired row", plantedOn: "2023-01-20", manuringEveryDays: 70 },
  { id: "blk-c", name: "Block C", variety: "MR2", area: 9, irrigation: "Sprinkler", plantingSystem: "Row system", plantedOn: "2021-11-05", manuringEveryDays: 75 },
];

// Field log, newest first. Spray waiting periods are demo values; follow the product label and your extension officer.
export const fieldActivities: FieldActivity[] = [
  { id: "act-10", date: "2026-10-22", blockId: "blk-b", type: "Manuring", title: "FYM second split", status: "Planned", product: "Farmyard manure", dose: "10 t/ha" },
  { id: "act-9", date: "2026-10-15", blockId: "blk-b", type: "Pest control", title: "Thrips and whitefly spray", status: "Done", product: "DDVP 76 EC", dose: "1 ml/L", waitDays: 7, notes: "Sprayed on underside of leaves, evening." },
  { id: "act-8", date: "2026-10-14", blockId: "blk-a", type: "Leaf harvest", title: "Shoot harvest for batch SB-2026-014", status: "Done", notes: "Late-age feeding." },
  { id: "act-7", date: "2026-10-12", blockId: "all", type: "Weeding", title: "Inter-row weeding", status: "Done" },
  { id: "act-6", date: "2026-10-10", blockId: "blk-a", type: "Manuring", title: "NPK split dose, crop 4", status: "Done", product: "Urea + SSP + MOP", dose: "60:24:24 kg NPK/ha" },
  { id: "act-5", date: "2026-10-09", blockId: "blk-c", type: "Medication", title: "Leaf spot treatment", status: "Done", product: "Carbendazim 50 WP", dose: "1 g/L", waitDays: 5 },
  { id: "act-4", date: "2026-10-08", blockId: "blk-c", type: "Defect", title: "Brown spots on lower leaves", status: "Done", defect: "Leaf spot", severity: "Moderate", affected: 12 },
  { id: "act-3", date: "2026-09-30", blockId: "blk-b", type: "Soil test", title: "Soil sample sent to lab", status: "Done", notes: "pH 6.8, EC normal, low zinc." },
  { id: "act-2", date: "2026-09-28", blockId: "blk-a", type: "Pruning", title: "Bottom pruning after harvest", status: "Done" },
  { id: "act-1", date: "2026-08-25", blockId: "blk-c", type: "Manuring", title: "NPK split dose, crop 3", status: "Done", product: "Urea + SSP + MOP", dose: "60:24:24 kg NPK/ha" },
];

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

// Every valve has its own flow meter and pressure sensor just after it, so both read zero while it is closed.
export const farmValves: FarmValve[] = [
  { id: "v1", name: "Valve 1", zone: "Block A", flowRate: 30, pressure: 1.6, volume: 420, infinite: false, delivered: 126, open: true },
  { id: "v2", name: "Valve 2", zone: "Block B", flowRate: 30, pressure: 1.5, volume: 390, infinite: false, delivered: 0, open: false },
  { id: "v3", name: "Valve 3", zone: "Block C", flowRate: 25, pressure: 1.4, volume: 350, infinite: false, delivered: 0, open: false },
  { id: "v4", name: "Valve 4", zone: "Nursery", flowRate: 12, pressure: 1.2, volume: 100, infinite: true, delivered: 0, open: false },
];

// Pressure sensor on the pump outlet (bar) while the pump is running.
export const pumpOutletPressure = 2.6;

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

// Devices the seller (Paari Seritech) offers, shown in Settings → Device Store. Images are the website's product photos.
export const sellerCatalog: { name: string; group: "Shed" | "Field"; image: string; summary: string; price: string }[] = [
  { name: "Shed Controller", group: "Shed", image: "/products/shed-controller.jpg", summary: "Runs fans, humidifier, heater and lights from one panel, with Auto, Semi and Manual modes.", price: "On request" },
  { name: "Environmental Sensor", group: "Shed", image: "/products/environmental-sensor.jpg", summary: "Temperature, humidity, NH₃, CO₂ and light in the rearing shed.", price: "On request" },
  { name: "Soil Moisture Sensor", group: "Field", image: "/products/soil-moisture.jpg", summary: "Soil moisture in the root zone, to drive irrigation.", price: "On request" },
  { name: "Soil Temperature Sensor", group: "Field", image: "/products/soil-temperature.jpg", summary: "Root-zone soil temperature.", price: "On request" },
  { name: "Soil EC Sensor", group: "Field", image: "/products/soil-ec.jpg", summary: "Soil salinity and nutrient level as electrical conductivity.", price: "On request" },
  { name: "Soil pH Sensor", group: "Field", image: "/products/soil-ph.jpg", summary: "Soil acidity for fertiliser planning.", price: "On request" },
  { name: "Water EC Sensor", group: "Field", image: "/products/water-ec.jpg", summary: "Irrigation and fertigation water quality.", price: "On request" },
  { name: "Flow Sensor", group: "Field", image: "/products/flow.jpg", summary: "Water flow in the irrigation line, per valve or at the pump.", price: "On request" },
  { name: "Pressure Sensor", group: "Field", image: "/products/pressure.jpg", summary: "Line pressure to confirm pumps and valves are delivering.", price: "On request" },
  { name: "Tank Level Sensor", group: "Field", image: "/products/tank-level.jpg", summary: "Water or nutrient level in storage tanks.", price: "On request" },
  { name: "Rain Sensor", group: "Field", image: "/products/rain.jpg", summary: "Detects rain so irrigation can skip a run.", price: "On request" },
  { name: "Weather Station", group: "Field", image: "/products/weather-station.jpg", summary: "Wind, rain, temperature, humidity and sunlight at the farm.", price: "On request" },
];
