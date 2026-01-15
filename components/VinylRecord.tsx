import React, { useMemo } from 'react';
import type { DesignConfig } from '../types.ts';
import { useDesign } from '../context/DesignContext.tsx';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.random() * (max-min) + min;

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const GlitchVinyl: React.FC<{config: DesignConfig['vinyl'], size: number, center: number}> = ({config, size, center}) => {
    return useMemo(() => {
    const paths = [];
    const maxRadius = (size / 2) - config.clipMargin;
    const baseInnerRadius = size * 0.05;
    const availableRadius = maxRadius - baseInnerRadius;
    const step = availableRadius / Math.max(1, config.ringCount);

    for (let i = 0; i < config.ringCount; i++) {
      const radius = baseInnerRadius + step * (i + 0.5);
      const segments = 3;
      const angleCursor = Math.random() * 360;
      const span = 360 / segments - config.lineGap;
      
      for (let j = 0; j < segments; j++) {
        const startAngle = angleCursor + j * (360/segments);
        const color = config.neon 
            ? `hsl(${randInt(0, 360)}, 100%, 80%)`
            : config.lineColor;
        paths.push(
          <path 
            key={`ring-${i}-seg-${j}`} d={describeArc(center, center, radius, startAngle, startAngle + span)} 
            fill="none" stroke={color} strokeWidth={config.lineWidth}
            style={{ filter: config.glowIntensity > 0 ? `drop-shadow(0 0 ${config.glowIntensity}px ${color})` : 'none' }}
          />
        );
      }
    }
    return <>{paths}</>;
  }, [config, size, center]);
}

const ClassicGrooves: React.FC<{size: number, center: number}> = ({size, center}) => {
    const rings = [];
    for(let i=0; i < 15; i++) {
        rings.push(<circle key={i} cx={center} cy={center} r={size * 0.18 + i * (size*0.02)} fill="none" stroke="#cccccc" strokeWidth="0.5" />)
    }
    return <>{rings}</>;
}

const CassetteHubs: React.FC<{size: number, center: number}> = ({size, center}) => {
    const hub = (cx: number) => (
        <g>
            <circle cx={cx} cy={center} r={size * 0.15} fill="none" stroke="#999999" strokeWidth="3" />
            <circle cx={cx} cy={center} r={size * 0.05} fill="none" stroke="#999999" strokeWidth="2" />
            {Array(6).fill(0).map((_, i) => {
                const angle = i * 60 * Math.PI/180;
                return (<line key={i} x1={cx + Math.cos(angle) * size * 0.05} y1={center + Math.sin(angle) * size * 0.05} x2={cx + Math.cos(angle) * size * 0.13} y2={center + Math.sin(angle) * size * 0.13} stroke="#999999" strokeWidth="2" />)
            })}
        </g>
    );
    return <> {hub(center - size*0.2)} {hub(center + size*0.2)} </>;
}

const Soundwave: React.FC<{size: number, center: number, config: DesignConfig['vinyl']}> = ({size, center, config}) => {
    return useMemo(() => {
        const paths = [];
        const baseRadius = size * 0.2;
        const maxAmplitude = size * (config.soundwaveAmplitude / 100);
        const color = config.neon ? `hsl(${randInt(0,360)}, 90%, 70%)` : config.lineColor;
        let pathData = "M";
        for (let angle=0; angle <= 360; angle += (360 / config.soundwavePoints)) {
            const randomAmplitude = maxAmplitude * Math.random();
            const radius = baseRadius + Math.sin(angle * 0.1 * Math.PI/180 * config.soundwaveFrequency) * randomAmplitude;
            const point = polarToCartesian(center, center, radius, angle);
            pathData += ` ${point.x},${point.y}`;
        }
        pathData += " Z";
        paths.push(<path key="wave" d={pathData} fill="none" stroke={color} strokeWidth={config.lineWidth} />);
        return paths;
    }, [size, center, config]);
}

const Equalizer: React.FC<{size: number, center: number, config: DesignConfig['vinyl']}> = ({size, center, config}) => {
    return useMemo(() => {
        const elements = [];
        const numBars = config.equalizerBars;
        const angleStep = 360 / numBars;
        const maxBarHeight = size * (config.equalizerMaxHeight / 100);
        const baseRadius = size * 0.25;
        for (let i = 0; i < numBars; i++) {
            const startAngle = i * angleStep;
            const endAngle = (i + 0.5) * angleStep;
            const barHeight = maxBarHeight * randFloat(0.1, 1);
            const hue = (startAngle / 360 * 150 + 180) % 360;
            const color = config.neon ? `hsl(${hue}, 90%, 70%)` : config.lineColor;
            elements.push(<path key={i} d={describeArc(center, center, baseRadius, startAngle, endAngle)} stroke={color} strokeWidth={barHeight} fill="none" />)
        }
        return elements;
    }, [size, center, config]);
}

