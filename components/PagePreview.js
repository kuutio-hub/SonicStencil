import { getState, updateState, t } from '../state.js';
import { renderPreviewContainer, addPreviewContainerListeners } from './ui/PreviewContainer.js';

const PAGE_FORMATS = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    A5: { width: 148, height: 210 },
};
const MM_TO_PX_FACTOR = 3.7795;

export function renderPagePreview(container) {
  const { designConfig: config, previewsVisible } = getState();
  const pageFormat = PAGE_FORMATS[config.page.pageFormat];
  const aspectRatio = pageFormat.width / pageFormat.height;
  
  const { card: cardConfig, page: pageConfig } = config;

  const pageW_mm = pageFormat.width - (pageConfig.padding * 2 / MM_TO_PX_FACTOR);
  const pageH_mm = pageFormat.height - (pageConfig.padding * 2 / MM_TO_PX_FACTOR);
  const cardW_mm = cardConfig.width / MM_TO_PX_FACTOR;
  const cardH_mm = cardConfig.height / MM_TO_PX_FACTOR;
  const gap_mm = pageConfig.gap / MM_TO_PX_FACTOR;

  const cols = Math.max(1, Math.floor(pageW_mm / (cardW_mm + gap_mm)));
  const rows = Math.max(1, Math.floor(pageH_mm / (cardH_mm + gap_mm)));
  const cardsThatFit = cols * rows;

  const cardsToDisplay = config.page.autoFit ? cardsThatFit : Math.min(cardsThatFit, config.page.cardsPerPage);
  
  const previewCards = Array(cardsToDisplay).fill(0).map((_, index) => `
    <div key="${index}" class="bg-gray-200 border border-gray-400/50 rounded flex items-center justify-center relative overflow-hidden shadow-inner" style="aspect-ratio: 1">
        <div class="w-9/12 h-9/12 rounded-full bg-gray-300 flex items-center justify-center">
        <div class="w-1/3 h-1/3 rounded-full bg-white shadow-md"></div>
        </div>
        <div class="absolute top-1 left-1 text-[6px] font-bold text-gray-500 opacity-80" style="font-size: clamp(4px, 1.5vw, 6px);">
        ${config.mode === 'card' ? 'Artist' : 'TOKEN'}
        </div>
    </div>
  `).join('');
  const unit = config.mode === 'token' ? t('tokenUnit') : t('cardUnit');

  const content = `
      <div class="flex flex-col justify-center items-center h-full p-4 bg-gray-800">
        <div
          class="bg-white shadow-2xl overflow-hidden border-2 border-gray-500/50"
          style="
            width: 100%;
            max-width: calc((100vh - 220px) * ${aspectRatio});
            aspect-ratio: ${aspectRatio};
          "
        >
          <div
            class="grid h-full w-full"
            style="
              grid-template-columns: repeat(${cols}, 1fr);
              grid-template-rows: repeat(${rows}, 1fr);
              gap: ${Math.max(1, pageConfig.gap / 4)}px;
              padding: ${Math.max(1, pageConfig.padding / 4)}px;
            "
          >
            ${previewCards}
          </div>
        </div>
        <p class="text-xs font-semibold text-gray-400 mt-3 bg-gray-900/50 px-2 py-1 rounded">
            ${t('pageLayoutInfo', { count: cardsToDisplay, unit, cols, rows })}
        </p>
      </div>
  `;

  renderPreviewContainer(container, {
      title: t('pagePreview'),
      isVisible: previewsVisible.page,
      content
  });

  addPreviewContainerListeners(container, () => {
      const currentVisibility = getState().previewsVisible;
      updateState({ previewsVisible: { ...currentVisibility, page: !currentVisibility.page } });
  });
}
