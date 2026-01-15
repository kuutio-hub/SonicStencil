import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getState } from '../state.js';
import { renderCardToHtml } from '../components/Card.js';
import { SAMPLE_CARD_DATA } from '../constants.js';

const PAGE_FORMATS = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    A5: { width: 148, height: 210 },
};
const MM_TO_PX_FACTOR = 3.7795;

const getPageLayout = (config) => {
    const pageFormat = PAGE_FORMATS[config.page.pageFormat] || PAGE_FORMATS.A4;
    const pageW_mm = pageFormat.width - (config.page.padding * 2 / MM_TO_PX_FACTOR);
    const pageH_mm = pageFormat.height - (config.page.padding * 2 / MM_TO_PX_FACTOR);
    const cardW_mm = config.card.width / MM_TO_PX_FACTOR;
    const cardH_mm = config.card.height / MM_TO_PX_FACTOR;
    const gap_mm = config.page.gap / MM_TO_PX_FACTOR;

    const cols = Math.max(1, Math.floor(pageW_mm / (cardW_mm + gap_mm)));
    const rows = Math.max(1, Math.floor(pageH_mm / (cardH_mm + gap_mm)));
    
    const maxCards = cols * rows;
    const cardsPerPage = config.page.autoFit ? maxCards : Math.min(maxCards, config.page.cardsPerPage);
    
    return { cols, rows, cardsPerPage };
}

// Függvény, ami egy oldalnyi kártyát renderel egy rejtett div-be és lefényképezi
async function capturePage(cards, config, side) {
  const container = document.createElement('div');
  container.id = `pdf-render-container-${side}`;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const pageFormat = PAGE_FORMATS[config.page.pageFormat] || PAGE_FORMATS.A4;
  const { cols } = getPageLayout(config);
  
  const cardsHtml = cards.map(cardData => `
    <div style="display: flex; justify-content: center; align-items: center;">
        ${renderCardToHtml(cardData, config, side)}
    </div>
  `).join('');

  container.style.width = `${pageFormat.width}mm`;
  container.style.height = `${pageFormat.height}mm`;
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gap = `${config.page.gap}px`;
  container.style.padding = `${config.page.padding}px`;
  container.style.backgroundColor = 'white';
  container.style.boxSizing = 'border-box';
  container.innerHTML = cardsHtml;
  
  // Rövid várakozás, hogy a böngésző biztosan renderelje a tartalmat
  await new Promise(resolve => setTimeout(resolve, 50));

  const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
  });
  
  document.body.removeChild(container);
  return canvas;
};

async function addBackPages(pdf, cardSource, totalCards, config) {
    const { pageFormat } = config.page;
    const pageDimensions = PAGE_FORMATS[pageFormat] || PAGE_FORMATS.A4;
    const { cols, cardsPerPage } = getPageLayout(config);

    for (let i = 0; i < totalCards; i += cardsPerPage) {
        let pageCards = cardSource.slice(i, i + cardsPerPage);

        if (config.page.mirrorBacks) {
            const mirroredCards = [...pageCards];
            for (let j = 0; j < pageCards.length; j++) {
                const row = Math.floor(j / cols);
                const col = j % cols;
                const mirroredCol = cols - 1 - col;
                const mirroredIndex = row * cols + mirroredCol;
                if (mirroredIndex < pageCards.length) {
                    mirroredCards[j] = pageCards[mirroredIndex];
                }
            }
            pageCards = mirroredCards;
        }

        const canvas = await capturePage(pageCards, config, 'back');
        const imgData = canvas.toDataURL('image/png');

        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pageDimensions.width, pageDimensions.height);
    }
}

export async function generatePdf() {
  const { cardData: allCards, designConfig: config } = getState();
  const { pageFormat } = config.page;
  const pageDimensions = PAGE_FORMATS[pageFormat] || PAGE_FORMATS.A4;
  const pdf = new jsPDF('p', 'mm', pageFormat.toLowerCase());
  
  const { cardsPerPage } = getPageLayout(config);
  
  let cardSource;
  let totalCards;

  if (config.mode === 'token' && allCards.length === 0) {
      totalCards = cardsPerPage;
      cardSource = Array(cardsPerPage).fill(SAMPLE_CARD_DATA);
  } else {
      totalCards = allCards.length;
      cardSource = allCards;
  }

  // Előlapok hozzáadása
  for (let i = 0; i < totalCards; i += cardsPerPage) {
    const pageCards = cardSource.slice(i, i + cardsPerPage);
    const canvas = await capturePage(pageCards, config, 'front');
    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', 0, 0, pageDimensions.width, pageDimensions.height);
  }

  // Hátlapok hozzáadása, ha 'card' módban vagyunk
  if(config.mode === 'card') {
      await addBackPages(pdf, cardSource, totalCards, config);
  }

  pdf.save('sonicstencil-cards.pdf');
};
