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
    const step = availableRadius / Math.max(1, config.ringCount);

    for (let i = 0; i < config.ringCount; i++) {
      const radius = baseInnerRadius + step * (i + 0.5);
      const segments = 3;
      const angleCursor = Math.random() * 360;
      const span = 360 / segments - config.lineGap;
      
      for (let j = 0; j < segments; j++) {
        const startAngle = angleCursor + j * (360/segments);
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

// ... other style renderers converted similarly ...
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
      // Add other cases here
  }

  return `
    <div class="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
      ${vinylConfig.aiBackground ? `
        <img src="${vinylConfig.aiBackground}" alt="AI Background" class="absolute inset-0 w-full h-full object-cover" style="mix-blend-mode: multiply; opacity: 0.6;" />
      ` : ''}
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="overflow-visible">
        <g>${styleHtml}</g>
         ${ (vinylConfig.style !== 'cassette') ? `
            <circle cx="${center}" cy="${center}" r="${size * 0.15}" fill="#fff" stroke="#000" stroke-width="1" />
            <circle cx="${center}" cy="${center}" r="${size * 0.02}" fill="#000" />
        `: ''}
      </svg>
    </div>
  `;
};
