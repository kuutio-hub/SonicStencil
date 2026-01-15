import React, { useState } from 'react';
import type { DesignConfig } from '../types.ts';
import { useLocalization } from '../hooks/useLocalization.tsx';
import { UserIcon, SaveIcon, LoadIcon, UploadIcon } from './ui/Icons.tsx';
import { Button } from './ui/Button.tsx';
import { useDesign } from '../context/DesignContext.tsx';

interface HeaderProps {
  addToast: (message: string, type?: 'success' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({ addToast }) => {
  const { t, setLanguage, language } = useLocalization();
  const { state: designConfig, dispatch } = useDesign();
  const [showLoadModal, setShowLoadModal] = useState(false);

  const handleSave = () => {
    const configName = prompt(t('enterConfigName'));
    if (configName) {
      const savedConfigs = JSON.parse(localStorage.getItem('designConfigs') || '[]');
      const newSavedConfigs = [...savedConfigs, { name: configName, config: designConfig }];
      localStorage.setItem('designConfigs', JSON.stringify(newSavedConfigs));
      addToast(t('configSaved'), 'success');
    }
  };

  const downloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sonicstencil_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast(t('configDownloaded'), 'success');
  };
  
  const handleLoad = (config: DesignConfig) => {
    dispatch({ type: 'LOAD_CONFIG', payload: config });
    setShowLoadModal(false);
    addToast(t('configLoaded'), 'success');
  };
  
  const SavedConfigsModal = () => {
    const savedConfigs: {name: string, config: DesignConfig}[] = JSON.parse(localStorage.getItem('designConfigs') || '[]');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
          <h2 className="text-xl font-bold mb-4">{t('loadConfig')}</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {savedConfigs.length > 0 ? savedConfigs.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600">
                <span className="truncate mr-4">{item.name}</span>
                <Button onClick={() => handleLoad(item.config)} className="py-1 px-3 text-sm">{t('load')}</Button>
              </div>
            )) : <p className="text-gray-400 text-center py-4">{t('noSavedConfigs')}</p>}
          </div>
          <Button onClick={() => setShowLoadModal(false)} className="mt-6 w-full bg-red-600 hover:bg-red-700 border-none">{t('close')}</Button>
        </div>
      </div>
    );
  };


  return (
    <header className="flex-shrink-0 bg-gray-900 border-b border-gray-700 p-4 flex flex-col md:flex-row justify-between items-center z-30 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center font-black text-gray-900 text-xl">S</div>
        <h1 className="text-2xl font-black tracking-tighter text-white">
          SonicStencil
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center">
        <Button onClick={handleSave} title={t('saveConfig')} className="h-10"><SaveIcon /><span className="hidden lg:inline ml-2">{t('save')}</span></Button>
        <Button onClick={() => setShowLoadModal(true)} title={t('loadConfig')} className="h-10"><LoadIcon /><span className="hidden lg:inline ml-2">{t('load')}</span></Button>
        <Button onClick={downloadConfig} title={t('downloadConfig')} className="h-10 bg-blue-600 hover:bg-blue-700"><UploadIcon className="rotate-180" /><span className="hidden lg:inline ml-2">{t('download')}</span></Button>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-10"
        >
          <option value="hu">Magyar</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
        
        <Button disabled title="Coming Soon" className="h-10">
          <UserIcon />
        </Button>
      </div>
      {showLoadModal && <SavedConfigsModal />}
    </header>
  );
};