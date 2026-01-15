export function Slider({ id, label, value, min = 0, max = 100, step = 1, disabled = false }) {
  const inputComponent = `
    <div class="flex items-center gap-2">
      <input
        type="range"
        id="${id}"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        ${disabled ? 'disabled' : ''}
        class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <input
        type="number"
        id="${id}-input"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        ${disabled ? 'disabled' : ''}
        class="w-16 bg-gray-900 border border-gray-700 rounded-md py-1 px-2 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
      />
    </div>
  `;

  if (!label) return inputComponent;

  return `
    <div>
      <div class="flex justify-between items-center mb-1">
        <label for="${id}" class="text-sm text-gray-300">${label}</label>
      </div>
      ${inputComponent}
    </div>
  `;
}