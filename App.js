import { getState, updateState, addToast, setCardData } from './state.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderFileUpload } from './components/FileUpload.js';
import { renderCardPreview } from './components/CardPreview.js';
import { renderPagePreview } from './components/PagePreview.js';
import { renderToastContainer } from './components/ui/Toast.js';
import { renderEnlargedPreviewModal } from './components/EnlargedPreviewModal.js';
import { ArrowLeftIcon, ArrowRightIcon } from './components/ui/Icons.js';
import { generatePdf } from './lib/pdfGenerator.js';
import { parseFile } from './lib/fileParser.js';

async function handleFileParse(file) {
    updateState({ isLoading: true });
    try {
      const data = await parseFile(file);
      if (data.length === 0) {
          throw new Error("File is empty or could not be parsed.");
      }
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || !row.artist || !row.title || !row.year || !row.qr_url) {
            throw new Error(`Invalid data in row ${i + 2}. Required headers are: artist, title, year, qr_url`);
        }
      }
      setCardData(data);
      addToast(`${data.length} cards loaded successfully!`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      addToast(`Error parsing file: ${errorMessage}`, 'error');
    } finally {
      updateState({ isLoading: false });
    }
}

async function handleGeneratePdf() {
    const { cardData, designConfig } = getState();
    if (cardData.length === 0 && designConfig.mode === 'card') {
      addToast('Please load card data first.', 'error');
      return;
    }
    updateState({ isLoading: true });
    addToast('Generating PDF... This may take a moment.', 'success');
    try {
      await generatePdf();
      addToast('PDF generated successfully!', 'success');
    } catch (error) {
      console.error("PDF Generation Error:", error);
      addToast('Failed to generate PDF.', 'error');
    } finally {
      updateState({ isLoading: false });
    }
}

export function renderApp(container) {
  const state = getState();
  const { isLoading, sidebarVisible, previewsVisible } = state;

  const appHtml = `
    ${isLoading ? `
      <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
          <p class="text-white text-lg mt-4">Processing...</p>
        </div>
      </div>` : ''
    }
    <div id="toast-container-wrapper"></div>
    <div id="modal-container-wrapper"></div>
    
    <div id="header-container"></div>

    <div class="flex-grow flex h-full overflow-hidden relative">
      <div id="sidebar-wrapper" class="flex-shrink-0 transition-all duration-300 ${sidebarVisible ? 'w-96' : 'w-0'} h-[calc(100vh-73px)]"></div>
      
      <button id="sidebar-toggle" class="absolute top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-green-700 text-white p-2 rounded-r-lg z-20 transition-all duration-300"
         style="left: ${sidebarVisible ? 'calc(24rem - 1px)' : '0px'}">
         ${sidebarVisible ? ArrowLeftIcon() : ArrowRightIcon()}
      </button>

      <main class="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-gray-800/50" style="background-image: radial-gradient(#4a4a4a 1px, transparent 1px); background-size: 20px 20px;">
        <div id="fileupload-container"></div>
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div id="card-preview-container"></div>
          <div id="page-preview-container"></div>
        </div>
      </main>
    </div>
  `;

  container.innerHTML = appHtml;

  // Gyerek komponensek renderelése a megfelelő konténerekbe
  renderHeader(container.querySelector('#header-container'));
  renderSidebar(container.querySelector('#sidebar-wrapper'), { onGeneratePdf: handleGeneratePdf });
  renderFileUpload(container.querySelector('#fileupload-container'), { 
      onFileParse: handleFileParse,
  });
  renderCardPreview(container.querySelector('#card-preview-container'));
  renderPagePreview(container.querySelector('#page-preview-container'));
  renderToastContainer(container.querySelector('#toast-container-wrapper'));
  renderEnlargedPreviewModal(container.querySelector('#modal-container-wrapper'));

  // App-szintű eseményfigyelők
  container.querySelector('#sidebar-toggle').addEventListener('click', () => {
    updateState({ sidebarVisible: !getState().sidebarVisible });
  });
}
