import { renderVinylRecordToHtml } from './VinylRecord.js';
import { renderQRCodeToHtml } from './QRCode.js';
import { getState } from '../state.js';

function RotatedText({ text, fontSize, side, rotation, color, family, weight, transform, spacing, offsetX }) {
    let angle = -90;
    if (rotation === 'mirrored') {
        angle = side === 'left' ? 90 : -90;
    }
    
    return `
        <div style="
            position: absolute;
            top: 50%;
            left: ${side === 'left' ? `${offsetX}px` : `auto`};
            right: ${side === 'right' ? `${offsetX}px` : `auto`};
            transform: translateY(-50%) rotate(${angle}deg);
            transform-origin: center;
            white-space: nowrap;
            font-family: ${family};
            font-size: ${fontSize}px;
            font-weight: ${weight};
            text-transform: ${transform};
            letter-spacing: ${spacing}em;
            color: ${color};
        ">
            ${text}
        </div>
    `;
}

// Helper a szöveg körüli "kitakaró" keret generálásához
function generateTextStroke(width, color) {
    if (width <= 0) return 'none';
    const shadows = [];
    const steps = 8; // 8 irányba vetett árnyék a teljes lefedésért
    for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const x = Math.cos(angle) * width;
        const y = Math.sin(angle) * width;
        shadows.push(`${x.toFixed(2)}px ${y.toFixed(2)}px 0 ${color}`);
    }
    return shadows.join(', ');
}

export function renderCardToHtml(data, config, side) {
  const { card, front, back, qrCode, mode, token, typography } = config;
  
  const shouldShowBorder = card.showBorder && ((side === 'front' && card.borderOnFront) || (side === 'back' && card.borderOnBack));

  const containerStyle = `
    width: ${card.width}px;
    height: ${card.height}px;
    background-color: ${card.backgroundColor};
    border-radius: ${card.borderRadius}px;
    border: ${shouldShowBorder ? `${card.borderWidth}px solid ${card.borderColor}` : 'none'};
    position: relative;
    overflow: hidden;
    color: #000000;
    font-family: ${typography.fontFamily};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `;

  const textStrokeStyle = generateTextStroke(token.textStrokeWidth, '#FFFFFF');

  const tokenSide = `
    <div class="absolute inset-0 flex items-center justify-center">
      ${renderVinylRecordToHtml(config)}
    </div>
    <div class="z-10 text-center flex flex-col items-center justify-content-center px-4" style="font-family: ${typography.fontFamily};">
       <div style=" 
           font-size: ${token.text1Size}px; 
           color: ${token.textColor}; 
           font-weight: ${typography.artistWeight};
           line-height: 1;
           text-shadow: ${textStrokeStyle};
       ">
         ${token.text1}
       </div>
       ${token.text2 ? `
           <div style=" 
               font-size: ${token.text2Size}px; 
               color: ${token.textColor}; 
               opacity: 0.8;
               margin-top: 4px;
               font-weight: ${typography.titleWeight};
               text-shadow: ${textStrokeStyle};
           ">
             ${token.text2}
           </div>` : ''
       }
    </div>
  `;
  
  const qrPixelSize = card.width * (qrCode.size / 100);

  const frontSide = `
    <div class="absolute inset-0 flex items-center justify-center">
      ${renderVinylRecordToHtml(config)}
    </div>
    <div class="qr-code-container-placeholder" data-size="${qrPixelSize}" style="
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
    ">
      <!-- A QR kód ide kerül aszinkron módon -->
    </div>
  `;
  
  const backSide = `
    <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        position: relative;
        padding: 0 ${front.paddingX}px;
        box-sizing: border-box;
    ">
        ${back.showArtist ? `
        <div style="
            position: absolute;
            top: ${back.artistOffsetY}px;
            left: ${front.paddingX}px;
            right: ${front.paddingX}px;
        ">
            <p style="
                font-size: ${back.artistFontSize}px;
                color: ${back.artistColor};
                font-weight: ${typography.artistWeight};
                text-transform: ${typography.artistTransform};
                font-variant: ${typography.fontVariant};
                letter-spacing: ${typography.artistLetterSpacing}em;
                line-height: 1.2;
                white-space: pre-wrap;
            ">${data.artist.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        ${back.showYear ? `
        <div style="padding: 4px 0;">
            <h2 style="
                font-size: ${back.yearFontSize}px;
                color: ${back.yearColor};
                font-weight: ${typography.yearWeight};
            ">${data.year}</h2>
        </div>` : ''}

        ${back.showTitle ? `
        <div style="
            position: absolute;
            bottom: ${back.titleOffsetY}px;
            left: ${front.paddingX}px;
            right: ${front.paddingX}px;
        ">
            <p style="
                font-size: ${back.titleFontSize}px;
                color: ${back.titleColor};
                font-weight: ${typography.titleWeight};
                text-transform: ${typography.titleTransform};
                font-variant: ${typography.fontVariant};
                letter-spacing: ${typography.titleLetterSpacing}em;
                line-height: 1.2;
                white-space: pre-wrap;
            ">${data.title.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        ${back.showCodes && data.code1 ? RotatedText({ text: data.code1, fontSize: back.codeFontSize, side: "left", rotation: back.codeRotation, color: back.artistColor, family: typography.fontFamily, weight: 400, transform: 'none', spacing: 0.1, offsetX: back.codeOffsetX }) : ''}
        ${back.showCodes && data.code2 ? RotatedText({ text: data.code2, fontSize: back.codeFontSize, side: "right", rotation: back.codeRotation, color: back.artistColor, family: typography.fontFamily, weight: 400, transform: 'none', spacing: 0.1, offsetX: back.codeOffsetX }) : ''}
    </div>
  `;

  const content = mode === 'token' ? tokenSide : (side === 'front' ? frontSide : backSide);

  return `
    <div style="${containerStyle}" data-qr-url="${side === 'front' && mode === 'card' ? data.qr_url : ''}">
      ${content}
    </div>
  `;
}

// Külön függvény a QR kódok aszinkron rendereléséhez
export async function renderQRCodesInContainer(container) {
    const qrCodePlaceholders = container.querySelectorAll('.qr-code-container-placeholder');
    const { designConfig } = getState();
    
    for (const placeholder of qrCodePlaceholders) {
        const cardElement = placeholder.closest('[data-qr-url]');
        const url = cardElement.getAttribute('data-qr-url');
        const size = parseFloat(placeholder.getAttribute('data-size'));
        
        if (url) {
            const qrConfig = { ...designConfig.qrCode, size: size };
            placeholder.innerHTML = await renderQRCodeToHtml(url, qrConfig);
        }
    }
}