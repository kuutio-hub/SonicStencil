import { renderApp } from './App.js';
import { subscribe } from './state.js';

const appContainer = document.getElementById('app-container');

if (!appContainer) {
    throw new Error('App container not found!');
}

function main() {
  // Első renderelés az alkalmazás indításakor
  renderApp(appContainer);

  // Feliratkozás az állapotváltozásokra, hogy a UI mindig frissüljön
  subscribe(() => renderApp(appContainer));
}

// Alkalmazás indítása
main();