const Sunburst: React.FC<{size: number, center: number, config: DesignConfig['vinyl']}> = ({size, center, config}) => {
    return useMemo(() => {
        const elements = [];
        const numLines = config.sunburstLines;
        for(let i=0; i < numLines; i++) {
            const angle = i * (360 / numLines);
            const start = polarToCartesian(center, center, size * 0.18, angle);
            const end = polarToCartesian(center, center, size * randFloat(0.3, 0.45), angle);
            const color = config.neon ? `hsl(${angle}, 80%, 75%)` : config.lineColor;
            elements.push(<line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={config.lineWidth} />)
        }
        return elements;
    }, [size, center, config]);
}

const GridStyle: React.FC<{size: number, config: DesignConfig['vinyl']}> = ({size, config}) => {
    return useMemo(() => {
        const lines = [];
        const step = size / config.gridDensity;
        const color = config.lineColor;
        for(let i=0; i <= config.gridDensity; i++) {
            lines.push(<line key={`v-${i}`} x1={i * step} y1={0} x2={i * step} y2={size} stroke={color} strokeWidth={config.lineWidth} opacity="0.3" />);
            lines.push(<line key={`h-${i}`} x1={0} y1={i * step} x2={size} y2={i * step} stroke={color} strokeWidth={config.lineWidth} opacity="0.3" />);
        }
        return <>{lines}</>;
    }, [size, config]);
}

const LissajousStyle: React.FC<{size: number, center: number, config: DesignConfig['vinyl']}> = ({size, center, config}) => {
    return useMemo(() => {
        const points = [];
        const a = 3, b = 2, delta = Math.PI / 2;
        const R = size * 0.4;
        for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
            const x = center + R * Math.sin(a * t + delta);
            const y = center + R * Math.sin(b * t);
            points.push(`${x},${y}`);
        }
        return <polyline points={points.join(' ')} fill="none" stroke={config.lineColor} strokeWidth={config.lineWidth} />;
    }, [size, center, config]);
}

const NebulaStyle: React.FC<{size: number, center: number}> = ({size, center}) => {
    return useMemo(() => {
        const blobs = [];
        for (let i = 0; i < 5; i++) {
            const r = size * randFloat(0.1, 0.3);
            const x = center + randFloat(-size*0.2, size*0.2);
            const y = center + randFloat(-size*0.2, size*0.2);
            const color = `hsl(${randInt(180, 300)}, 70%, 60%)`;
            blobs.push(<circle key={i} cx={x} cy={y} r={r} fill={color} opacity="0.2" style={{ filter: 'blur(20px)' }} />);
        }
        return <>{blobs}</>;
    }, [size, center]);
}

export const VinylRecord: React.FC = () => {
  const { state: config } = useDesign();
  const vinylConfig = config.vinyl;
  const cardWidth = config.card.width;
  
  if (!vinylConfig.enabled || vinylConfig.style === 'none') return null;

  const size = cardWidth;
  const center = size / 2;
  
  const renderStyle = () => {
      switch(vinylConfig.style) {
          case 'glitch': return <GlitchVinyl config={vinylConfig} size={size} center={center} />;
          case 'classic': return <ClassicGrooves size={size} center={center} />;
          case 'cassette': return <CassetteHubs size={size} center={center} />;
          case 'soundwave': return <Soundwave size={size} center={center} config={vinylConfig} />;
          case 'equalizer': return <Equalizer size={size} center={center} config={vinylConfig} />;
          case 'sunburst': return <Sunburst size={size} center={center} config={vinylConfig} />;
          case 'grid': return <GridStyle size={size} config={vinylConfig} />;
          case 'lissajous': return <LissajousStyle size={size} center={center} config={vinylConfig} />;
          case 'nebula': return <NebulaStyle size={size} center={center} />;
          default: return null;
      }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
      {vinylConfig.aiBackground && (
        <img src={vinylConfig.aiBackground} alt="AI Background" className="absolute inset-0 w-full h-full object-cover" style={{ mixBlendMode: 'multiply', opacity: 0.6 }} />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <g>
          {renderStyle()}
        </g>
         { (vinylConfig.style !== 'cassette') && <>
            <circle cx={center} cy={center} r={size * 0.15} fill="#fff" stroke="#000" strokeWidth="1" />
            <circle cx={center} cy={center} r={size * 0.02} fill="#000" />
        </>}
      </svg>
    </div>
  );
};