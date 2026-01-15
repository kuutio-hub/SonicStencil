import React from 'react';
import type { DesignConfig, DesignConfigCategory } from '../types.ts';
import { Accordion, AccordionItem } from './ui/Accordion.tsx';
import { Slider } from './ui/Slider.tsx';
import { ColorPicker } from './ui/ColorPicker.tsx';
import { Button } from './ui/Button.tsx';
import { useLocalization } from '../hooks/useLocalization.tsx';
import { GenerateIcon } from './ui/Icons.tsx';
import { Toggle } from './ui/Toggle.tsx';
import { useDesign } from '../context/DesignContext.tsx';
import { useCardData } from '../context/CardDataContext.tsx';
import { generateAiBackground } from '../lib/ai.ts';

interface SidebarProps {
  onGeneratePdf: () => void;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const MM_TO_PX_FACTOR = 3.7795;

const Select: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode}> = 
({label, value, onChange, children}) => (
    <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-tight">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        >
            {children}
        </select>
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ onGeneratePdf, addToast }) => {
  const { t } = useLocalization();
  const { state: config, dispatch } = useDesign();
  const { cardData } = useCardData();
  
  const handleConfigChange = (
    category: DesignConfigCategory,
    property: string,
    value: any
  ) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { category, property, value } });
  };

  const surpriseMe = async () => {
    try {
        const base64 = await generateAiBackground();
        handleConfigChange('vinyl', 'aiBackground', base64);
    } catch (e) {
        console.error("AI Gen Failed", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        addToast(`AI background generation failed: ${errorMessage}`, "error");
    }
  };

  return (
    <aside className="bg-gray-900 text-white w-full h-full flex flex-col border-r border-gray-800 shadow-2xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-black tracking-tighter uppercase">{t('controls')}</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide">
        <Accordion>
          <AccordionItem title={t('appMode')}>
             <Select label={t('mode')} value={config.mode} onChange={e => dispatch({ type: 'SET_MODE', payload: e.target.value as any })}>
                <option value="card">{t('quizCard')}</option>
                <option value="token">{t('gameToken')}</option>
             </Select>
          </AccordionItem>

          {config.mode === 'token' && (
             <AccordionItem title={t('tokenSettings')}>
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-semibold text-gray-400">{t('tokenText1')}</label>
                        <input className="bg-gray-800 border border-gray-700 p-2 rounded" value={config.token.text1} onChange={e => handleConfigChange('token', 'text1', e.target.value)} />
                    </div>
                    <Slider label={t('mainLabelFontSize')} value={config.token.text1Size} min={10} max={60} onChange={v => handleConfigChange('token', 'text1Size', v)} />
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-semibold text-gray-400">{t('tokenSubtitle')}</label>
                        <input className="bg-gray-800 border border-gray-700 p-2 rounded" value={config.token.text2 || ''} onChange={e => handleConfigChange('token', 'text2', e.target.value)} />
                    </div>
                    <Slider label={t('subtitleFontSize')} value={config.token.text2Size} min={8} max={40} onChange={v => handleConfigChange('token', 'text2Size', v)} />
                    <Toggle label={t('showTokenFrame')} checked={config.token.showFrame} onChange={v => handleConfigChange('token', 'showFrame', v)} />
                    <Slider label={t('glowIntensity')} value={config.token.frameGlow} min={0} max={30} onChange={v => handleConfigChange('token', 'frameGlow', v)} />
                    <ColorPicker label={t('frameColor')} value={config.token.frameColor} onChange={v => handleConfigChange('token', 'frameColor', v)} />
                </div>
             </AccordionItem>
          )}
          
          <AccordionItem title={t('generalSettings')}>
            <Slider label={t('cardSizeMm')} value={Math.round(config.card.width / MM_TO_PX_FACTOR)} min={30} max={80} onChange={v => dispatch({type: 'UPDATE_SETTING', payload: {category: 'card', property: 'width', value: v * MM_TO_PX_FACTOR}})} />
            <Slider label={t('cardBorderRadius')} value={config.card.borderRadius} min={0} max={50} onChange={v => handleConfigChange('card', 'borderRadius', v)} />
            <Slider label={t('borderWidth')} value={config.card.borderWidth} min={0} max={10} onChange={v => handleConfigChange('card', 'borderWidth', v)} />
            <ColorPicker label={t('borderColor')} value={config.card.borderColor} onChange={v => handleConfigChange('card', 'borderColor', v)} />
            <ColorPicker label={t('backgroundColor')} value={config.card.backgroundColor} onChange={v => handleConfigChange('card', 'backgroundColor', v)} />
          </AccordionItem>
          
          <AccordionItem title={t('visualAppearance')}>
             <Button onClick={surpriseMe} className="w-full mb-4 bg-purple-600 hover:bg-purple-700">{t('surpriseMe')}</Button>
             <Toggle label={t('enableEffects')} checked={config.vinyl.enabled} onChange={v => handleConfigChange('vinyl', 'enabled', v)} />
             {config.vinyl.enabled && (
                <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
                <Select label={t('style')} value={config.vinyl.style} onChange={e => handleConfigChange('vinyl', 'style', e.target.value as any)}>
                    <option value="glitch">{t('glitchVinyl')}</option>
                    <option value="classic">{t('classicGrooves')}</option>
                    <option value="soundwave">{t('soundwave')}</option>
                    <option value="equalizer">{t('equalizer')}</option>
                    <option value="sunburst">{t('sunburst')}</option>
                    <option value="lissajous">Lissajous</option>
                    <option value="nebula">Nebula</option>
                    <option value="grid">Grid</option>
                    <option value="cassette">{t('cassetteHubs')}</option>
                    <option value="none">{t('styleNone')}</option>
                </Select>
                <Slider label={t('lineDistance')} value={config.vinyl.lineGap} min={0} max={20} onChange={v => handleConfigChange('vinyl', 'lineGap', v)} />
                <Slider label={t('lineWidth')} value={config.vinyl.lineWidth} min={0.1} max={5} step={0.1} onChange={v => handleConfigChange('vinyl', 'lineWidth', v)} />
                <Slider label={t('clipMarginPt')} value={config.vinyl.clipMargin} min={-20} max={40} onChange={v => handleConfigChange('vinyl', 'clipMargin', v)} />
                <ColorPicker label={t('lineColor')} value={config.vinyl.lineColor} onChange={v => handleConfigChange('vinyl', 'lineColor', v)} />
                <Slider label={t('glowIntensity')} value={config.vinyl.glowIntensity} min={0} max={20} onChange={v => handleConfigChange('vinyl', 'glowIntensity', v)} />
                <Toggle label={t('neonColors')} checked={config.vinyl.neon} onChange={v => handleConfigChange('vinyl', 'neon', v)} />
                </div>
             )}
          </AccordionItem>
          
          <AccordionItem title={t('frontSide')}>
            <Slider label={t('artistOffsetPt')} value={config.front.artistOffset} min={0} max={50} onChange={v => handleConfigChange('front', 'artistOffset', v)} />
            <Slider label={t('titleOffsetPt')} value={config.front.titleOffset} min={0} max={50} onChange={v => handleConfigChange('front', 'titleOffset', v)} />
            <Slider label={t('artistFontSize')} value={config.front.artistFontSize} min={8} max={40} onChange={v => handleConfigChange('front', 'artistFontSize', v)} />
            <ColorPicker label={t('artistColor')} value={config.front.artistColor} onChange={v => handleConfigChange('front', 'artistColor', v)} />
          </AccordionItem>

          <AccordionItem title={t('qrCode')}>
            <Slider label={t('size')} value={config.qrCode.size} min={20} max={150} onChange={v => handleConfigChange('qrCode', 'size', v)} />
            <ColorPicker label={t('codeColor')} value={config.qrCode.color} onChange={v => handleConfigChange('qrCode', 'color', v)} />
            <ColorPicker label={t('backgroundColor')} value={config.qrCode.bgColor} onChange={v => handleConfigChange('qrCode', 'bgColor', v)} />
            <Toggle label={t('transparentBg')} checked={config.qrCode.bgTransparent} onChange={v => handleConfigChange('qrCode', 'bgTransparent', v)} />
            <Toggle label={t('showFrame')} checked={config.qrCode.frame} onChange={v => handleConfigChange('qrCode', 'frame', v)} />
            {config.qrCode.frame && (
                <div className="mt-2 space-y-2">
                    <Slider label={t('framePadding')} value={config.qrCode.frameWidth} min={0} max={20} onChange={v => handleConfigChange('qrCode', 'frameWidth', v)} />
                    <ColorPicker label={t('frameBgColor')} value={config.qrCode.frameBgColor} onChange={v => handleConfigChange('qrCode', 'frameBgColor', v)} />
                </div>
            )}
          </AccordionItem>

          <AccordionItem title={t('pageLayout')}>
            <Toggle label={t('autoFit')} checked={config.page.autoFit} onChange={v => handleConfigChange('page', 'autoFit', v)} />
            <Slider label={t('cardsPerPage')} value={config.page.cardsPerPage} min={1} max={40} onChange={v => handleConfigChange('page', 'cardsPerPage', v)} disabled={config.page.autoFit} />
            <Toggle label={t('mirrorBacks')} checked={config.page.mirrorBacks} onChange={v => handleConfigChange('page', 'mirrorBacks', v)} />
          </AccordionItem>
        </Accordion>
      </div>
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <Button onClick={onGeneratePdf} disabled={cardData.length === 0 && config.mode === 'card'} className="w-full text-lg h-14 uppercase tracking-widest font-black shadow-lg">
          <GenerateIcon />
          {t('generatePdf')}
        </Button>
      </div>
    </aside>
  );
};