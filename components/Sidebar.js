import { getState, t, updateState, updateDesignConfig, setDesignConfigMode, addToast } from '../state.js';
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

function SectionTitle(title) {
    return `<h4 class="text-xs font-bold text-gray-400 uppercase pt-2 pb-1 border-b border-gray-600 mb-3">${title}</h4>`;
}

function bindSidebarEvents(container, { onGeneratePdf, accordionItemIds }) {
    
    // Helper a csúszkák és beviteli mezők kétirányú összekötéséhez
    const bindSlider = (baseId, category, property, valueTransformer = v => v) => {
        const sliderEl = container.querySelector(`#${baseId}`);
        const inputEl = container.querySelector(`#${baseId}-input`);

        if (sliderEl && inputEl) {
            sliderEl.addEventListener('input', (e) => { // 'input' a folyamatos frissítéshez
                inputEl.value = e.target.value;
            });
            sliderEl.addEventListener('change', (e) => { // 'change' az állapot frissítéséhez
                updateDesignConfig(category, property, valueTransformer(e.target.value));
            });
            inputEl.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                const min = parseFloat(sliderEl.min);
                const max = parseFloat(sliderEl.max);
                const sanitizedValue = Math.max(min, Math.min(value, max));
                
                sliderEl.value = sanitizedValue;
                e.target.value = sanitizedValue; // Visszaírjuk a validált értéket
                updateDesignConfig(category, property, valueTransformer(sanitizedValue));
            });
        }
    };

    const addConfigListener = (id, event, category, property, valueExtractor = e => e.target.value) => {
        const el = container.querySelector(`#${id}`);
        if (el) {
            el.addEventListener(event, e => {
                const value = valueExtractor(e);
                updateDesignConfig(category, property, value);
            });
        }
    };
    
    addAccordionListeners(container, accordionItemIds);
    
    container.querySelector('#mode-select').addEventListener('change', e => setDesignConfigMode(e.target.value));
    
    // Görgetési pozíció mentése
    const scrollContainer = container.querySelector('.sidebar-scroll-container');
    if(scrollContainer) {
        scrollContainer.addEventListener('scroll', (e) => {
            // Nem kell notify(), hogy ne okozzon re-rendert görgetés közben
            getState().sidebarScrollTop = e.target.scrollTop;
        });
    }


    if (getState().designConfig.mode === 'token') {
        addConfigListener('token-text1', 'change', 'token', 'text1');
        bindSlider('token-text1-size', 'token', 'text1Size');
        addConfigListener('token-text2', 'change', 'token', 'text2');
        bindSlider('token-text2-size', 'token', 'text2Size');
        bindSlider('token-text-stroke-width', 'token', 'textStrokeWidth');
    }

    // General
    bindSlider('card-size', 'card', 'width', v => Number(v) * MM_TO_PX_FACTOR);
    bindSlider('card-border-radius', 'card', 'borderRadius');
    bindSlider('card-border-width', 'card', 'borderWidth');
    addConfigListener('card-border-color', 'change', 'card', 'borderColor');
    addConfigListener('card-bg-color', 'change', 'card', 'backgroundColor');
    addConfigListener('card-show-border', 'change', 'card', 'showBorder', e => e.target.checked);
    addConfigListener('card-border-on-front', 'change', 'card', 'borderOnFront', e => e.target.checked);
    addConfigListener('card-border-on-back', 'change', 'card', 'borderOnBack', e => e.target.checked);

    // Front Side
    if(getState().designConfig.mode === 'card') {
      // Visual
      addConfigListener('vinyl-enabled', 'change', 'vinyl', 'enabled', e => e.target.checked);
      if(getState().designConfig.vinyl.enabled) {
          addConfigListener('vinyl-style', 'change', 'vinyl', 'style');
          bindSlider('vinyl-glitch-segments', 'vinyl', 'glitchSegments');
          bindSlider('vinyl-glitch-gap-min', 'vinyl', 'glitchGapMin');
          bindSlider('vinyl-glitch-gap-max', 'vinyl', 'glitchGapMax');
          bindSlider('vinyl-line-width', 'vinyl', 'lineWidth');
          bindSlider('vinyl-clip-margin', 'vinyl', 'clipMargin');
          addConfigListener('vinyl-line-color', 'change', 'vinyl', 'lineColor');
          bindSlider('vinyl-glow-intensity', 'vinyl', 'glowIntensity');
          addConfigListener('vinyl-neon', 'change', 'vinyl', 'neon', e => e.target.checked);
          addConfigListener('vinyl-show-center-label', 'change', 'vinyl', 'showCenterLabel', e => e.target.checked);
          bindSlider('vinyl-soundwave-points', 'vinyl', 'soundwavePoints');
          bindSlider('vinyl-equalizer-bars', 'vinyl', 'equalizerBars');
      }
      
      container.querySelector('#surprise-me-button')?.addEventListener('click', async () => {
        try {
            const base64 = await generateAiBackground();
            updateDesignConfig('vinyl', 'aiBackground', base64);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            addToast(`AI background generation failed: ${errorMessage}`, "error");
        }
      });
       container.querySelector('#remove-ai-bg')?.addEventListener('click', () => {
        updateDesignConfig('vinyl', 'aiBackground', '');
      });

      // QR Code
      bindSlider('qr-size', 'qrCode', 'size');
      addConfigListener('qr-color', 'change', 'qrCode', 'color');
      addConfigListener('qr-bg-color', 'change', 'qrCode', 'bgColor');
      addConfigListener('qr-bg-transparent', 'change', 'qrCode', 'bgTransparent', e => e.target.checked);
      addConfigListener('qr-frame', 'change', 'qrCode', 'frame', e => e.target.checked);
      if(getState().designConfig.qrCode.frame) {
        bindSlider('qr-frame-width', 'qrCode', 'frameWidth');
        bindSlider('qr-frame-border-radius', 'qrCode', 'frameBorderRadius');
        addConfigListener('qr-frame-bg-color', 'change', 'qrCode', 'frameBgColor');
      }
    }

    // Back Side
    if(getState().designConfig.mode === 'card') {
      // Content
      addConfigListener('back-show-artist', 'change', 'back', 'showArtist', e => e.target.checked);
      addConfigListener('back-show-title', 'change', 'back', 'showTitle', e => e.target.checked);
      addConfigListener('back-show-year', 'change', 'back', 'showYear', e => e.target.checked);
      addConfigListener('back-show-codes', 'change', 'back', 'showCodes', e => e.target.checked);

      // Typography
      addConfigListener('typography-font-family', 'change', 'typography', 'fontFamily');
      addConfigListener('typography-font-variant', 'change', 'typography', 'fontVariant');
      bindSlider('typography-artist-weight', 'typography', 'artistWeight');
      addConfigListener('typography-artist-transform', 'change', 'typography', 'artistTransform');
      bindSlider('typography-artist-letter-spacing', 'typography', 'artistLetterSpacing');
      bindSlider('typography-title-weight', 'typography', 'titleWeight');
      addConfigListener('typography-title-transform', 'change', 'typography', 'titleTransform');
      bindSlider('typography-title-letter-spacing', 'typography', 'titleLetterSpacing');
      bindSlider('typography-year-weight', 'typography', 'yearWeight');

      // Layout
      bindSlider('front-paddingX', 'front', 'paddingX');
      bindSlider('back-artist-offset-y', 'back', 'artistOffsetY');
      bindSlider('back-title-offset-y', 'back', 'titleOffsetY');
      bindSlider('back-code-offset-x', 'back', 'codeOffsetX');
      bindSlider('back-artist-fontsize', 'back', 'artistFontSize');
      bindSlider('back-title-fontsize', 'back', 'titleFontSize');
      bindSlider('back-year-fontsize', 'back', 'yearFontSize');
    }

    // Page Layout
    addConfigListener('page-autofit', 'change', 'page', 'autoFit', e => e.target.checked);
    bindSlider('page-cards-per-page', 'page', 'cardsPerPage');
    bindSlider('page-gap-x', 'page', 'gapX');
    bindSlider('page-gap-y', 'page', 'gapY');
    addConfigListener('page-mirror-backs', 'change', 'page', 'mirrorBacks', e => e.target.checked);
    
    const generatePdfButton = container.querySelector('#generate-pdf-button');
    if (generatePdfButton) {
        generatePdfButton.addEventListener('click', onGeneratePdf);
    }
}

