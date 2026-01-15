// --- Utility Functions ---
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

// --- Style Renderers ---
const GlitchVinyl = ({ config, size, center }) => {
    let paths = '';
    const maxRadius = (size / 2) - config.clipMargin;
    const baseInnerRadius = size * 0.05;
    const availableRadius = maxRadius - baseInnerRadius;
    const ringCount = 13; // Belső logika, nem a felhasználó által állítható
    const step = availableRadius / Math.max(1, ringCount);
    const segments = config.glitchSegments || 3;

    for (let i = 0; i < ringCount; i++) {
      const radius = baseInnerRadius + step * (i + 0.5);
      const angleCursor = Math.random() * 360;
      
      for (let j = 0; j < segments; j++) {
        const segmentAngle = 360 / segments;
        const gap = randFloat(config.glitchGapMin, config.glitchGapMax);
        const span = Math.max(0, segmentAngle - gap);
        const startAngle = angleCursor + j * segmentAngle;
        const color = config.neon ? `hsl(${randInt(0, 360)}, 100%, 80%)` : config.lineColor;
        const filter = config.glowIntensity > 0 ? `drop-shadow(0 0 ${config.glowIntensity}px ${color})` : 'none';
        paths += `<path d="${describeArc(center, center, radius, startAngle, startAngle + span)}" fill="none" stroke="${color}" stroke-width="${config.lineWidth}" style="filter: ${filter}" />`;
      }
    }
    return paths;
}

const ClassicGrooves = ({ size, center }) => {
    let rings = '';
    for(let i=0; i < 15; i++) {
        rings += `<circle cx="${center}" cy="${center}" r="${size * 0.18 + i * (size*0.02)}" fill="none" stroke="#cccccc" stroke-width="0.5" />`;
    }
    return rings;
}

const CassetteHubs = ({ size, center }) => {
    const hub = (cx) => {
        let lines = '';
        for(let i=0; i < 6; i++) {
            const angle = i * 60 * Math.PI / 180;
            lines += `<line x1="${cx + Math.cos(angle) * size * 0.05}" y1="${center + Math.sin(angle) * size * 0.05}" x2="${cx + Math.cos(angle) * size * 0.13}" y2="${center + Math.sin(angle) * size * 0.13}" stroke="#999999" stroke-width="2" />`;
        }
        return `
            <g>
                <circle cx="${cx}" cy="${center}" r="${size * 0.15}" fill="none" stroke="#999999" stroke-width="3" />
                <circle cx="${cx}" cy="${center}" r="${size * 0.05}" fill="none" stroke="#999999" stroke-width="2" />
                ${lines}
            </g>
        `;
    };
    return `${hub(center - size*0.2)} ${hub(center + size*0.2)}`;
}

const Soundwave = ({size, center, config}) => {
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
    return `<path d="${pathData}" fill="none" stroke="${color}" stroke-width="${config.lineWidth}" />`;
}

const Equalizer = ({size, center, config}) => {
    let elements = '';
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
        elements += `<path d="${describeArc(center, center, baseRadius, startAngle, endAngle)}" stroke="${color}" stroke-width="${barHeight}" fill="none" />`;
    }
    return elements;
}

const Sunburst = ({size, center, config}) => {
    let elements = '';
    const numLines = config.sunburstLines;
    for(let i=0; i < numLines; i++) {
        const angle = i * (360 / numLines);
        const start = polarToCartesian(center, center, size * 0.18, angle);
        const end = polarToCartesian(center, center, size * randFloat(0.3, 0.45), angle);
        const color = config.neon ? `hsl(${angle}, 80%, 75%)` : config.lineColor;
        elements += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="${config.lineWidth}" />`;
    }
    return elements;
}

const GridStyle = ({size, config}) => {
    let lines = '';
    const step = size / config.gridDensity;
    const color = config.lineColor;
    for(let i=0; i <= config.gridDensity; i++) {
        lines += `<line x1="${i * step}" y1="0" x2="${i * step}" y2="${size}" stroke="${color}" stroke-width="${config.lineWidth}" opacity="0.3" />`;
        lines += `<line x1="0" y1="${i * step}" x2="${size}" y2="${i * step}" stroke="${color}" stroke-width="${config.lineWidth}" opacity="0.3" />`;
    }
    return lines;
}

const LissajousStyle = ({size, center, config}) => {
    const points = [];
    const a = 3, b = 2, delta = Math.PI / 2;
    const R = size * 0.4;
    for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
        const x = center + R * Math.sin(a * t + delta);
        const y = center + R * Math.sin(b * t);
        points.push(`${x},${y}`);
    }
    return `<polyline points="${points.join(' ')}" fill="none" stroke="${config.lineColor}" stroke-width="${config.lineWidth}" />`;
}

const NebulaStyle = ({size, center}) => {
    let blobs = '';
    for (let i = 0; i < 5; i++) {
        const r = size * randFloat(0.1, 0.3);
        const x = center + randFloat(-size*0.2, size*0.2);
        const y = center + randFloat(-size*0.2, size*0.2);
        const color = `hsl(${randInt(180, 300)}, 70%, 60%)`;
        blobs += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.2" style="filter: blur(20px)" />`;
    }
    return blobs;
}


// --- Main Exported Function ---
export function renderVinylRecordToHtml(config) {
  const vinylConfig = config.vinyl;
  const cardWidth = config.card.width;
  
  if (!vinylConfig.enabled || vinylConfig.style === 'none') return '';

  const size = cardWidth;
  const center = size / 2;
  
  let styleHtml = '';
  switch(vinylConfig.style) {
      case 'glitch': styleHtml = GlitchVinyl({ config: vinylConfig, size, center }); break;
      case 'classic': styleHtml = ClassicGrooves({ size, center }); break;
      case 'cassette': styleHtml = CassetteHubs({ size, center }); break;
      case 'soundwave': styleHtml = Soundwave({ size, center, config: vinylConfig }); break;
      case 'equalizer': styleHtml = Equalizer({ size, center, config: vinylConfig }); break;
      case 'sunburst': styleHtml = Sunburst({ size, center, config: vinylConfig }); break;
      case 'grid': styleHtml = GridStyle({ size, config: vinylConfig }); break;
      case 'lissajous': styleHtml = LissajousStyle({ size, center, config: vinylConfig }); break;
      case 'nebula': styleHtml = NebulaStyle({ size, center }); break;
  }

  return `
    <div class="absolute inset-0 w-full h-full flex items-center justify-center overflow-visible pointer-events-none">
      ${vinylConfig.aiBackground ? `
        <img src="${vinylConfig.aiBackground}" alt="AI Background" class="absolute inset-0 w-full h-full object-cover" style="mix-blend-mode: multiply; opacity: 0.6;" />
      ` : ''}
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="overflow-visible">
        <g>${styleHtml}</g>
         ${ (vinylConfig.style !== 'cassette' && vinylConfig.showCenterLabel) ? `
            <circle cx="${center}" cy="${center}" r="${size * 0.15}" fill="#fff" stroke="#000" stroke-width="1" />
            <circle cx="${center}" cy="${center}" r="${size * 0.02}" fill="#000" />
        `: ''}
      </svg>
    </div>
  `;
};