import { getState, updateState, addToast, setCardData } from './state.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderFileUpload } from './components/FileUpload.js';
import { renderCardPreview } from './components/CardPreview.js';
import { renderPagePreview } from './components/PagePreview.js';
import { renderToastContainer } from './components/ui/Toast.js';
import { renderEnlargedPreviewModal } from './components/EnlargedPreviewModal.js';
import { ArrowLeftIcon, ArrowRightIcon, GenerateIcon } from './components/ui/Icons.js';
import { generatePdf } from './lib/pdfGenerator.js';
import { parseFile } from './lib/fileParser.js';
import { Button } from './components/ui/Button.js';

export async function handleFileParse(file) {
    updateState({ isLoading: true });
    try {
        const normalizeRow = (row) => {
            const normalized = {};
            // Fejlécek keresése kis- és nagybetűre érzéketlenül, aliasok kezelésével
            for (const originalKey in row) {
                const lowerKey = originalKey.toLowerCase().trim();
                if (lowerKey === 'artist') normalized.artist = row[originalKey];
                else if (lowerKey === 'title') normalized.title = row[originalKey];
                else if (lowerKey === 'year') normalized.year = row[originalKey];
                else if (lowerKey === 'url' || lowerKey === 'qr_url') normalized.qr_url = row[originalKey];
                else if (lowerKey === 'code1') normalized.code1 = row[originalKey];
                else if (lowerKey === 'code2') normalized.code2 = row[originalKey];
            }
            return normalized;
        };

        const parsedData = await parseFile(file);
        if (parsedData.length === 0) {
            throw new Error("A fájl üres vagy nem sikerült feldolgozni.");
        }
        
        const data = parsedData.map(normalizeRow);

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            // Az i + 2 a fejléc sort és a 0-alapú indexelést veszi figyelembe
            if (!row || !row.artist || !row.title || !row.year || !row.qr_url) {
                throw new Error(`Érvénytelen vagy hiányzó adat a(z) ${i + 2}. sorban. Kötelező fejlécek: Artist, Title, Year, URL.`);
            }
        }
        setCardData(data);
        addToast(`${data.length} kártya sikeresen betöltve!`, 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba történt';
        addToast(`Hiba a fájl feldolgozása közben: ${errorMessage}`, 'error');
    } finally {
        updateState({ isLoading: false });
    }
}


export async function handleGeneratePdf() {
    const { cardData, designConfig } = getState();
    if (cardData.length === 0 && designConfig.mode === 'card') {
      addToast('Please load card data first.', 'error');
      return;
    }

    const onProgress = (progress) => {
        updateState({ progress });
    };

    updateState({ isLoading: true, progress: { percentage: 0, message: 'Initializing...' } });
    
    // Rövid késleltetés, hogy a UI frissüljön a nehéz munka előtt
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      await generatePdf(onProgress);
      addToast('PDF generated successfully!', 'success');
    } catch (error) {
      console.error("PDF Generation Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      addToast(`Failed to generate PDF: ${errorMessage}`, 'error');
    } finally {
      updateState({ isLoading: false });
    }
}

export function renderApp(container) {
  const state = getState();
  const { isLoading, sidebarVisible, isMobileMenuOpen, cardData, designConfig, progress } = state;

  const appHtml = `
    <div id="loading-spinner" class="fixed inset-0 bg-black bg-opacity-80 flex-col items-center justify-center z-50 transition-opacity duration-300" style="display: ${isLoading ? 'flex' : 'none'}">
        <div class="w-full max-w-md p-4">
            <div class="text-white text-lg text-center mb-4">${progress.message}</div>
            <div class="w-full bg-gray-600 rounded-full h-4 mb-2 overflow-hidden">
                <div class="bg-green-500 h-4 rounded-full transition-all duration-300" style="width: ${progress.percentage}%"></div>
            </div>
            <div class="text-center text-white font-bold text-xl">${progress.percentage}%</div>
        </div>
    </div>
    <div id="toast-container-wrapper"></div>
    <div id="modal-container-wrapper"></div>
    
    <div id="header-container"></div>

    <div class="flex-grow flex h-full overflow-hidden relative">
      <!-- Mobile Menu Overlay -->
      <div id="mobile-menu-overlay" class="fixed inset-0 bg-black/60 z-30 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}"></div>
      
      <!-- Sidebar / Mobile Drawer -->
      <div id="sidebar-wrapper" class="absolute md:relative inset-y-0 left-0 z-40 md:z-auto flex-shrink-0 transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        ${sidebarVisible ? 'w-80' : 'w-0'} 
        h-[calc(100vh-113px)] md:h-[calc(100vh-73px)]
      "></div>
      
      <!-- Desktop Sidebar Toggle -->
      <button id="sidebar-toggle" class="hidden md:block absolute top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-green-700 text-white p-2 rounded-r-lg z-20 transition-all duration-300"
         style="left: ${sidebarVisible ? 'calc(20rem - 1px)' : '0px'}">
         ${sidebarVisible ? ArrowLeftIcon() : ArrowRightIcon()}
      </button>

      <main class="flex-1 flex flex-col md:flex-row overflow-y-auto bg-gray-800/50" style="background-image: radial-gradient(#4a4a4a 1px, transparent 1px); background-size: 20px 20px;">
        <div class="flex-1 p-4 md:p-6">
            <div id="fileupload-container"></div>
            <!-- Mobile Preview Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:hidden">
                <div id="mobile-card-preview-btn"></div>
                <div id="mobile-page-preview-btn"></div>
            </div>
        </div>
        
        <!-- Desktop Previews (Sticky) -->
        <div class="hidden md:block w-full md:w-[450px] xl:w-[550px] flex-shrink-0 p-6">
            <div class="md:sticky md:top-6 space-y-6">
              <div id="card-preview-container"></div>
              <div id="page-preview-container"></div>
            </div>
        </div>
      </main>

      <!-- Mobile Floating Action Button -->
      <div class="md:hidden fixed bottom-16 right-4 z-20">
        ${Button({
            id: 'fab-generate-pdf',
            content: GenerateIcon(),
            disabled: cardData.length === 0 && designConfig.mode === 'card',
            className: "w-16 h-16 rounded-full shadow-lg text-2xl"
        })}
      </div>
    </div>
    <div id="footer-container"></div>
  `;

  container.innerHTML = appHtml;

  // Eseményfigyelők
  container.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
    updateState({ sidebarVisible: !getState().sidebarVisible });
  });

  const mobileMenuOverlay = container.querySelector('#mobile-menu-overlay');
  if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', () => updateState({ isMobileMenuOpen: false }));
  }

  container.querySelector('#fab-generate-pdf')?.addEventListener('click', handleGeneratePdf);
}