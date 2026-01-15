export function ColorPicker({ id, label, value, compact = false }) {
  const containerClasses = compact ? "flex items-center gap-2" : "flex justify-between items-center";

  return `
    <div class="${containerClasses}">
      ${label ? `<label class="text-sm text-gray-300">${label}</label>` : ''}
      <div class="relative">
        <input
          type="color"
          id="${id}"
          value="${value}"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          style="background-color: ${value};"
          class="w-10 h-6 rounded border border-gray-500 pointer-events-none"
        ></div>
      </div>
    </div>
  `;
}
