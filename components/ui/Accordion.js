import { ChevronDownIcon } from './Icons.js';
import { getState, toggleAccordion } from '../../state.js';

export function AccordionItem({ id, title, content }) {
    const { openAccordions } = getState();
    const isOpen = openAccordions.includes(id);

    return {
      id,
      html: `
        <div class="accordion-item bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600" data-accordion-id="${id}">
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
      `
    };
}

export function renderAccordion(items) {
    const html = `<div class="space-y-2">${items.map(item => item.html).join('')}</div>`;
    return html;
}

export function addAccordionListeners(container) {
    container.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const accordionId = button.closest('.accordion-item').dataset.accordionId;
            if (accordionId) {
                toggleAccordion(accordionId);
            }
        });
    });
}