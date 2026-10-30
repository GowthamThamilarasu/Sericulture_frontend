import { useId } from "react";

// Small animated illustrations for each silk production step. Animation classes (.sc-*) live in globals.css;
// every element's resting style is its final state, so reduced-motion visitors still see a complete picture.

const leafPath = "M0 0 C -9 -5 -13 -18 0 -30 C 13 -18 9 -5 0 0 Z";

function Leaf({ x, y, rotate, delay, scale = 1 }: { x: number; y: number; rotate: number; delay: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <g className="sc sc-pop" style={{ animationDelay: `${delay}s`, transformOrigin: "50% 100%" }}>
        <g className="sc sc-sway" style={{ animationDelay: `${delay + 0.6}s`, transformOrigin: "50% 100%" }}>
          <path d={leafPath} fill="#5fae4e" stroke="#2f7a34" strokeWidth="1.2" />
          <path d="M0 0 V-27" stroke="#2f7a34" strokeWidth="0.9" />
        </g>
      </g>
    </g>
  );
}

function Mulberry() {
  return (
    <>
      <g className="sc sc-spin">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line key={angle} x1="200" y1="14" x2="200" y2="8" stroke="#f0c75e" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle} 200 30)`} />
        ))}
      </g>
      <circle cx="200" cy="30" r="10" fill="#f6d37a" />

      <path d="M14 24 H118" stroke="#6b8f71" strokeWidth="4" strokeLinecap="round" />
      {[52, 86].map((x, index) => (
        <g key={x}>
          <rect x={x - 2} y="25" width="4" height="5" rx="1" fill="#6b8f71" />
          {[0, 0.7].map((offset) => (
            <circle key={offset} className="sc sc-drop" cx={x} cy="33" r="2.4" fill="#6fbde3" style={{ animationDelay: `${index * 0.35 + offset}s` }} />
          ))}
        </g>
      ))}

      <ellipse cx="120" cy="148" rx="92" ry="9" fill="#a5825a" opacity="0.28" />
      <path d="M78 148 Q120 132 162 148 Z" fill="#8f6c46" opacity="0.55" />

      <path className="sc-draw" pathLength={1} d="M120 146 C 117 122, 124 100, 120 58" stroke="#3f7d3a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path className="sc-draw" pathLength={1} style={{ animationDelay: "0.6s" }} d="M120 112 C 110 106, 101 102, 92 100" stroke="#3f7d3a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path className="sc-draw" pathLength={1} style={{ animationDelay: "0.8s" }} d="M120 94 C 131 88, 140 86, 150 84" stroke="#3f7d3a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path className="sc-draw" pathLength={1} style={{ animationDelay: "1s" }} d="M120 76 C 112 70, 106 66, 100 62" stroke="#3f7d3a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <Leaf x={92} y={100} rotate={-70} delay={1.1} />
      <Leaf x={150} y={84} rotate={68} delay={1.3} />
      <Leaf x={100} y={62} rotate={-55} delay={1.5} scale={0.85} />
      <Leaf x={120} y={60} rotate={8} delay={1.7} scale={0.9} />
      <Leaf x={134} y={110} rotate={60} delay={1.9} scale={0.8} />
    </>
  );
}

function Harvest() {
  return (
    <>
      {[
        { x: 96, delay: 0, rotate: 20 },
        { x: 128, delay: 1.1, rotate: -30 },
        { x: 110, delay: 2.2, rotate: 50 },
      ].map((leaf) => (
        <g key={leaf.x} transform={`translate(${leaf.x} 8)`}>
          <g className="sc sc-fall" style={{ animationDelay: `${leaf.delay}s` }}>
            <g transform={`rotate(${leaf.rotate})`}>
              <path d={leafPath} fill="#6fbf5a" stroke="#2f7a34" strokeWidth="1.2" />
              <path d="M0 0 V-27" stroke="#2f7a34" strokeWidth="0.9" />
            </g>
          </g>
        </g>
      ))}

      <g>
        {[-36, -18, 0, 18, 36].map((dx, index) => (
          <g key={dx} transform={`translate(${120 + dx} ${118 - (index % 2) * 4}) rotate(${dx * 2})`}>
            <path d={leafPath} fill={index % 2 ? "#4f9d45" : "#62b152"} stroke="#2f7a34" strokeWidth="1" />
          </g>
        ))}
      </g>
      <path d="M66 116 H174 L162 152 H78 Z" fill="#c99a5a" stroke="#9c7136" strokeWidth="1.5" />
      {[126, 136, 146].map((y) => (
        <path key={y} d={`M${70 + (y - 116) * 0.33} ${y} H${170 - (y - 116) * 0.33}`} stroke="#9c7136" strokeWidth="1" opacity="0.7" />
      ))}
      {[88, 104, 120, 136, 152].map((x) => (
        <path key={x} d={`M${x} 116 L${x + (120 - x) * 0.1} 152`} stroke="#9c7136" strokeWidth="1" opacity="0.5" />
      ))}
      <path d="M62 116 H178" stroke="#9c7136" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function Rearing({ id }: { id: string }) {
  return (
    <>
      <defs>
        {/* Bites appear one by one as holes in the leaf edge. */}
        <mask id={`${id}-bites`}>
          <rect width="240" height="160" fill="#fff" />
          {[
            { cx: 150, cy: 99, delay: 1 },
            { cx: 166, cy: 102, delay: 2.2 },
            { cx: 182, cy: 107, delay: 3.4 },
          ].map((bite) => (
            <circle key={bite.cx} className="sc sc-pop" cx={bite.cx} cy={bite.cy} r="8" fill="#000" style={{ animationDelay: `${bite.delay}s` }} />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id}-bites)`}>
        <path d="M16 132 C 60 92, 170 88, 226 122 C 170 150, 70 154, 16 132 Z" fill="#5fae4e" stroke="#2f7a34" strokeWidth="1.5" />
        <path d="M22 131 C 90 118, 160 118, 220 122" stroke="#2f7a34" strokeWidth="1.2" fill="none" />
      </g>

      <g className="sc sc-crawl">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <g key={index} className="sc sc-hump" style={{ animationDelay: `${(6 - index) * 0.12}s` }}>
            <circle cx={60 + index * 9} cy="112" r={index === 6 ? 7.5 : 6 + index * 0.25} fill="#f6f1e4" stroke="#d6cbb0" strokeWidth="1" />
            {index < 6 && <path d={`M${60 + index * 9} 106 v12`} stroke="#e4dac2" strokeWidth="0.8" />}
          </g>
        ))}
        <g className="sc sc-hump">
          <circle cx="114" cy="112" r="6" fill="#ece3cd" stroke="#cbbf9f" strokeWidth="1" />
          <circle cx="116.5" cy="110" r="1.3" fill="#2d2a24" />
        </g>
      </g>

      <g transform="translate(24 22)">
        <text x="0" y="0" fontSize="9" fontWeight="700" fill="#1d5c35" letterSpacing="1.5">INSTAR</text>
        {["I", "II", "III", "IV", "V"].map((label, index) => (
          <g key={label} transform={`translate(${index * 22} 10)`}>
            <circle className="sc-fill" cx="8" cy="8" r="8" fill="#1d8a3d" style={{ animationDelay: `${0.4 + index * 0.7}s` }} />
            <text x="8" y="11" fontSize="7.5" fontWeight="700" textAnchor="middle" fill="#fff">{label}</text>
          </g>
        ))}
      </g>
    </>
  );
}

