import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { getState } from '../state.js';
import { renderVinylRecordToHtml } from '../components/VinylRecord.js';
import { SAMPLE_CARD_DATA } from '../constants.js';

const PAGE_FORMATS = { A4: { w: 210, h: 297 }, A3: { w: 297, h: 420 }, A5: { w: 148, h: 210 }};
const PT_TO_MM = 0.352778; // 1pt = 0.352778mm
const PX_TO_MM = PT_TO_MM * 0.75; // Alapértelmezett 96 DPI mellett 1px = 0.75pt

/**
 * Konvertál egy SVG stringet PNG data URL-lé egy canvas segítségével.
 * @param {string} svgString A renderelendő SVG.
 * @param {number} width A kimeneti kép szélessége pixelben.
 * @param {number} height A kimeneti kép magassága pixelben.
 * @returns {Promise<string>} A PNG data URL.
 */
function convertSvgToPngDataUrl(svgString, width, height) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(new Error(`Could not load SVG image: ${err}`));
        };

        img.src = url;
    });
}


async function drawCard(pdf, cardData, x, y, config, side) {
    const { card, front, back, qrCode, mode, token, typography, vinyl } = config;

    const cardW_px = card.width;
    const cardH_px = card.height;
    const cardW_mm = cardW_px * PX_TO_MM;
    const cardH_mm = cardH_px * PX_TO_MM;


    // Kártya háttere és kerete
    const shouldShowBorder = card.showBorder && ((side === 'front' && card.borderOnFront) || (side === 'back' && card.borderOnBack));
    pdf.setFillColor(card.backgroundColor);
    if (shouldShowBorder) {
        pdf.setDrawColor(card.borderColor);
        pdf.setLineWidth(card.borderWidth * PT_TO_MM);
    }
    pdf.roundedRect(x, y, cardW_mm, cardH_mm, card.borderRadius * PX_TO_MM, card.borderRadius * PX_TO_MM, shouldShowBorder ? 'FD' : 'F');

    const centerX = x + cardW_mm / 2;
    const centerY = y + cardH_mm / 2;

    if (mode === 'token' || (mode === 'card' && side === 'front')) {
        // SVG renderelése és hozzáadása képként
        const svgString = renderVinylRecordToHtml(config);
        if (svgString) {
             try {
                const pngDataUrl = await convertSvgToPngDataUrl(svgString, cardW_px, cardH_px);
                pdf.addImage(pngDataUrl, 'PNG', x, y, cardW_mm, cardH_mm);
            } catch (error) {
                console.error("Error converting SVG to PNG:", error);
                // Hiba esetén ne álljon le a generálás, csak jelezze a konzolon.
            }
        }
    }

    if (mode === 'card' && side === 'front') {
        const qrSize_mm = cardW_mm * (qrCode.size / 100);
        const qrX = centerX - qrSize_mm / 2;
        const qrY = centerY - qrSize_mm / 2;

        if (cardData.qr_url) {
            const qrDataUrl = await QRCode.toDataURL(cardData.qr_url, {
                width: qrSize_mm / PX_TO_MM, // A qrcode lib pixelben várja a méretet
                margin: 0,
                color: { dark: qrCode.color, light: qrCode.bgTransparent ? '#00000000' : qrCode.bgColor },
            });

            if (qrCode.frame) {
                const framePadding_mm = qrCode.frameWidth * PT_TO_MM;
                const frameX = qrX - framePadding_mm;
                const frameY = qrY - framePadding_mm;
                const frameW = qrSize_mm + 2 * framePadding_mm;
                const frameRadius = qrCode.frameBorderRadius * PX_TO_MM;
                pdf.setFillColor(qrCode.frameBgColor);
                pdf.roundedRect(frameX, frameY, frameW, frameW, frameRadius, frameRadius, 'F');
            }
            pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize_mm, qrSize_mm);
        }
    } else if (mode === 'card' && side === 'back') {
        pdf.setFont(typography.fontFamily.split(',')[0], 'normal');
        const paddingX_mm = front.paddingX * PX_TO_MM;

        // Artist
        if (back.showArtist) {
            pdf.setFontSize(back.artistFontSize).setTextColor(back.artistColor)
               .setFont(undefined, `${typography.artistWeight}`);
            pdf.text(cardData.artist, centerX, y + back.artistOffsetY * PX_TO_MM, { align: 'center', baseline: 'top' });
        }
        // Year
        if (back.showYear) {
            pdf.setFontSize(back.yearFontSize).setTextColor(back.yearColor)
               .setFont(undefined, `${typography.yearWeight}`);
            pdf.text(String(cardData.year), centerX, centerY, { align: 'center', baseline: 'middle' });
        }
        // Title
        if (back.showTitle) {
            pdf.setFontSize(back.titleFontSize).setTextColor(back.titleColor)
               .setFont(undefined, `${typography.titleWeight}`);
            pdf.text(cardData.title, centerX, y + cardH_mm - back.titleOffsetY * PX_TO_MM, { align: 'center', baseline: 'bottom' });
        }
        // Codes
        if (back.showCodes) {
            pdf.setFontSize(back.codeFontSize).setTextColor(back.artistColor).setFont(undefined, 'normal');
            const codeOffsetX_mm = back.codeOffsetX * PX_TO_MM;
            if(cardData.code1) pdf.text(cardData.code1, x + codeOffsetX_mm, centerY, { align: 'center', baseline: 'middle', angle: 90 });
            if(cardData.code2) pdf.text(cardData.code2, x + cardW_mm - codeOffsetX_mm, centerY, { align: 'center', baseline: 'middle', angle: -90 });
        }
    }
}

