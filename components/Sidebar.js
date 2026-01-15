import { getState, t, updateDesignConfig, setDesignConfigMode, addToast } from '../state.js';
import { generateAiBackground } from '../lib/ai.js';
import { renderAccordion, AccordionItem, addAccordionListeners } from './ui/Accordion.js';
import { Slider } from './ui/Slider.js';
import { ColorPicker } from './ui/ColorPicker.js';
import { Button } from './ui/Button.js';
import { GenerateIcon } from './ui/Icons.js';
import { Toggle } from './ui/Toggle.js';

const MM_TO_PX_FACTOR = 3.7795;

function Select({ id, label, value, options }) {
    return `
        <div class="flex flex-col space-y-2">
            <label class="text-sm font-semibold text-gray-300 uppercase tracking-tight">${label}</label>
            <select
                id="${id}"
                class="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            >
                ${options.map(opt => `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
        </div>
    `;
}

function bindSidebarEvents(container, { onGeneratePdf }) {
    // Helper a config frissítéshez
    const addConfigListener = (id, event, category, property, valueExtractor = e => e.target.value) => {
        const el = container.querySelector(`#${id}`);
        if (el) {
            el.addEventListener(event, e => {
                const value = valueExtractor(e);
                updateDesignConfig(category, property, value);
                 // Frissítjük a csúszka melletti kijelzőt
                if (el.type === 'range') {
                    const display = el.nextElementSibling;
                    if (display) display.textContent = value;
                }
            });
        }
    };
    
    // Accordion
    addAccordionListeners(container);
    
    // Mode
    container.querySelector('#mode-select').addEventListener('change', e => setDesignConfigMode(e.target.value));

    // Token (feltételes)
    if (getState().designConfig.mode === 'token') {
        addConfigListener('token-text1', 'input', 'token', 'text1');
        addConfigListener('token-text1-size', 'input', 'token', 'text1Size', e => Number(e.target.value));
        addConfigListener('token-text2', 'input', 'token', 'text2');
        addConfigListener('token-text2-size', 'input', 'token', 'text2Size', e => Number(e.target.value));
        addConfigListener('token-show-frame', 'change', 'token', 'showFrame', e => e.target.checked);
        addConfigListener('token-frame-glow', 'input', 'token', 'frameGlow', e => Number(e.target.value));
        addConfigListener('token-frame-color', 'input', 'token', 'frameColor');
    }

    // General
    addConfigListener('card-size', 'input', 'card', 'width', e => Number(e.target.value) * MM_TO_PX_FACTOR);
    addConfigListener('card-border-radius', 'input', 'card', 'borderRadius', e => Number(e.target.value));
    addConfigListener('card-border-width', 'input', 'card', 'borderWidth', e => Number(e.target.value));
    addConfigListener('card-border-color', 'input', 'card', 'borderColor');
    addConfigListener('card-bg-color', 'input', 'card', 'backgroundColor');
    
    // Visual (feltételes)
    addConfigListener('vinyl-enabled', 'change', 'vinyl', 'enabled', e => e.target.checked);
    if(getState().designConfig.vinyl.enabled) {
        addConfigListener('vinyl-style', 'change', 'vinyl', 'style');
        addConfigListener('vinyl-line-gap', 'input', 'vinyl', 'lineGap', e => Number(e.target.value));
        addConfigListener('vinyl-line-width', 'input', 'vinyl', 'lineWidth', e => Number(e.target.value));
        addConfigListener('vinyl-clip-margin', 'input', 'vinyl', 'clipMargin', e => Number(e.target.value));
        addConfigListener('vinyl-line-color', 'input', 'vinyl', 'lineColor');
        addConfigListener('vinyl-glow-intensity', 'input', 'vinyl', 'glowIntensity', e => Number(e.target.value));
        addConfigListener('vinyl-neon', 'change', 'vinyl', 'neon', e => e.target.checked);
    }


    // Front
    addConfigListener('front-artist-offset', 'input', 'front', 'artistOffset', e => Number(e.target.value));
    addConfigListener('front-title-offset', 'input', 'front', 'titleOffset', e => Number(e.target.value));
    addConfigListener('front-artist-fontsize', 'input', 'front', 'artistFontSize', e => Number(e.target.value));
    addConfigListener('front-artist-color', 'input', 'front', 'artistColor');
    
    // QR Code
    addConfigListener('qr-size', 'input', 'qrCode', 'size', e => Number(e.target.value));
    addConfigListener('qr-color', 'input', 'qrCode', 'color');
    addConfigListener('qr-bg-color', 'input', 'qrCode', 'bgColor');
    addConfigListener('qr-bg-transparent', 'change', 'qrCode', 'bgTransparent', e => e.target.checked);
    addConfigListener('qr-frame', 'change', 'qrCode', 'frame', e => e.target.checked);
    if(getState().designConfig.qrCode.frame) {
      addConfigListener('qr-frame-width', 'input', 'qrCode', 'frameWidth', e => Number(e.target.value));
      addConfigListener('qr-frame-bg-color', 'input', 'qrCode', 'frameBgColor');
    }

    // Page Layout
    addConfigListener('page-autofit', 'change', 'page', 'autoFit', e => e.target.checked);
    addConfigListener('page-cards-per-page', 'input', 'page', 'cardsPerPage', e => Number(e.target.value));
    addConfigListener('page-mirror-backs', 'change', 'page', 'mirrorBacks', e => e.target.checked);

    // AI Button
    container.querySelector('#surprise-me-button').addEventListener('click', async () => {
        try {
            const base64 = await generateAiBackground();
            updateDesignConfig('vinyl', 'aiBackground', base64);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            addToast(`AI background generation failed: ${errorMessage}`, "error");
        }
    });
    
    // PDF Button
    container.querySelector('#generate-pdf-button').addEventListener('click', onGeneratePdf);
}