function Cocoon() {
  return (
    <>
      <path d="M24 34 C 80 24, 160 26, 218 40" stroke="#8a6a45" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M150 28 c 6 -10 18 -12 24 -6 c -8 2 -14 4 -24 6 z" fill="#5fae4e" />
      <path d="M120 31 V54" stroke="#e7dcc0" strokeWidth="1.2" />
      <ellipse className="sc sc-fade" cx="120" cy="88" rx="24" ry="36" fill="#fbf6e9" stroke="#d9cba9" strokeWidth="1.2" />
      {[-48, -24, 0, 24, 48].map((angle, index) => (
        <ellipse
          key={angle}
          className="sc-draw"
          pathLength={1}
          cx="120"
          cy="88"
          rx="23"
          ry="34"
          fill="none"
          stroke="#e2d6b8"
          strokeWidth="1"
          transform={`rotate(${angle} 120 88)`}
          style={{ animationDelay: `${0.3 + index * 0.45}s`, animationDuration: "1.2s" }}
        />
      ))}
      <path d="M58 146 H182" stroke="#c99a5a" strokeWidth="5" strokeLinecap="round" />
      {[84, 104, 136, 156].map((x, index) => (
        <ellipse key={x} className="sc sc-pop" cx={x} cy="137" rx="9" ry="7" fill="#fbf6e9" stroke="#d9cba9" style={{ animationDelay: `${2.8 + index * 0.25}s` }} />
      ))}
    </>
  );
}

