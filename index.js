import { renderApp, handleFileParse, handleGeneratePdf } from './App.js';
import { subscribe, getState } from './state.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderFileUpload } from './components/FileUpload.js';
import { renderCardPreview } from './components/CardPreview.js';
import { renderPagePreview } from './components/PagePreview.js';
import { renderToastContainer } from './components/ui/Toast.js';
import { renderEnlargedPreviewModal } from './components/EnlargedPreviewModal.js';
import { renderFooter } from './components/Footer.js';

// Debounce segédfüggvény a teljesítmény növeléséhez
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function main() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) {
        throw new Error('App container not found!');
    }
    
    // 1. Render the main app shell ONCE
    renderApp(appContainer);

    // 2. Get containers for each component
    const headerContainer = document.getElementById('header-container');
    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    const fileuploadContainer = document.getElementById('fileupload-container');
    const cardPreviewContainer = document.getElementById('card-preview-container');
    const pagePreviewContainer = document.getElementById('page-preview-container');
    const mobileCardPreviewBtn = document.getElementById('mobile-card-preview-btn');
    const mobilePagePreviewBtn = document.getElementById('mobile-page-preview-btn');
    const toastContainerWrapper = document.getElementById('toast-container-wrapper');
    const modalContainerWrapper = document.getElementById('modal-container-wrapper');
    const footerContainer = document.getElementById('footer-container');


    // 3. Initial render of each component
    renderHeader(headerContainer);
    renderSidebar(sidebarWrapper, { onGeneratePdf: handleGeneratePdf });
    renderFileUpload(fileuploadContainer, { onFileParse: handleFileParse });
    renderCardPreview(cardPreviewContainer);
    renderPagePreview(pagePreviewContainer);
    renderCardPreview(mobileCardPreviewBtn, true);
    renderPagePreview(mobilePagePreviewBtn, true);
    renderToastContainer(toastContainerWrapper);
    renderEnlargedPreviewModal(modalContainerWrapper);
    renderFooter(footerContainer);
    
    // 4. Subscribe each component to its relevant state changes
    // Debounce a gyakran változó designConfig frissítéseket
    const debouncedCardRender = debounce(() => {
        renderCardPreview(cardPreviewContainer);
        renderCardPreview(mobileCardPreviewBtn, true);
        renderPagePreview(pagePreviewContainer);
        renderPagePreview(mobilePagePreviewBtn, true);
    }, 50);

    subscribe(['language', 'isMobileActionsOpen'], () => renderHeader(headerContainer));
    
    subscribe(['designConfig', 'cardData', 'sidebarScrollTop', 'openAccordions'], (changedKeys) => {
       // Ha csak a designConfig változott, a debounced verziót hívjuk
       if (changedKeys.length === 1 && changedKeys[0] === 'designConfig') {
           debouncedCardRender();
       }
       renderSidebar(sidebarWrapper, { onGeneratePdf: handleGeneratePdf });
    });
    
    subscribe(['editableSample', 'previewsVisible'], () => {
       renderFileUpload(fileuploadContainer, { onFileParse: handleFileParse });
    });

    subscribe(['editableSample', 'designConfig', 'previewsVisible'], (changedKeys) => {
        if (changedKeys.includes('designConfig')) {
            debouncedCardRender();
        } else {
            renderCardPreview(cardPreviewContainer);
            renderCardPreview(mobileCardPreviewBtn, true);
        }
    });

    subscribe(['toasts'], () => renderToastContainer(toastContainerWrapper));
    subscribe(['isModalOpen', 'modalContent', 'previewZoom', 'editableSample', 'designConfig'], () => renderEnlargedPreviewModal(modalContainerWrapper));
    
    // Global state subscriptions for UI toggles (no debounce needed)
    subscribe(['isLoading', 'progress'], () => {
         const loadingSpinner = document.getElementById('loading-spinner');
         if (loadingSpinner) {
            const { isLoading, progress } = getState();
            loadingSpinner.style.display = isLoading ? 'flex' : 'none';
            if (isLoading) {
                loadingSpinner.querySelector('.bg-green-500').style.width = `${progress.percentage}%`;
                loadingSpinner.querySelector('div.text-white').textContent = progress.message;
                loadingSpinner.querySelector('div.text-xl').textContent = `${progress.percentage}%`;
            }
         }
    });

    subscribe(['sidebarVisible'], () => {
        const sidebarWrapper = document.getElementById('sidebar-wrapper');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarWrapper && sidebarToggle) {
            const { sidebarVisible } = getState();
            sidebarWrapper.classList.toggle('w-80', sidebarVisible);
            sidebarWrapper.classList.toggle('w-0', !sidebarVisible);
            sidebarToggle.style.left = sidebarVisible ? 'calc(20rem - 1px)' : '0px';
            sidebarToggle.innerHTML = sidebarVisible 
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class=""><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class=""><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
        }
    });

    subscribe(['isMobileMenuOpen'], () => {
        const overlay = document.getElementById('mobile-menu-overlay');
        const wrapper = document.getElementById('sidebar-wrapper');
        const { isMobileMenuOpen } = getState();
        if (overlay && wrapper) {
            overlay.classList.toggle('hidden', !isMobileMenuOpen);
            wrapper.classList.toggle('-translate-x-full', !isMobileMenuOpen);
            wrapper.classList.toggle('translate-x-0', isMobileMenuOpen);
        }
    });
}

// Alkalmazás indítása
main();