export function renderSidebar(container, { onGeneratePdf }) {
    if (!container) return;
    const { designConfig: config, cardData } = getState();

    const accordionItems = [
        AccordionItem({ title: t('appMode'), content:
            Select({ id: 'mode-select', label: t('mode'), value: config.mode, options: [
                {value: 'card', label: t('quizCard')},
                {value: 'token', label: t('gameToken')}
            ]})
        }),
        config.mode === 'token' ? AccordionItem({ title: t('tokenSettings'), content: `
            <div class="space-y-4">
                <div class="flex flex-col space-y-2">
                    <label class="text-sm font-semibold text-gray-400">${t('tokenText1')}</label>
                    <input id="token-text1" class="bg-gray-800 border border-gray-700 p-2 rounded" value="${config.token.text1}" />
                </div>
                ${Slider({ id: 'token-text1-size', label: t('mainLabelFontSize'), value: config.token.text1Size, min: 10, max: 60 })}
                <div class="flex flex-col space-y-2">
                    <label class="text-sm font-semibold text-gray-400">${t('tokenSubtitle')}</label>
                    <input id="token-text2" class="bg-gray-800 border border-gray-700 p-2 rounded" value="${config.token.text2 || ''}" />
                </div>
                ${Slider({ id: 'token-text2-size', label: t('subtitleFontSize'), value: config.token.text2Size, min: 8, max: 40 })}
                ${Toggle({ id: 'token-show-frame', label: t('showTokenFrame'), checked: config.token.showFrame })}
                ${Slider({ id: 'token-frame-glow', label: t('glowIntensity'), value: config.token.frameGlow, min: 0, max: 30 })}
                ${ColorPicker({ id: 'token-frame-color', label: t('frameColor'), value: config.token.frameColor })}
            </div>
        `}) : null,
        AccordionItem({ title: t('generalSettings'), content: `
            ${Slider({ id: 'card-size', label: t('cardSizeMm'), value: Math.round(config.card.width / MM_TO_PX_FACTOR), min: 30, max: 80 })}
            ${Slider({ id: 'card-border-radius', label: t('cardBorderRadius'), value: config.card.borderRadius, min: 0, max: 50 })}
            ${Slider({ id: 'card-border-width', label: t('borderWidth'), value: config.card.borderWidth, min: 0, max: 10 })}
            ${ColorPicker({ id: 'card-border-color', label: t('borderColor'), value: config.card.borderColor })}
            ${ColorPicker({ id: 'card-bg-color', label: t('backgroundColor'), value: config.card.backgroundColor })}
        `}),
        AccordionItem({ title: t('visualAppearance'), content: `
            ${Button({ id: 'surprise-me-button', content: t('surpriseMe'), className: "w-full mb-4 bg-purple-600 hover:bg-purple-700"})}
            ${Toggle({ id: 'vinyl-enabled', label: t('enableEffects'), checked: config.vinyl.enabled })}
            ${config.vinyl.enabled ? `
                <div class="mt-4 space-y-4 border-t border-gray-800 pt-4">
                    ${Select({ id: 'vinyl-style', label: t('style'), value: config.vinyl.style, options: [
                        {value: 'glitch', label: t('glitchVinyl')}, {value: 'classic', label: t('classicGrooves')},
                        {value: 'soundwave', label: t('soundwave')}, {value: 'equalizer', label: t('equalizer')},
                        {value: 'sunburst', label: t('sunburst')}, {value: 'lissajous', label: 'Lissajous'},
                        {value: 'nebula', label: 'Nebula'}, {value: 'grid', label: 'Grid'},
                        {value: 'cassette', label: t('cassetteHubs')}, {value: 'none', label: t('styleNone')}
                    ]})}
                    ${Slider({ id: 'vinyl-line-gap', label: t('lineDistance'), value: config.vinyl.lineGap, min: 0, max: 20 })}
                    ${Slider({ id: 'vinyl-line-width', label: t('lineWidth'), value: config.vinyl.lineWidth, min: 0.1, max: 5, step: 0.1 })}
                    ${Slider({ id: 'vinyl-clip-margin', label: t('clipMarginPt'), value: config.vinyl.clipMargin, min: -20, max: 40 })}
                    ${ColorPicker({ id: 'vinyl-line-color', label: t('lineColor'), value: config.vinyl.lineColor })}
                    ${Slider({ id: 'vinyl-glow-intensity', label: t('glowIntensity'), value: config.vinyl.glowIntensity, min: 0, max: 20 })}
                    ${Toggle({ id: 'vinyl-neon', label: t('neonColors'), checked: config.vinyl.neon })}
                </div>` : ''
            }
        `}),
        AccordionItem({ title: t('frontSide'), content: `
            ${Slider({ id: 'front-artist-offset', label: t('artistOffsetPt'), value: config.front.artistOffset, min: 0, max: 50 })}
            ${Slider({ id: 'front-title-offset', label: t('titleOffsetPt'), value: config.front.titleOffset, min: 0, max: 50 })}
            ${Slider({ id: 'front-artist-fontsize', label: t('artistFontSize'), value: config.front.artistFontSize, min: 8, max: 40 })}
            ${ColorPicker({ id: 'front-artist-color', label: t('artistColor'), value: config.front.artistColor })}
        `}),
        AccordionItem({ title: t('qrCode'), content: `
            ${Slider({ id: 'qr-size', label: t('size'), value: config.qrCode.size, min: 20, max: 150 })}
            ${ColorPicker({ id: 'qr-color', label: t('codeColor'), value: config.qrCode.color })}
            ${ColorPicker({ id: 'qr-bg-color', label: t('backgroundColor'), value: config.qrCode.bgColor })}
            ${Toggle({ id: 'qr-bg-transparent', label: t('transparentBg'), checked: config.qrCode.bgTransparent })}
            ${Toggle({ id: 'qr-frame', label: t('showFrame'), checked: config.qrCode.frame })}
            ${config.qrCode.frame ? `
                <div class="mt-2 space-y-2">
                    ${Slider({ id: 'qr-frame-width', label: t('framePadding'), value: config.qrCode.frameWidth, min: 0, max: 20 })}
                    ${ColorPicker({ id: 'qr-frame-bg-color', label: t('frameBgColor'), value: config.qrCode.frameBgColor })}
                </div>` : ''
            }
        `}),
        AccordionItem({ title: t('pageLayout'), content: `
            ${Toggle({ id: 'page-autofit', label: t('autoFit'), checked: config.page.autoFit })}
            ${Slider({ id: 'page-cards-per-page', label: t('cardsPerPage'), value: config.page.cardsPerPage, min: 1, max: 40, disabled: config.page.autoFit })}
            ${Toggle({ id: 'page-mirror-backs', label: t('mirrorBacks'), checked: config.page.mirrorBacks })}
        `})
    ];
    
    const sidebarHtml = `
      <aside class="bg-gray-900 text-white w-full h-full flex flex-col border-r border-gray-800 shadow-2xl">
        <div class="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 class="text-xl font-black tracking-tighter uppercase">${t('controls')}</h2>
        </div>
        <div class="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide">
          ${renderAccordion(accordionItems.filter(Boolean))}
        </div>
        <div class="p-4 bg-gray-900 border-t border-gray-800">
          ${Button({ 
              id: 'generate-pdf-button', 
              content: `${GenerateIcon()} ${t('generatePdf')}`, 
              disabled: cardData.length === 0 && config.mode === 'card', 
              className: "w-full text-lg h-14 uppercase tracking-widest font-black shadow-lg" 
          })}
        </div>
      </aside>
    `;
    container.innerHTML = sidebarHtml;
    bindSidebarEvents(container, { onGeneratePdf });
}
