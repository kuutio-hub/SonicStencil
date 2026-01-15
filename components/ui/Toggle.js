export function Toggle({ id, label, checked }) {
  return `
    <label class="flex items-center justify-between cursor-pointer">
      <span class="text-sm text-gray-300">${label}</span>
      <div class="relative">
        <input
          type="checkbox"
          id="${id}"
          class="sr-only"
          ${checked ? 'checked' : ''}
        />
        <div class="block w-14 h-8 rounded-full transition ${checked ? 'bg-green-600' : 'bg-gray-600'}"></div>
        <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}"></div>
      </div>
    </label>
  `;
}
