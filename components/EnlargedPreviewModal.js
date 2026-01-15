import { getState, updateState, t } from '../state.js';
import { CloseIcon } from './ui/Icons.js';
import { renderCardToHtml } from './Card.js';

export function renderEnlargedPreviewModal(container) {
    const { isModalOpen, editableSample, designConfig } = getState();

    if (!isModalOpen) {
        container.innerHTML = '';
        return;
    }

    const modalHTML = `
        <div id="modal-backdrop" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div id="modal-content" class="bg-gray-800 p-4 rounded-lg shadow-2xl relative w-full max-w-4xl">
                <button id="modal-close-button" class="absolute top-2 right-2 text-gray-400 hover:text-white">${CloseIcon()}</button>
                <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 p-4 md:p-8">
                     <div class="flex flex-col items-center">
                        <h3 class="font-bold mb-4 text-gray-400">${t('front')}</h3>
                        <div style="transform: scale(1.5); margin: 30px;">
                           ${renderCardToHtml(editableSample, designConfig, 'front')}
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <h3 class="font-bold mb-4 text-gray-400">${t('back')}</h3>
                        <div style="transform: scale(1.5); margin: 30px;">
                           ${renderCardToHtml(editableSample, designConfig, 'back')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = modalHTML;

    // Eseményfigyelők
    const closeModal = () => updateState({ isModalOpen: false });
    
    container.querySelector('#modal-backdrop').addEventListener('click', closeModal);
    container.querySelector('#modal-close-button').addEventListener('click', closeModal);
    container.querySelector('#modal-content').addEventListener('click', e => e.stopPropagation());
}
