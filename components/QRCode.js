import QRCode from 'qrcode';

export async function renderQRCodeToHtml(url, config) {
    const { size, color, bgColor, bgTransparent, frame, frameWidth, frameBgColor } = config;

    if (!url) {
        return `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: #f8d7da;
                color: #721c24;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-size: 10px;
                padding: 4px;
                box-sizing: border-box;
                border: 1px solid #f5c6cb;
            ">
                QR Code Error: Missing URL
            </div>
        `;
    }

    try {
        const dataUrl = await QRCode.toDataURL(url, {
            width: size,
            margin: 0,
            color: {
                dark: color,
                light: bgTransparent ? '#00000000' : bgColor,
            },
        });

        const qrCodeImg = `<img src="${dataUrl}" width="${size}" height="${size}" alt="QR Code" />`;

        if (frame) {
            return `
                <div style="
                    padding: ${frameWidth}px;
                    background-color: ${frameBgColor};
                    display: inline-block;
                    line-height: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ">
                    ${qrCodeImg}
                </div>
            `;
        }
        return qrCodeImg;
    } catch (err) {
        console.error('QR code generation failed', err);
        return '<div>QR Error</div>';
    }
}
