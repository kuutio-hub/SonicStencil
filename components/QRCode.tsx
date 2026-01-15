import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDesign } from '../context/DesignContext.tsx';

interface QRCodeProps {
  url: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ url }) => {
    const { state } = useDesign();
    const config = state.qrCode;
    const { size, color, bgColor, bgTransparent, frame, frameWidth, frameBgColor } = config;

    // Defensive check: If url is missing, render a placeholder instead of crashing.
    if (!url) {
        return (
            <div style={{
                width: size,
                height: size,
                backgroundColor: '#f8d7da',
                color: '#721c24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '10px',
                padding: '4px',
                boxSizing: 'border-box',
                border: '1px solid #f5c6cb'
            }}>
                QR Code Error: Missing URL
            </div>
        );
    }
    
    const qrCodeComponent = (
        <QRCodeSVG
            value={url}
            size={size}
            fgColor={color}
            bgColor={bgTransparent ? '#FFFFFF00' : bgColor}
            level={"M"}
            includeMargin={false}
        />
    );

    if (frame) {
        return (
            <div style={{
                padding: `${frameWidth}px`,
                backgroundColor: frameBgColor,
                display: 'inline-block',
                lineHeight: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {qrCodeComponent}
            </div>
        );
    }

    return qrCodeComponent;
};