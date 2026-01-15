import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { CardPreview } from './components/CardPreview.tsx';
import { PagePreview } from './components/PagePreview.tsx';
import { Header } from './components/Header.tsx';
import { FileUpload } from './components/FileUpload.tsx';
import { ToastContainer, Toast } from './components/ui/Toast.tsx';
import type { CardData, DesignConfig, ToastMessage } from './types.ts';
import { SAMPLE_CARD_DATA } from './constants.ts';
import { generatePdf } from './lib/pdfGenerator.ts';
import { parseFile } from './lib/fileParser.ts';
import { useLocalization } from './hooks/useLocalization.tsx';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from './components/ui/Icons.tsx';
import { Card } from './components/Card.tsx';
import { useDesign } from './context/DesignContext.tsx';
import { useCardData } from './context/CardDataContext.tsx';

const EnlargedPreviewModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
    const { t } = useLocalization();
    const { state: config } = useDesign();
    // Use card data from context if available, otherwise fallback to sample
    const { cardData } = useCardData();
    const sampleData = cardData[0] || SAMPLE_CARD_DATA;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 p-4 rounded-lg shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><CloseIcon /></button>
                <div className="flex items-center justify-center gap-16 p-8">
                     <div className="flex flex-col items-center">
                        <h3 className="font-bold mb-4 text-gray-400">{t('front')}</h3>
                        <div style={{ transform: 'scale(2)', margin: '50px' }}>
                           <Card data={sampleData} side="front" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <h3 className="font-bold mb-4 text-gray-400">{t('back')}</h3>
                        <div style={{ transform: 'scale(2)', margin: '50px' }}>
                           <Card data={sampleData} side="back" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function App() {
  const { state: designConfig } = useDesign();
  const { cardData, setCardData } = useCardData();

  const [previewsVisible, setPreviewsVisible] = useState({ card: true, page: true, editor: true });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleFileParse = async (file: File) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (cardData.length === 0 && designConfig.mode === 'card') {
      addToast('Please load card data first.', 'error');
      return;
    }
    setIsLoading(true);
    addToast('Generating PDF... This may take a moment.', 'success');
    try {
      await generatePdf(cardData, designConfig);
      addToast('PDF generated successfully!', 'success');
    } catch (error) {
      console.error("PDF Generation Error:", error);
      addToast('Failed to generate PDF.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
              <p className="text-white text-lg mt-4">Processing...</p>
            </div>
          </div>
        )}
        <ToastContainer>
          {toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />)}
        </ToastContainer>
        
        {isModalOpen && <EnlargedPreviewModal onClose={() => setIsModalOpen(false)} />}
        
        <Header addToast={addToast} />

        <div className="flex-grow flex h-full overflow-hidden relative">
          <div className={`flex-shrink-0 transition-all duration-300 ${sidebarVisible ? 'w-96' : 'w-0'} h-[calc(100vh-73px)]`}>
             <Sidebar
              onGeneratePdf={handleGeneratePdf}
              addToast={addToast}
            />
          </div>
          
          <button 
             onClick={() => setSidebarVisible(!sidebarVisible)} 
             className="absolute top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-green-700 text-white p-2 rounded-r-lg z-20 transition-all duration-300"
             style={{ left: sidebarVisible ? 'calc(24rem - 1px)' : '0' }}
          >
             {sidebarVisible ? <ArrowLeftIcon /> : <ArrowRightIcon />}
           </button>

          <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-gray-800/50" style={{ backgroundImage: "radial-gradient(#4a4a4a 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            
            <FileUpload 
              onFileParse={handleFileParse} 
              isVisible={previewsVisible.editor}
              toggleVisibility={() => setPreviewsVisible(p => ({...p, editor: !p.editor}))}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <CardPreview 
                isVisible={previewsVisible.card}
                toggleVisibility={() => setPreviewsVisible(p => ({...p, card: !p.card}))}
                onEnlarge={() => setIsModalOpen(true)}
              />
               <PagePreview 
                  isVisible={previewsVisible.page}
                  toggleVisibility={() => setPreviewsVisible(p => ({...p, page: !p.page}))}
                />
            </div>
          </main>
        </div>
      </div>
  );
}