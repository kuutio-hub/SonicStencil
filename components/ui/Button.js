export function Button(props) {
  const { id, content, className = '', disabled = false, title = '', ...rest } = props;
  const baseClasses = `bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800`;
  
  const dataAttributes = Object.entries(rest)
    .map(([key, value]) => `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}="${value}"`)
    .join(' ');
  
  return `
    <button
      ${id ? `id="${id}"` : ''}
      class="${baseClasses} ${className}"
      ${disabled ? 'disabled' : ''}
      ${title ? `title="${title}"` : ''}
      ${dataAttributes}
    >
      ${content}
    </button>
  `;
}