export async function generatePdf(onProgress) {
    const { cardData: allCards, designConfig: config } = getState();
    const { page: pageConfig, card: cardConfig } = config;
    const pageFormat = PAGE_FORMATS[pageConfig.pageFormat] || PAGE_FORMATS.A4;
    
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: pageConfig.pageFormat.toLowerCase()
    });

    const cardW_mm = cardConfig.width * PX_TO_MM;
    const cardH_mm = cardConfig.height * PX_TO_MM;
    const padding_mm = pageConfig.padding * PX_TO_MM;
    const gapX_mm = pageConfig.gapX * PX_TO_MM;
    const gapY_mm = pageConfig.gapY * PX_TO_MM;

    const pageW_mm = pageFormat.w - 2 * padding_mm;
    const pageH_mm = pageFormat.h - 2 * padding_mm;

    const cols = Math.floor((pageW_mm + gapX_mm) / (cardW_mm + gapX_mm));
    const rows = Math.floor((pageH_mm + gapY_mm) / (cardH_mm + gapY_mm));
    const cardsPerPage = pageConfig.autoFit ? cols * rows : Math.min(cols * rows, pageConfig.cardsPerPage);
    
    let cardSource = allCards.length > 0 ? allCards : Array(cardsPerPage).fill(SAMPLE_CARD_DATA);
    if (config.mode === 'token' && allCards.length === 0) {
        cardSource = Array(cardsPerPage).fill({ ...SAMPLE_CARD_DATA, ...config.token });
    }
    const totalCards = cardSource.length;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const totalSteps = totalPages * 2; // Front and back pages
    let currentStep = 0;

    // --- Előlapok generálása ---
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        currentStep++;
        onProgress({
            percentage: Math.round((currentStep / totalSteps) * 100),
            message: `Generating front pages: ${pageIndex + 1}/${totalPages}`
        });

        if (pageIndex > 0) pdf.addPage();
        const pageCards = cardSource.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage);

        for (let i = 0; i < pageCards.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const cardX = padding_mm + col * (cardW_mm + gapX_mm);
            const cardY = padding_mm + row * (cardH_mm + gapY_mm);
            await drawCard(pdf, pageCards[i], cardX, cardY, config, 'front');
        }
    }
    
    // --- Hátlapok generálása ---
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        currentStep++;
        onProgress({
            percentage: Math.round((currentStep / totalSteps) * 100),
            message: `Generating back pages: ${pageIndex + 1}/${totalPages}`
        });
        
        pdf.addPage();
        let pageCards = cardSource.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage);

        for (let i = 0; i < pageCards.length; i++) {
            const row = Math.floor(i / cols);
            let col = i % cols;

            if (pageConfig.mirrorBacks && config.mode === 'card') {
                col = cols - 1 - col;
            }

            const cardX = padding_mm + col * (cardW_mm + gapX_mm);
            const cardY = padding_mm + row * (cardH_mm + gapY_mm);
            await drawCard(pdf, pageCards[i], cardX, cardY, config, 'back');
        }
    }

    pdf.save('sonicstencil-cards.pdf');
}