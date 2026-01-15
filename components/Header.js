import { getState, t, setLanguage, loadDesignConfig, addToast, updateState } from '../state.js';
import { UserIcon, SaveIcon, LoadIcon, UploadIcon, MenuIcon, MoreVerticalIcon } from './ui/Icons.js';
import { Button } from './ui/Button.js';

function renderSavedConfigsModal(container, onSelect, onClose) {
    const savedConfigs = JSON.parse(localStorage.getItem('designConfigs') || '[]');

    const modalHtml = `
      <div id="load-modal-backdrop" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div id="load-modal-content" class="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
          <h2 class="text-xl font-bold mb-4">${t('loadConfig')}</h2>
          <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
            ${savedConfigs.length > 0 ? savedConfigs.map((item, index) => `
              <div class="flex justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600">
                <span class="truncate mr-4">${item.name}</span>
                ${Button({ content: t('load'), "data-config-index": index, className: "py-1 px-3 text-sm"})}
              </div>
            `).join('') : `<p class="text-gray-400 text-center py-4">${t('noSavedConfigs')}</p>`}
          </div>
          ${Button({ id: 'close-modal-button', content: t('close'), className: "mt-6 w-full bg-red-600 hover:bg-red-700 border-none" })}
        </div>
      </div>
    `;
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    container.appendChild(modalContainer);

    // Eseményfigyelők
    modalContainer.querySelector('#load-modal-backdrop').addEventListener('click', onClose);
    modalContainer.querySelector('#close-modal-button').addEventListener('click', onClose);
    modalContainer.querySelector('#load-modal-content').addEventListener('click', e => e.stopPropagation());
    
    modalContainer.querySelectorAll('[data-config-index]').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-config-index');
            onSelect(savedConfigs[index].config);
        });
    });
}

export function renderHeader(container) {
  const { language, designConfig, isMobileActionsOpen } = getState();

  const headerHtml = `
    <header class="flex-shrink-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-30">
      <div class="flex items-center gap-3">
        <button id="mobile-menu-toggle" class="md:hidden text-white">${MenuIcon()}</button>
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center font-black text-gray-900 text-xl">S</div>
            <h1 class="text-xl md:text-2xl font-black tracking-tighter text-white">
            SonicStencil
            </h1>
        </div>
      </div>
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Desktop Buttons -->
        <div class="hidden md:flex items-center gap-2 md:gap-3">
            ${Button({ id: 'save-config-desktop', content: `${SaveIcon()}<span class="hidden lg:inline ml-2">${t('save')}</span>`, title: t('saveConfig'), className: "h-10" })}
            ${Button({ id: 'show-load-modal-desktop', content: `${LoadIcon()}<span class="hidden lg:inline ml-2">${t('load')}</span>`, title: t('loadConfig'), className: "h-10" })}
            ${Button({ id: 'download-config-desktop', content: `${UploadIcon({className: 'rotate-180'})}<span class="hidden lg:inline ml-2">${t('download')}</span>`, title: t('downloadConfig'), className: "h-10 bg-blue-600 hover:bg-blue-700" })}
        </div>

        <select
          id="language-select"
          class="bg-gray-800 border border-gray-700 text-white rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-10"
        >
          <option value="hu" ${language === 'hu' ? 'selected' : ''}>HU</option>
          <option value="en" ${language === 'en' ? 'selected' : ''}>EN</option>
          <option value="de" ${language === 'de' ? 'selected' : ''}>DE</option>
          <option value="es" ${language === 'es' ? 'selected' : ''}>ES</option>
          <option value="fr" ${language === 'fr' ? 'selected' : ''}>FR</option>
        </select>
        
        <!-- Mobile Actions Menu -->
        <div class="relative md:hidden">
            <button id="mobile-actions-toggle" class="text-white p-2">${MoreVerticalIcon()}</button>
            <div id="mobile-actions-dropdown" class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 ${isMobileActionsOpen ? 'block' : 'hidden'}">
                <a href="#" id="save-config-mobile" class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700">${SaveIcon()} ${t('save')}</a>
                <a href="#" id="show-load-modal-mobile" class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700">${LoadIcon()} ${t('load')}</a>
                <a href="#" id="download-config-mobile" class="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700">${UploadIcon({className:'rotate-180'})} ${t('download')}</a>
            </div>
        </div>
      </div>
      <div id="modal-container"></div>
    </header>
  `;

  container.innerHTML = headerHtml;
  
  // --- Event Listeners ---
  container.querySelector('#language-select').addEventListener('change', (e) => setLanguage(e.target.value));

  // Mobile Menu Toggle
  container.querySelector('#mobile-menu-toggle').addEventListener('click', () => {
    updateState({ isMobileMenuOpen: !getState().isMobileMenuOpen });
  });

  // Mobile Actions Dropdown
  const actionsToggle = container.querySelector('#mobile-actions-toggle');
  actionsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    updateState({ isMobileActionsOpen: !getState().isMobileActionsOpen });
  });
  // Close dropdown if clicked outside
  window.addEventListener('click', (e) => {
      if (getState().isMobileActionsOpen && !actionsToggle.contains(e.target)) {
          updateState({ isMobileActionsOpen: false });
      }
  });


  const handleSave = () => {
      const configName = prompt(t('enterConfigName'));
      if (configName) {
        const savedConfigs = JSON.parse(localStorage.getItem('designConfigs') || '[]');
        savedConfigs.push({ name: configName, config: getState().designConfig });
        localStorage.setItem('designConfigs', JSON.stringify(savedConfigs));
        addToast(t('configSaved'), 'success');
        updateState({ isMobileActionsOpen: false });
      }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sonicstencil_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast(t('configDownloaded'), 'success');
    updateState({ isMobileActionsOpen: false });
  };
  
  const modalContainer = container.querySelector('#modal-container');
  const showLoadModal = () => {
    updateState({ isMobileActionsOpen: false });
    renderSavedConfigsModal(
        modalContainer,
        (selectedConfig) => {
            loadDesignConfig(selectedConfig);
            modalContainer.innerHTML = '';
            addToast(t('configLoaded'), 'success');
        },
        () => modalContainer.innerHTML = ''
    );
  };
  
  // Desktop listeners
  container.querySelector('#save-config-desktop').addEventListener('click', handleSave);
  container.querySelector('#download-config-desktop').addEventListener('click', handleDownload);
  container.querySelector('#show-load-modal-desktop').addEventListener('click', showLoadModal);

  // Mobile listeners
  container.querySelector('#save-config-mobile').addEventListener('click', handleSave);
  container.querySelector('#download-config-mobile').addEventListener('click', handleDownload);
  container.querySelector('#show-load-modal-mobile').addEventListener('click', showLoadModal);
}