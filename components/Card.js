import { renderVinylRecordToHtml } from './VinylRecord.js';
import { renderQRCodeToHtml } from './QRCode.js';

function RotatedText({ text, fontSize, side, rotation, color }) {
    let angle = -90;
    if (rotation === 'mirrored') {
        angle = side === 'left' ? 90 : -90;
    }
    
    return `
        <div style="
            position: absolute;
            top: 50%;
            left: ${side === 'left' ? `${fontSize * 0.8}px` : `auto`};
            right: ${side === 'right' ? `${fontSize * 0.8}px` : `auto`};
            transform: translateY(-50%) rotate(${angle}deg);
            transform-origin: center;
            white-space: nowrap;
            font-size: ${fontSize}px;
            color: ${color};
        ">
            ${text}
        </div>
    `;
}

export function renderCardToHtml(data, config, side) {
  const { card, back, front, qrCode, mode, token } = config;

  const containerStyle = `
    width: ${card.width}px;
    height: ${card.height}px;
    background-color: ${card.backgroundColor};
    border-radius: ${card.borderRadius}px;
    border: ${card.borderWidth}px solid ${card.borderColor};
    position: relative;
    overflow: hidden;
    color: #000000;
    font-family: ${back.fontFamily};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `;

  const tokenSide = `
    <div class="absolute inset-0 flex items-center justify-center">
      ${renderVinylRecordToHtml(config)}
    </div>
    ${token.showFrame ? `
      <div style="
          position: absolute;
          width: 70%;
          height: 70%;
          border: 2px solid ${token.frameColor};
          border-radius: 50%;
          box-shadow: 0 0 ${token.frameGlow}px ${token.frameColor}, inset 0 0 ${token.frameGlow}px ${token.frameColor};
          pointer-events: none;
      "></div>` : ''
    }
    <div class="z-10 text-center flex flex-col items-center justify-center px-4">
       <div style=" 
           font-size: ${token.text1Size}px; 
           color: ${token.textColor}; 
           font-weight: 900;
           line-height: 1;
           text-shadow: 0 1px 2px rgba(0,0,0,0.1);
       ">
         ${token.text1}
       </div>
       ${token.text2 ? `
           <div style=" 
               font-size: ${token.text2Size}px; 
               color: ${token.textColor}; 
               opacity: 0.8;
               margin-top: 4px;
           ">
             ${token.text2}
           </div>` : ''
       }
    </div>
  `;

  const frontSide = `
    <div class="absolute inset-0 flex items-center justify-center">
      ${renderVinylRecordToHtml(config)}
    </div>
    <div style="
        position: absolute;
        top: ${front.artistOffset}pt;
        width: 80%;
        text-align: center;
        font-size: ${front.artistFontSize}px;
        color: ${front.artistColor};
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    ">
      ${data.artist}
    </div>
    <div class="qr-code-container-placeholder" style="
        position: absolute;
        left: ${qrCode.positionX}%;
        top: ${qrCode.positionY}%;
        transform: translate(-50%, -50%);
        z-index: 10;
    ">
      <!-- A QR kód ide kerül aszinkron módon -->
    </div>
    <div style="
        position: absolute;
        bottom: ${front.titleOffset}pt;
        width: 80%;
        text-align: center;
        font-size: ${front.titleFontSize}px;
        color: ${front.titleColor};
        font-weight: 700;
    ">
      ${data.title}
    </div>
  `;
  
  const backSide = `
    <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        padding: 10px 0;
        box-sizing: border-box;
    ">
        <div style="flex: 1; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 85%;">
                <p style="
                    font-size: ${back.artistFontSize}px;
                    color: ${back.artistColor};
                    font-weight: bold;
                    line-height: 1.1;
                ">${data.artist}</p>
            </div>
        </div>
        <div style="flex: 0; display: flex; align-items: center; justify-content: center; padding: 5px 0;">
            <h2 style="
                font-size: ${back.yearFontSize}px;
                color: ${back.yearColor};
                font-weight: 900;
            ">${data.year}</h2>
        </div>
        <div style="flex: 1; display: flex; align-items: flex-start; justify-content: center;">
            <div style="width: 85%;">
                <p style="
                    font-size: ${back.titleFontSize}px;
                    color: ${back.titleColor};
                    line-height: 1.1;
                ">${data.title}</p>
            </div>
        </div>
        ${data.code1 ? RotatedText({ text: data.code1, fontSize: back.codeFontSize, side: "left", rotation: back.codeRotation, color: back.artistColor }) : ''}
        ${data.code2 ? RotatedText({ text: data.code2, fontSize: back.codeFontSize, side: "right", rotation: back.codeRotation, color: back.artistColor }) : ''}
    </div>
  `;

  const content = mode === 'token' ? tokenSide : (side === 'front' ? frontSide : backSide);

  return `
    <div style="${containerStyle}" data-qr-url="${side === 'front' ? data.qr_url : ''}">
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
        if (url) {
            placeholder.innerHTML = await renderQRCodeToHtml(url, designConfig.qrCode);
        }
    }
}
