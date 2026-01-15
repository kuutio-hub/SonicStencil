import { DEFAULT_DESIGN_CONFIG, SAMPLE_CARD_DATA } from './constants.js';
import { locales } from './i18n/locales.js';

let state = {
  designConfig: DEFAULT_DESIGN_CONFIG,
  cardData: [],
  editableSample: SAMPLE_CARD_DATA, 
  previewsVisible: { card: true, page: true, editor: true },
  sidebarVisible: true,
  isLoading: false,
  progress: { percentage: 0, message: '' },
  toasts: [],
  isModalOpen: false,
  language: 'hu',
  openAccordions: ['appMode'], // Alapértelmezetten nyitva az első
  sidebarScrollTop: 0,
  isMobileMenuOpen: false,
  isMobileActionsOpen: false,
  previewZoom: 1,
};

let listeners = [];

export function subscribe(keys, listener) {
    if (typeof keys === 'function') { // Támogatja a régi, globális feliratkozást is
        listener = keys;
        keys = null;
    }
    listeners.push({ keys, listener });
    return function unsubscribe() {
        listeners = listeners.filter(l => l.listener !== listener);
    };
}

function notify(changedKeys) {
    for (const { keys, listener } of listeners) {
        // Ha nincs 'keys' megadva (globális listener), vagy van átfedés a változott kulcsok és a figyelt kulcsok között
        if (!keys || keys.some(key => changedKeys.includes(key))) {
            listener(changedKeys);
        }
    }
}

export function getState() {
  return { ...state };
}

export function updateState(newState) {
  const oldState = state;
  state = { ...state, ...newState };
  const changedKeys = Object.keys(newState).filter(key => oldState[key] !== state[key]);
  if (changedKeys.length > 0) {
      notify(changedKeys);
  }
}

// Debounce segédfüggvény
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};


// Specifikus állapotmódosító függvények (actions)
export function updateDesignConfig(category, property, value) {
    const newConfig = JSON.parse(JSON.stringify(state.designConfig));
  
    if (category === 'card' && property === 'width') {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        newConfig.card.width = numericValue;
        newConfig.card.height = numericValue;
    } else {
        newConfig[category][property] = value;
    }
    
    // A debounce-olt frissítés helyett a sima updateState-et használjuk,
    // a debounce logikát az index.js-ben, a feliratkozásnál kezeljük.
    updateState({ designConfig: newConfig });
}

export function setDesignConfigMode(mode) {
    const newConfig = { ...state.designConfig, mode };
    updateState({ designConfig: newConfig });
}

export function loadDesignConfig(config) {
    updateState({ designConfig: config });
}

export function setCardData(data) {
    const newEditableSample = data[0] || SAMPLE_CARD_DATA;
    updateState({ cardData: data, editableSample: newEditableSample });
}

export function setEditableSample(sample) {
    const newCardData = [...state.cardData];
    // Ha van feltöltött adat, frissítjük az első sort (ami az előnézet alapja),
    // egyébként csak a mintaadatot magát változtatjuk.
    if (newCardData.length > 0) {
        newCardData[0] = sample;
        updateState({ editableSample: sample, cardData: newCardData });
    } else {
        updateState({ editableSample: sample });
    }
}

export function addToast(message, type = 'success') {
    const id = Date.now();
    const newToasts = [...state.toasts, { id, message, type }];
    updateState({ toasts: newToasts });
    setTimeout(() => {
        const currentToasts = getState().toasts.filter(t => t.id !== id);
        updateState({ toasts: currentToasts });
    }, 3000);
}

// Accordion állapot
export function toggleAccordion(accordionId) {
    const { openAccordions } = getState();
    const newOpenAccordions = openAccordions.includes(accordionId)
        ? openAccordions.filter(id => id !== accordionId)
        : [...openAccordions, accordionId];
    updateState({ openAccordions: newOpenAccordions });
}

// Lokalizáció
export function setLanguage(lang) {
    updateState({ language: lang });
}

export function t(key, replacements) {
    const { language } = getState();
    let translation = locales[language]?.[key] || key;
    if (replacements) {
        for (const rKey in replacements) {
            translation = translation.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(replacements[rKey]));
        }
    }
    return translation;
}