function Reeling() {
  return (
    <>
      {[72, 96, 120].map((x, index) => (
        <path key={x} className="sc sc-steam" d={`M${x} 92 c -6 -8 6 -14 0 -22 c -6 -8 6 -14 0 -22`} stroke="#c9dde6" strokeWidth="2" strokeLinecap="round" fill="none" style={{ animationDelay: `${index * 0.8}s` }} />
      ))}
      <path d="M30 104 H162 Q156 150 96 150 Q36 150 30 104 Z" fill="#d6ecf6" stroke="#9cc6d8" strokeWidth="1.5" />
      <ellipse cx="96" cy="104" rx="66" ry="7" fill="#bfe1f0" stroke="#9cc6d8" strokeWidth="1.2" />
      {[70, 96, 122].map((x, index) => (
        <ellipse key={x} className="sc sc-bob" cx={x} cy="104" rx="10" ry="7" fill="#fbf6e9" stroke="#d9cba9" style={{ animationDelay: `${index * 0.5}s` }} />
      ))}
      <path className="sc-flow" d="M70 100 C 110 70, 150 52, 196 52 M96 100 C 126 74, 160 56, 196 52 M122 100 C 146 78, 172 60, 196 52" stroke="#c99a2e" strokeWidth="1" strokeDasharray="4 3" fill="none" />
      <path d="M196 52 L222 128 M196 52 L170 128" stroke="#9c7136" strokeWidth="3" strokeLinecap="round" />
      <g className="sc sc-spin">
        <circle cx="196" cy="52" r="20" fill="#f6efdc" stroke="#c99a2e" strokeWidth="2" />
        <circle cx="196" cy="52" r="13" fill="none" stroke="#e2bd5c" strokeWidth="6" />
        {[0, 60, 120].map((angle) => (
          <line key={angle} x1="176" y1="52" x2="216" y2="52" stroke="#9c7136" strokeWidth="1.5" transform={`rotate(${angle} 196 52)`} />
        ))}
      </g>
      <circle cx="196" cy="52" r="3" fill="#9c7136" />
    </>
  );
}

function Fabric({ id }: { id: string }) {
  const shapeA = "M28 42 C 80 20, 140 62, 212 36 L212 122 C 150 146, 90 104, 28 130 Z";
  const shapeB = "M28 48 C 90 68, 150 22, 212 46 L212 128 C 140 102, 80 146, 28 120 Z";
  return (
    <>
      <defs>
        <linearGradient id={`${id}-silk`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8740a" />
          <stop offset="0.35" stopColor="#e2bd5c" />
          <stop offset="0.6" stopColor="#f6dc94" />
          <stop offset="1" stopColor="#b9862a" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={shapeA}>
            <animate attributeName="d" dur="4s" repeatCount="indefinite" values={`${shapeA};${shapeB};${shapeA}`} calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
          </path>
        </clipPath>
      </defs>
      <path d={shapeA} fill={`url(#${id}-silk)`}>
        <animate attributeName="d" dur="4s" repeatCount="indefinite" values={`${shapeA};${shapeB};${shapeA}`} calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
      </path>
      <g clipPath={`url(#${id}-clip)`}>
        <rect className="sc sc-shimmer" x="0" y="0" width="50" height="160" fill={`url(#${id}-shine)`} transform="skewX(-20)" />
      </g>
      <path d="M28 130 C 40 140, 46 150, 40 156" stroke="#a8740a" strokeWidth="1" fill="none" opacity="0.6" />
      {[
        { x: 52, y: 26, delay: 0 },
        { x: 190, y: 22, delay: 0.6 },
        { x: 204, y: 140, delay: 1.2 },
        { x: 120, y: 148, delay: 0.9 },
      ].map((star) => (
        <path
          key={star.x}
          className="sc sc-twinkle"
          d={`M${star.x} ${star.y - 7} L${star.x + 2} ${star.y - 2} L${star.x + 7} ${star.y} L${star.x + 2} ${star.y + 2} L${star.x} ${star.y + 7} L${star.x - 2} ${star.y + 2} L${star.x - 7} ${star.y} L${star.x - 2} ${star.y - 2} Z`}
          fill="#e2bd5c"
          style={{ animationDelay: `${star.delay}s` }}
        />
      ))}
    </>
  );
}

export function ProcessScene({ index, label }: { index: number; label: string }) {
  const id = useId().replace(/:/g, "");
  const scenes = [<Mulberry key="0" />, <Harvest key="1" />, <Rearing key="2" id={id} />, <Cocoon key="3" />, <Reeling key="4" />, <Fabric key="5" id={id} />];
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={`Animated illustration: ${label}`} className="h-full w-full">
      {scenes[index]}
    </svg>
  );
}