export function renderSidebar(container, { onGeneratePdf }) {
    if (!container) return;
    const { designConfig: config, cardData, sidebarScrollTop } = getState();
    const isCardMode = config.mode === 'card';

    const frontSideAccordions = [
        AccordionItem({ id: 'visualAppearance', title: t('visualAppearance'), content: `
            ${Button({ id: 'surprise-me-button', content: t('surpriseMe'), className: "w-full mb-2 bg-purple-600 hover:bg-purple-700"})}
            ${config.vinyl.aiBackground ? Button({ id: 'remove-ai-bg', content: t('removeAiBackground'), className: "w-full mb-4 bg-red-600 hover:bg-red-700" }) : ''}
            ${Toggle({ id: 'vinyl-enabled', label: t('enableEffects'), checked: config.vinyl.enabled })}
            ${config.vinyl.enabled ? `
                <div class="mt-4 space-y-4">
                    ${Toggle({ id: 'vinyl-show-center-label', label: t('showCenterLabel'), checked: config.vinyl.showCenterLabel })}
                    ${Select({ id: 'vinyl-style', label: t('style'), value: config.vinyl.style, options: [
                        {value: 'glitch', label: t('glitchVinyl')}, {value: 'classic', label: t('classicGrooves')},
                        {value: 'soundwave', label: t('soundwave')}, {value: 'equalizer', label: t('equalizer')},
                        {value: 'sunburst', label: t('sunburst')}, {value: 'lissajous', label: 'Lissajous'},
                        {value: 'nebula', label: 'Nebula'}, {value: 'grid', label: 'Grid'},
                        {value: 'cassette', label: t('cassetteHubs')}, {value: 'none', label: t('styleNone')}
                    ]})}
                    ${config.vinyl.style === 'glitch' ? `
                      ${Slider({ id: 'vinyl-glitch-segments', label: t('glitchSegments'), value: config.vinyl.glitchSegments, min: 2, max: 12 })}
                      ${Slider({ id: 'vinyl-glitch-gap-min', label: t('glitchGapMin'), value: config.vinyl.glitchGapMin, min: 0, max: 90 })}
                      ${Slider({ id: 'vinyl-glitch-gap-max', label: t('glitchGapMax'), value: config.vinyl.glitchGapMax, min: 0, max: 90 })}
                    ` : ''}
                    ${config.vinyl.style === 'soundwave' ? Slider({ id: 'vinyl-soundwave-points', label: t('soundwavePoints'), value: config.vinyl.soundwavePoints, min: 50, max: 500 }) : ''}
                    ${config.vinyl.style === 'equalizer' ? Slider({ id: 'vinyl-equalizer-bars', label: t('equalizerBars'), value: config.vinyl.equalizerBars, min: 10, max: 100 }) : ''}
                    ${Slider({ id: 'vinyl-line-width', label: t('lineWidth'), value: config.vinyl.lineWidth, min: 0.1, max: 5, step: 0.1 })}
                    ${Slider({ id: 'vinyl-clip-margin', label: t('clipMarginPt'), value: config.vinyl.clipMargin, min: -50, max: 50 })}
                    ${ColorPicker({ id: 'vinyl-line-color', label: t('lineColor'), value: config.vinyl.lineColor })}
                    ${Slider({ id: 'vinyl-glow-intensity', label: t('glowIntensity'), value: config.vinyl.glowIntensity, min: 0, max: 20 })}
                    ${Toggle({ id: 'vinyl-neon', label: t('neonColors'), checked: config.vinyl.neon })}
                </div>` : ''
            }
        `}),
         AccordionItem({ id: 'qrCode', title: t('qrCode'), content: `
            ${Slider({ id: 'qr-size', label: t('size'), value: config.qrCode.size, min: 10, max: 100 })}
            ${ColorPicker({ id: 'qr-color', label: t('codeColor'), value: config.qrCode.color })}
            ${ColorPicker({ id: 'qr-bg-color', label: t('backgroundColor'), value: config.qrCode.bgColor })}
            ${Toggle({ id: 'qr-bg-transparent', label: t('transparentBg'), checked: config.qrCode.bgTransparent })}
            ${Toggle({ id: 'qr-frame', label: t('showFrame'), checked: config.qrCode.frame })}
            ${config.qrCode.frame ? `
                <div class="mt-2 space-y-4 pt-3 border-t border-gray-700">
                    ${Slider({ id: 'qr-frame-width', label: t('framePadding'), value: config.qrCode.frameWidth, min: 0, max: 20 })}
                    ${Slider({ id: 'qr-frame-border-radius', label: t('qrFrameBorderRadius'), value: config.qrCode.frameBorderRadius, min: 0, max: 30 })}
                    ${ColorPicker({ id: 'qr-frame-bg-color', label: t('frameBgColor'), value: config.qrCode.frameBgColor })}
                </div>` : ''
            }
        `}),
    ];

    const backSideAccordions = [
        AccordionItem({ id: 'backSideContent', title: t('content'), content: `
            ${Toggle({ id: 'back-show-artist', label: t('showArtist'), checked: config.back.showArtist })}
            ${Toggle({ id: 'back-show-title', label: t('showTitle'), checked: config.back.showTitle })}
            ${Toggle({ id: 'back-show-year', label: t('showYear'), checked: config.back.showYear })}
            ${Toggle({ id: 'back-show-codes', label: t('showCodes'), checked: config.back.showCodes })}
        `}),
        AccordionItem({ id: 'backSideTypography', title: t('typography'), content: `
            ${Select({ id: 'typography-font-family', label: t('fontFamily'), value: config.typography.fontFamily, options: [
              {value: "'Montserrat', sans-serif", label: 'Montserrat'}, {value: "'Roboto', sans-serif", label: 'Roboto'},
              {value: "'Playfair Display', serif", label: 'Playfair Display'}, {value: "'Space Mono', monospace", label: 'Space Mono'},
              {value: "'Lato', sans-serif", label: 'Lato'}, {value: "'Open Sans', sans-serif", label: 'Open Sans'},
              {value: "'Oswald', sans-serif", label: 'Oswald'}, {value: "'Raleway', sans-serif", label: 'Raleway'},
              {value: "'Merriweather', serif", label: 'Merriweather'}, {value: "'PT Serif', serif", label: 'PT Serif'},
              {value: "'Ubuntu', sans-serif", label: 'Ubuntu'}, {value: "'Poppins', sans-serif", label: 'Poppins'},
            ]})}
            ${Select({ id: 'typography-font-variant', label: t('fontVariant'), value: config.typography.fontVariant, options: [
              {value: 'normal', label: t('normal')}, {value: 'small-caps', label: t('smallCaps')}
            ]})}
            <div class="space-y-2 pt-2">
              <label class="text-sm text-gray-400">${t('artist')}</label>
              ${Slider({ id: 'typography-artist-weight', label: t('fontWeight'), value: config.typography.artistWeight, min: 100, max: 900, step: 100 })}
              ${Select({ id: 'typography-artist-transform', label: t('textTransform'), value: config.typography.artistTransform, options: [
                {value: 'none', label: t('none')}, {value: 'uppercase', label: t('uppercase')}, {value: 'lowercase', label: t('lowercase')}, {value: 'capitalize', label: t('capitalize')}
              ]})}
              ${Slider({ id: 'typography-artist-letter-spacing', label: t('letterSpacing'), value: config.typography.artistLetterSpacing, min: -0.1, max: 0.5, step: 0.01 })}
            </div>
            <div class="space-y-2 pt-2">
              <label class="text-sm text-gray-400">${t('title')}</label>
              ${Slider({ id: 'typography-title-weight', label: t('fontWeight'), value: config.typography.titleWeight, min: 100, max: 900, step: 100 })}
              ${Select({ id: 'typography-title-transform', label: t('textTransform'), value: config.typography.titleTransform, options: [
                {value: 'none', label: t('none')}, {value: 'uppercase', label: t('uppercase')}, {value: 'lowercase', label: t('lowercase')}, {value: 'capitalize', label: t('capitalize')}
              ]})}
              ${Slider({ id: 'typography-title-letter-spacing', label: t('letterSpacing'), value: config.typography.titleLetterSpacing, min: -0.1, max: 0.5, step: 0.01 })}
            </div>
             <div class="space-y-2 pt-2">
               <label class="text-sm text-gray-400">${t('year')}</label>
               ${Slider({ id: 'typography-year-weight', label: t('fontWeight'), value: config.typography.yearWeight, min: 100, max: 900, step: 100 })}
             </div>
        `}),
        AccordionItem({ id: 'backSideLayout', title: t('layout'), content: `
            ${Slider({ id: 'front-paddingX', label: t('paddingX'), value: config.front.paddingX, min: 0, max: 40 })}
            ${Slider({ id: 'back-artist-offset-y', label: t('artistOffsetY'), value: config.back.artistOffsetY, min: 0, max: 50 })}
            ${Slider({ id: 'back-title-offset-y', label: t('titleOffsetY'), value: config.back.titleOffsetY, min: 0, max: 50 })}
            ${Slider({ id: 'back-code-offset-x', label: t('sideCodeOffsetX'), value: config.back.codeOffsetX, min: 0, max: 30 })}
            <div class="border-t border-gray-700 mt-4 pt-4 space-y-4">
              ${Slider({ id: 'back-artist-fontsize', label: t('artistFontSize'), value: config.back.artistFontSize, min: 8, max: 40 })}
              ${Slider({ id: 'back-title-fontsize', label: t('titleFontSize'), value: config.back.titleFontSize, min: 8, max: 40 })}
              ${Slider({ id: 'back-year-fontsize', label: t('yearFontSize'), value: config.back.yearFontSize, min: 10, max: 60 })}
            </div>
        `}),
    ];

    const accordionItems = [
        AccordionItem({ id: 'appMode', title: t('appMode'), content:
            Select({ id: 'mode-select', label: t('mode'), value: config.mode, options: [
                {value: 'card', label: t('quizCard')},
                {value: 'token', label: t('gameToken')}
            ]})
        }),
        !isCardMode ? AccordionItem({ id: 'tokenSettings', title: t('tokenSettings'), content: `
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
                ${Slider({ id: 'token-text-stroke-width', label: t('textStrokeWidth'), value: config.token.textStrokeWidth, min: 0, max: 5, step: 0.1 })}
            </div>
        `}) : null,
        AccordionItem({ id: 'generalSettings', title: t('generalSettings'), content: `
            ${Slider({ id: 'card-size', label: t('cardSizeMm'), value: Math.round(config.card.width / MM_TO_PX_FACTOR), min: 30, max: 80 })}
            ${Slider({ id: 'card-border-radius', label: t('cardBorderRadius'), value: config.card.borderRadius, min: 0, max: 50 })}
            <div class="space-y-2 border-t border-gray-700 pt-3 mt-3">
                ${Toggle({ id: 'card-show-border', label: t('showBorder'), checked: config.card.showBorder })}
                ${config.card.showBorder ? `
                    ${Slider({ id: 'card-border-width', label: t('borderWidth'), value: config.card.borderWidth, min: 0, max: 10 })}
                    ${ColorPicker({ id: 'card-border-color', label: t('borderColor'), value: config.card.borderColor })}
                    ${Toggle({ id: 'card-border-on-front', label: t('borderOnFront'), checked: config.card.borderOnFront })}
                    ${Toggle({ id: 'card-border-on-back', label: t('borderOnBack'), checked: config.card.borderOnBack })}
                ` : ''}
            </div>
            ${ColorPicker({ id: 'card-bg-color', label: t('backgroundColor'), value: config.card.backgroundColor })}
        `}),
        isCardMode ? AccordionItem({ id: 'frontSideDesign', title: t('frontSideDesign'), content: renderAccordion(frontSideAccordions) }) : null,
        isCardMode ? AccordionItem({ id: 'backSideDesign', title: t('backSideDesign'), content: renderAccordion(backSideAccordions) }) : null,
        AccordionItem({ id: 'pageLayout', title: t('pageLayout'), content: `
            ${Slider({ id: 'page-gap-x', label: t('gapX'), value: config.page.gapX, min: 0, max: 50 })}
            ${Slider({ id: 'page-gap-y', label: t('gapY'), value: config.page.gapY, min: 0, max: 50 })}
            ${Toggle({ id: 'page-autofit', label: t('autoFit'), checked: config.page.autoFit })}
            ${Slider({ id: 'page-cards-per-page', label: t('cardsPerPage'), value: config.page.cardsPerPage, min: 1, max: 40, disabled: config.page.autoFit })}
            ${ isCardMode ? Toggle({ id: 'page-mirror-backs', label: t('mirrorBacks'), checked: config.page.mirrorBacks }) : ''}
        `})
    ].filter(Boolean);
    
    const allAccordionIds = [
      ...accordionItems.map(item => item.id),
      ...frontSideAccordions.map(item => item.id),
      ...backSideAccordions.map(item => item.id)
    ];
    
    const sidebarHtml = `
      <aside class="bg-gray-900 text-white w-full h-full flex flex-col border-r border-gray-800 shadow-2xl">
        <div class="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
          <h2 class="text-xl font-black tracking-tighter uppercase">${t('controls')}</h2>
        </div>
        <div class="sidebar-scroll-container flex-grow overflow-y-auto p-4 space-y-2">
          ${renderAccordion(accordionItems)}
        </div>
        <div class="hidden md:block p-4 bg-gray-900 border-t border-gray-800 flex-shrink-0">
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

    // Görgetési pozíció visszaállítása
    const scrollContainer = container.querySelector('.sidebar-scroll-container');
    if (scrollContainer) {
        scrollContainer.scrollTop = sidebarScrollTop;
    }
    
    bindSidebarEvents(container, { onGeneratePdf, accordionItemIds: allAccordionIds });
}