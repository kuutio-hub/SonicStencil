export function Slider({ id, label, value, min = 0, max = 100, step = 1, disabled = false }) {
  const sliderComponent = `
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
      <span class="text-xs font-mono bg-gray-600 px-1.5 py-0.5 rounded w-12 text-center">${value}</span>
      </div>
  `;

  if (!label) return sliderComponent;

  return `
    <div>
      <div class="flex justify-between items-center mb-1">
        <label class="text-sm text-gray-300">${label}</label>
      </div>
      ${sliderComponent}
    </div>
  `;
}
