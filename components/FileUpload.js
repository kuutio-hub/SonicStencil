import { getState, updateState, t, setEditableSample } from '../state.js';
import { UploadIcon, InfoIcon } from './ui/Icons.js';
import { renderPreviewContainer, addPreviewContainerListeners } from './ui/PreviewContainer.js';

function TextInput({ id, label, value }) {
    return `
        <div class="flex-1 min-w-[150px]">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">${label}</label>
            <input
                type="text"
                id="${id}"
                value="${value}"
                class="block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
            />
        </div>
    `;
}

export function renderFileUpload(container, { onFileParse }) {
  const { editableSample, previewsVisible } = getState();

  const content = `
    <div class="p-4 flex flex-col xl:flex-row gap-6">
        <div class="flex-grow">
            <h3 class="font-black text-xs uppercase text-gray-500 mb-4 tracking-widest">${t('editSampleCard')}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                ${TextInput({ id: 'edit-artist', label: t('artist'), value: editableSample.artist })}
                ${TextInput({ id: 'edit-title', label: t('title'), value: editableSample.title })}
                ${TextInput({ id: 'edit-year', label: t('year'), value: editableSample.year })}
                ${TextInput({ id: 'edit-code1', label: t('code1'), value: editableSample.code1 || '' })}
                ${TextInput({ id: 'edit-code2', label: t('code2'), value: editableSample.code2 || '' })}
            </div>
        </div>
        <div class="xl:w-80 xl:border-l xl:pl-6 border-gray-800">
             <h3 class="font-black text-xs uppercase text-gray-500 mb-4 tracking-widest">${t('uploadTitle')}</h3>
            <div class="text-[10px] leading-relaxed text-gray-400 bg-gray-900 p-3 rounded-md mb-4 border border-gray-800">
                <p class="mb-2 flex items-center text-gray-300 font-bold">${InfoIcon({className:"w-4 h-4 mr-2"})} ${t('csvFormatInfo')}</p>
                <div class="font-mono bg-black/30 p-2 rounded break-all opacity-70">artist, title, year, qr_url, code1, code2</div>
            </div>
            <input
              type="file"
              id="file-input"
              class="hidden"
              accept=".csv, .xls, .xlsx"
            />
            <button id="upload-button" class="w-full h-12 shadow-xl bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-all">
                ${UploadIcon({className:"mr-2"})}
                ${t('selectFile')}
            </button>
        </div>
    </div>
  `;

  renderPreviewContainer(container, {
      title: t('editAndUpload'),
      isVisible: previewsVisible.editor,
      content
  });

  addPreviewContainerListeners(container, () => {
      const currentVisibility = getState().previewsVisible;
      updateState({ previewsVisible: { ...currentVisibility, editor: !currentVisibility.editor } });
  });

  // Eseményfigyelők
  const fileInput = container.querySelector('#file-input');
  container.querySelector('#upload-button').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileParse(file);
    }
  });

  const handleInputChange = (field, value) => {
      const updatedSample = { ...getState().editableSample, [field]: value };
      setEditableSample(updatedSample);
  };
  
  container.querySelector('#edit-artist').addEventListener('input', e => handleInputChange('artist', e.target.value));
  container.querySelector('#edit-title').addEventListener('input', e => handleInputChange('title', e.target.value));
  container.querySelector('#edit-year').addEventListener('input', e => handleInputChange('year', e.target.value));
  container.querySelector('#edit-code1').addEventListener('input', e => handleInputChange('code1', e.target.value));
  container.querySelector('#edit-code2').addEventListener('input', e => handleInputChange('code2', e.target.value));
};
