import { getState, updateState, t } from '../state.js';
import { renderCardToHtml, renderQRCodesInContainer } from './Card.js';
import { renderPreviewContainer, addPreviewContainerListeners } from './ui/PreviewContainer.js';
import { EnlargeIcon } from './ui/Icons.js';

export async function renderCardPreview(container) {
  const { editableSample, designConfig, previewsVisible } = getState();

  const headerActions = `
     <button id="enlarge-button" class="text-gray-400 hover:text-white" title="${t('enlarge')}">
        ${EnlargeIcon()}
     </button>
  `;
  
  const content = `
      <div class="flex justify-around items-center h-full gap-4 flex-wrap p-4">
        <div class="flex flex-col items-center">
          <h3 class="font-bold mb-2 text-gray-400">${t('front')}</h3>
          ${renderCardToHtml(editableSample, designConfig, 'front')}
        </div>
        <div class="flex flex-col items-center">
          <h3 class="font-bold mb-2 text-gray-400">${t('back')}</h3>
          ${renderCardToHtml(editableSample, designConfig, 'back')}
        </div>
      </div>
  `;

  renderPreviewContainer(container, {
      title: t('cardPreview'),
      isVisible: previewsVisible.card,
      content,
      actions: headerActions
  });
  
  // Aszinkron módon rendereljük a QR kódokat a már DOM-ban lévő konténerbe
  await renderQRCodesInContainer(container);

  addPreviewContainerListeners(container, () => {
      const currentVisibility = getState().previewsVisible;
      updateState({ previewsVisible: { ...currentVisibility, card: !currentVisibility.card } });
  });
  
  container.querySelector('#enlarge-button').addEventListener('click', () => {
      updateState({ isModalOpen: true });
  });
}
