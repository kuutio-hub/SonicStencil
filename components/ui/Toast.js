import { getState, updateState } from '../../state.js';

function Toast({ message, type, id }) {
  const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-200 rounded-lg shadow-lg";
  const typeClasses = {
    success: 'bg-green-500/80 backdrop-blur-sm',
    error: 'bg-red-500/80 backdrop-blur-sm'
  };

  return `
    <div class="${baseClasses} ${typeClasses[type]}" role="alert" data-toast-id="${id}">
      <div class="ms-3 text-sm font-normal">${message}</div>
      <button
        type="button"
        class="toast-close-button ms-auto -mx-1.5 -my-1.5 bg-white/20 text-gray-200 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-white/30 inline-flex items-center justify-center h-8 w-8"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  `;
}

export function renderToastContainer(container) {
  const { toasts } = getState();

  const toastsHtml = toasts.map(toast => Toast(toast)).join('');
  
  container.innerHTML = `
    <div class="fixed top-20 right-4 z-50 space-y-2">
      ${toastsHtml}
    </div>
  `;
  
  // Eseményfigyelők csatolása a bezárás gombokhoz
  container.querySelectorAll('.toast-close-button').forEach(button => {
    button.addEventListener('click', () => {
        const toastId = parseInt(button.parentElement.getAttribute('data-toast-id'), 10);
        const currentToasts = getState().toasts;
        updateState({ toasts: currentToasts.filter(t => t.id !== toastId) });
    });
  });
}
