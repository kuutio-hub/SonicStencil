import { ChevronDownIcon } from './Icons.js';

export function AccordionItem({ title, content, isOpen = false }) {
    return `
      <div class="accordion-item bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600">
        <button
          class="accordion-header w-full flex justify-between items-center p-3 text-left font-bold bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <span>${title}</span>
          <span class="transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}">
            ${ChevronDownIcon()}
          </span>
        </button>
        <div class="accordion-content p-3 space-y-4 border-t border-gray-600 ${isOpen ? '' : 'hidden'}">
          ${content}
        </div>
      </div>
    `;
}

export function renderAccordion(items) {
    const html = `<div class="space-y-2">${items.join('')}</div>`;
    // A renderelő függvény most már a HTML string-et adja vissza,
    // az eseményfigyelőket a hívó komponens (pl. Sidebar) fogja hozzáadni.
    return html;
}

export function addAccordionListeners(container) {
    container.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('span.transform');
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });
}
