import { DEFAULT_DESIGN_CONFIG, SAMPLE_CARD_DATA } from './constants.js';
import { locales } from './i18n/locales.js';

let state = {
  designConfig: DEFAULT_DESIGN_CONFIG,
  cardData: [],
  editableSample: SAMPLE_CARD_DATA, 
  previewsVisible: { card: true, page: true, editor: true },
  sidebarVisible: true,
  isLoading: false,
  toasts: [],
  isModalOpen: false,
  language: 'hu',
};

let listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
  return function unsubscribe() {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getState() {
  return { ...state };
}

export function updateState(newState) {
  state = { ...state, ...newState };
  notify();
}

// Specifikus állapotmódosító függvények (actions)
export function updateDesignConfig(category, property, value) {
  const newConfig = JSON.parse(JSON.stringify(state.designConfig));
  
  if (category === 'card' && property === 'width') {
      newConfig.card.width = value;
      newConfig.card.height = value;
  } else {
      newConfig[category][property] = value;
  }
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
        updateState({ toasts: getState().toasts.filter(t => t.id !== id) });
    }, 3000);
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
