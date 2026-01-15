import { EyeIcon, EyeOffIcon } from './Icons.js';

export function renderPreviewContainer(container, { title, content, isVisible, actions = '' }) {
    container.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-700">
        <div class="flex justify-between items-center p-3 bg-gray-700/50 border-b border-gray-700">
          <h2 class="font-bold text-gray-300">${title}</h2>
          <div class="flex items-center gap-4">
              ${actions}
              <button class="visibility-toggle text-gray-400 hover:text-white">
                ${isVisible ? EyeOffIcon() : EyeIcon()}
              </button>
          </div>
        </div>
        <div class="preview-content-area transition-all duration-300 ${isVisible ? 'block' : 'hidden'}">
          ${content}
        </div>
      </div>
    `;
}

export function addPreviewContainerListeners(container, toggleCallback) {
    container.querySelector('.visibility-toggle').addEventListener('click', toggleCallback);
}
