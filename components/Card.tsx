import React from 'react';
import type { CardData } from '../types.ts';
import { VinylRecord } from './VinylRecord.tsx';
import { QRCode } from './QRCode.tsx';
import { useDesign } from '../context/DesignContext.tsx';

interface CardProps {
  data: CardData;
  side: 'front' | 'back';
}

const RotatedText: React.FC<{ text: string; fontSize: number; side: 'left' | 'right', rotation: 'mirrored' | 'uniform', color: string }> = ({ text, fontSize, side, rotation, color }) => {
    let angle = -90;
    if (rotation === 'mirrored') {
        angle = side === 'left' ? 90 : -90;
    }
    
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: side === 'left' ? `${fontSize * 0.8}px` : `auto`,
            right: side === 'right' ? `${fontSize * 0.8}px` : `auto`,
            transform: `translateY(-50%) rotate(${angle}deg)`,
            transformOrigin: 'center',
            whiteSpace: 'nowrap',
            fontSize: `${fontSize}px`,
            color: color,
        }}>
            {text}
        </div>
    );
}

export const Card: React.FC<CardProps> = ({ data, side }) => {
  const { state: config } = useDesign();
  const { card, back, front, qrCode, mode, token } = config;

  const containerStyle: React.CSSProperties = {
    width: `${card.width}px`,
    height: `${card.height}px`,
    backgroundColor: card.backgroundColor,
    borderRadius: `${card.borderRadius}px`,
    border: `${card.borderWidth}px solid ${card.borderColor}`,
    position: 'relative',
    overflow: 'hidden',
    color: '#000000',
    fontFamily: back.fontFamily,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const tokenSide = (
    <>
      <div className="absolute inset-0 flex items-center justify-center">
        <VinylRecord />
      </div>
      {token.showFrame && (
         <div style={{
             position: 'absolute',
             width: '70%',
             height: '70%',
             border: `2px solid ${token.frameColor}`,
             borderRadius: '50%',
             boxShadow: `0 0 ${token.frameGlow}px ${token.frameColor}, inset 0 0 ${token.frameGlow}px ${token.frameColor}`,
             pointerEvents: 'none'
         }} />
      )}
      <div className="z-10 text-center flex flex-col items-center justify-center px-4">
         <div style={{ 
             fontSize: `${token.text1Size}px`, 
             color: token.textColor, 
             fontWeight: 900,
             lineHeight: 1,
             textShadow: '0 1px 2px rgba(0,0,0,0.1)'
         }}>
           {token.text1}
         </div>
         {token.text2 && (
             <div style={{ 
                 fontSize: `${token.text2Size}px`, 
                 color: token.textColor, 
                 opacity: 0.8,
                 marginTop: '4px'
             }}>
               {token.text2}
             </div>
         )}
      </div>
    </>
  );

  const frontSide = (
    <>
      <div className="absolute inset-0 flex items-center justify-center">
        <VinylRecord />
      </div>
      
      {/* Artist Top */}
      <div style={{
          position: 'absolute',
          top: `${front.artistOffset}pt`,
          width: '80%',
          textAlign: 'center',
          fontSize: `${front.artistFontSize}px`,
          color: front.artistColor,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
      }}>
        {data.artist}
      </div>

      <div style={{
          position: 'absolute',
          left: `${qrCode.positionX}%`,
          top: `${qrCode.positionY}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10
      }}>
        <QRCode url={data.qr_url} />
      </div>

      {/* Title Bottom */}
      <div style={{
          position: 'absolute',
          bottom: `${front.titleOffset}pt`,
          width: '80%',
          textAlign: 'center',
          fontSize: `${front.titleFontSize}px`,
          color: front.titleColor,
          fontWeight: 700
      }}>
        {data.title}
      </div>
    </>
  );
  
  const backSide = (
    <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        padding: '10px 0',
        boxSizing: 'border-box'
    }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: '85%' }}>
                <p style={{
                    fontSize: `${back.artistFontSize}px`,
                    color: back.artistColor,
                    fontWeight: 'bold',
                    lineHeight: 1.1,
                }}>{data.artist}</p>
            </div>
        </div>
        
        <div style={{ flex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 0' }}>
            <h2 style={{
                fontSize: `${back.yearFontSize}px`,
                color: back.yearColor,
                fontWeight: 900,
            }}>{data.year}</h2>
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ width: '85%' }}>
                <p style={{
                    fontSize: `${back.titleFontSize}px`,
                    color: back.titleColor,
                    lineHeight: 1.1,
                }}>{data.title}</p>
            </div>
        </div>

        {data.code1 && <RotatedText text={data.code1} fontSize={back.codeFontSize} side="left" rotation={back.codeRotation} color={back.artistColor} />}
        {data.code2 && <RotatedText text={data.code2} fontSize={back.codeFontSize} side="right" rotation={back.codeRotation} color={back.artistColor} />}
    </div>
  );

  const content = mode === 'token' ? tokenSide : (side === 'front' ? frontSide : backSide);

  return (
    <div style={containerStyle}>
      {content}
    </div>
  );
};