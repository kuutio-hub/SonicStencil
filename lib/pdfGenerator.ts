import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { CardData, DesignConfig } from '../types.ts';
import { Card } from '../components/Card.tsx';
import { SAMPLE_CARD_DATA } from '../constants.ts';
import { DesignProvider } from '../context/DesignContext.tsx';

const PAGE_FORMATS = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    A5: { width: 148, height: 210 },
};
const MM_TO_PX_FACTOR = 3.7795;

const getPageLayout = (config: DesignConfig) => {
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


// Function to render a page of cards to a hidden div and capture it
const capturePage = async (cards: CardData[], config: DesignConfig, side: 'front' | 'back'): Promise<HTMLCanvasElement> => {
  const container = document.createElement('div');
  container.id = `pdf-render-container-${side}`;
  // Position off-screen
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const pageFormat = PAGE_FORMATS[config.page.pageFormat] || PAGE_FORMATS.A4;
  const { cols } = getPageLayout(config);
  
  const PageComponent = ({ onRendered }: { onRendered: () => void }) => {
    React.useLayoutEffect(() => {
      onRendered();
    }, [onRendered]);

    return React.createElement(DesignProvider, {
      initialState: config,
      children: React.createElement('div', {
        style: {
          width: `${pageFormat.width}mm`,
          height: `${pageFormat.height}mm`,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${config.page.gap}px`,
          padding: `${config.page.padding}px`,
          backgroundColor: 'white',
          boxSizing: 'border-box',
        }
      },
        cards.map((card, index) => (
          React.createElement('div', {
            key: index,
            style: { 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }
          },
            React.createElement(Card, { data: card, side: side })
          )
        ))
      )
    });
  };

  const root = ReactDOM.createRoot(container);
  await new Promise<void>(resolve => {
    root.render(React.createElement(PageComponent, { onRendered: resolve }));
  });
  
  const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
  });
  
  root.unmount();
  document.body.removeChild(container);
  return canvas;
};

const addBackPages = async (pdf: jsPDF, cardSource: CardData[], totalCards: number, config: DesignConfig) => {
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


export const generatePdf = async (allCards: CardData[], config: DesignConfig) => {
  const { pageFormat } = config.page;
  const pageDimensions = PAGE_FORMATS[pageFormat] || PAGE_FORMATS.A4;
  const pdf = new jsPDF('p', 'mm', pageFormat.toLowerCase());
  
  const { cardsPerPage } = getPageLayout(config);
  
  let cardSource: CardData[];
  let totalCards: number;

  if (config.mode === 'token' && allCards.length === 0) {
      totalCards = cardsPerPage;
      cardSource = Array(cardsPerPage).fill(SAMPLE_CARD_DATA);
  } else {
      totalCards = allCards.length;
      cardSource = allCards;
  }


  // Add front pages
  for (let i = 0; i < totalCards; i += cardsPerPage) {
    const pageCards = cardSource.slice(i, i + cardsPerPage);
    const canvas = await capturePage(pageCards, config, 'front');
    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', 0, 0, pageDimensions.width, pageDimensions.height);
  }

  if(config.mode === 'card') {
      await addBackPages(pdf, cardSource, totalCards, config);
  }

  pdf.save('sonicstencil-cards.pdf');
};