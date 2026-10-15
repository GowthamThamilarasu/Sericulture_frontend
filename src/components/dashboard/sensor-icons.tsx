// Sensor icons drawn for the dashboard, in the same 24px outline style as lucide-react
// so they sit alongside its icons and take the same className/style props.

type IconProps = React.SVGProps<SVGSVGElement>;

function SensorSvg({ children, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

// Water drop above a soil line.
export function SoilMoistureIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M12 2.5c-2.3 2.7-3.5 4.6-3.5 6.3a3.5 3.5 0 0 0 7 0c0-1.7-1.2-3.6-3.5-6.3z" />
      <path d="M3 15.5h18" />
      <path d="M5.5 19h2M11 19h2M16.5 19h2M8.5 22h2M13.5 22h2" />
    </SensorSvg>
  );
}

// Tank with a wavy water line.
export function WaterLevelIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M4.5 11.5c1.25-.9 2.5-.9 3.75 0s2.5.9 3.75 0 2.5-.9 3.75 0 2.5.9 3.75 0" />
      <path d="M8.5 16h7" />
    </SensorSvg>
  );
}

// Thermometer with a scale.
export function TemperatureIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M9 13.5V5a3 3 0 0 1 6 0v8.5a4.5 4.5 0 1 1-6 0z" />
      <path d="M12 16.5V8" />
      <path d="M18.5 5h2M18.5 8.5h2M18.5 12h2" />
    </SensorSvg>
  );
}

// Water drop with a percent sign: relative humidity.
export function HumidityIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M12 2.5C8.4 7 6 10.4 6 14a6 6 0 0 0 12 0c0-3.6-2.4-7-6-11.5z" />
      <path d="M9.8 17.2l4.4-5" />
      <circle cx="9.3" cy="12.3" r="0.4" fill="currentColor" />
      <circle cx="14.7" cy="17.1" r="0.4" fill="currentColor" />
    </SensorSvg>
  );
}

// Thermometer and drop together, for the temperature & humidity chart.
export function ClimateIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M6 13V5a2.5 2.5 0 0 1 5 0v8a4 4 0 1 1-5 0z" />
      <path d="M8.5 16V9" />
      <path d="M17.5 8c-1.7 2.1-2.7 3.6-2.7 4.9a2.7 2.7 0 0 0 5.4 0c0-1.3-1-2.8-2.7-4.9z" />
    </SensorSvg>
  );
}

// Thermometer pushed into the soil.
export function SoilTemperatureIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M10 10.5V4.5a2 2 0 0 1 4 0v6a3.5 3.5 0 1 1-4 0z" />
      <path d="M12 13V8" />
      <path d="M3 15.5h4.5M16.5 15.5H21" />
      <path d="M4.5 19h2M17.5 19h2M8.5 22h2M13.5 22h2" />
    </SensorSvg>
  );
}

// Two-pronged conductivity probe in the soil with a spark between the prongs.
export function SoilEcIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <rect x="5.5" y="2" width="13" height="5" rx="1.5" />
      <path d="M8 7v12M16 7v12" />
      <path d="M12.8 8.5 11 11.5h2.2L11.4 14.5" />
      <path d="M2.5 15.5h3M18.5 15.5h3" />
      <path d="M3 19h2M19 19h2" />
    </SensorSvg>
  );
}

// pH meter: body with a display, probe tip in the soil.
export function SoilPhIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <rect x="8" y="2" width="8" height="10" rx="2" />
      <path d="M10.5 5h3" />
      <path d="M12 12v5.5" />
      <circle cx="12" cy="19.5" r="1.5" />
      <path d="M3 17.5h5M16 17.5h5" />
    </SensorSvg>
  );
}

// Gas cloud holding a carbon dioxide molecule (O-C-O).
export function Co2Icon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M17.5 20H8a6.5 6.5 0 1 1 6.3-8.2h3.2a4.1 4.1 0 1 1 0 8.2z" />
      <circle cx="8" cy="15.6" r="1" fill="currentColor" />
      <circle cx="12.5" cy="15.6" r="1.3" fill="currentColor" />
      <circle cx="17" cy="15.6" r="1" fill="currentColor" />
      <path d="M9 15.6h2.2M13.8 15.6H16" strokeWidth="1.5" />
    </SensorSvg>
  );
}

// Ammonia molecule: one nitrogen bonded to three hydrogens.
export function Nh3Icon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <circle cx="12" cy="9" r="3" />
      <circle cx="4.5" cy="17" r="2" />
      <circle cx="19.5" cy="17" r="2" />
      <circle cx="12" cy="20.5" r="2" />
      <path d="M9.9 11.2 6 15.5M14.1 11.2l3.9 4.3M12 12v6.5" />
    </SensorSvg>
  );
}

// Light sensor: a dome with rays.
export function LightSensorIcon(props: IconProps) {
  return (
    <SensorSvg {...props}>
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="M4 18h16" />
      <path d="M12 9.5V7M6.3 11.8 4.6 10.1M17.7 11.8l1.7-1.7M3 14.5h2.5M18.5 14.5H21" />
      <path d="M9 21.5h6" />
    </SensorSvg>
  );
}
