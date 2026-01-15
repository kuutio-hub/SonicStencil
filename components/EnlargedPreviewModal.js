import { getState, updateState, t } from '../state.js';
import { CloseIcon, ZoomInIcon, ZoomOutIcon, ResetIcon } from './ui/Icons.js';
import { renderCardToHtml, renderQRCodesInContainer } from './Card.js';
import { renderPagePreviewContent } from './PagePreview.js';

function ZoomControls() {
    const { previewZoom } = getState();
    return `
        <div class="flex items-center gap-2 bg-gray-900/50 rounded-md p-1 border border-gray-700">
            <button id="zoom-out-btn" class="p-1.5 text-gray-400 hover:text-white transition-colors" title="${t('zoomOut')}">${ZoomOutIcon()}</button>
            <button id="zoom-reset-btn" class="p-1.5 text-gray-400 hover:text-white transition-colors text-xs font-bold w-10" title="${t('zoomReset')}">${Math.round(previewZoom * 100)}%</button>
            <button id="zoom-in-btn" class="p-1.5 text-gray-400 hover:text-white transition-colors" title="${t('zoomIn')}">${ZoomInIcon()}</button>
        </div>
    `;
}

function renderCardPreviewContent() {
    const { editableSample, designConfig } = getState();
    return `
        <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
             <div class="flex flex-col items-center">
                <h3 class="font-bold mb-4 text-gray-400">${t('front')}</h3>
                <div class="card-front-enlarged">
                   ${renderCardToHtml(editableSample, designConfig, 'front')}
                </div>
            </div>
            <div class="flex flex-col items-center">
                <h3 class="font-bold mb-4 text-gray-400">${t('back')}</h3>
                <div>
                   ${renderCardToHtml(editableSample, designConfig, 'back')}
                </div>
            </div>
        </div>
    `;
}

export async function renderEnlargedPreviewModal(container) {
    const { isModalOpen, modalContent, previewZoom } = getState();

    if (!isModalOpen) {
        container.innerHTML = '';
        return;
    }

    let contentHtml = '';
    let title = '';
    let maxWidthClass = 'max-w-4xl';
    let minHeightClass = 'min-h-[80vh]';

    if (modalContent === 'card') {
        contentHtml = renderCardPreviewContent();
        title = t('cardPreview');
    } else if (modalContent === 'page') {
        contentHtml = renderPagePreviewContent();
        title = t('pagePreview');
        maxWidthClass = 'max-w-2xl';
        minHeightClass = 'min-h-[90vh]';
    }

    const modalHTML = `
        <div id="modal-backdrop" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
            <div id="modal-content" class="bg-gray-800 p-4 rounded-lg shadow-2xl relative w-full ${maxWidthClass} my-auto">
                <div class="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                    <h2 class="text-xl font-bold">${title}</h2>
                    <div class="flex items-center gap-4">
                        ${ZoomControls()}
                        <button id="modal-close-button" class="text-gray-400 hover:text-white">${CloseIcon()}</button>
                    </div>
                </div>
                <div class="overflow-hidden flex items-center justify-center ${minHeightClass}">
                    <div id="zoom-content-wrapper" style="transform: scale(${previewZoom}); transform-origin: center center; transition: transform 0.2s ease-out;">
                         ${contentHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = modalHTML;

    // QR kódok renderelése, ha kártya előnézet van
    if (modalContent === 'card') {
       await renderQRCodesInContainer(container.querySelector('.card-front-enlarged'));
    }

    // Eseményfigyelők
    const closeModal = () => updateState({ isModalOpen: false, modalContent: null });
    
    container.querySelector('#modal-backdrop').addEventListener('click', closeModal);
    container.querySelector('#modal-close-button').addEventListener('click', closeModal);
    container.querySelector('#modal-content').addEventListener('click', e => e.stopPropagation());
    
    // Zoom vezérlők
    container.querySelector('#zoom-in-btn').addEventListener('click', () => {
        updateState({ previewZoom: Math.min(3, getState().previewZoom + 0.1) });
    });
    container.querySelector('#zoom-out-btn').addEventListener('click', () => {
        updateState({ previewZoom: Math.max(0.1, getState().previewZoom - 0.1) });
    });
    container.querySelector('#zoom-reset-btn').addEventListener('click', () => {
        updateState({ previewZoom: 1 });
    });
}