import React, { useRef, useState, useEffect } from 'react';
import type { CardData } from '../types.ts';
import { useLocalization } from '../hooks/useLocalization.tsx';
import { UploadIcon, InfoIcon } from './ui/Icons.tsx';
import { Button } from './ui/Button.tsx';
import { PreviewContainer } from './ui/PreviewContainer.tsx';
import { useCardData } from '../context/CardDataContext.tsx';
import { SAMPLE_CARD_DATA } from '../constants.ts';

interface FileUploadProps {
  onFileParse: (file: File) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const TextInput: React.FC<{label: string, value: string, onChange: (val: string) => void}> = ({ label, value, onChange }) => (
    <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
        />
    </div>
);


export const FileUpload: React.FC<FileUploadProps> = ({ onFileParse, isVisible, toggleVisibility }) => {
  const { t } = useLocalization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cardData, setCardData } = useCardData();
  const [editableSample, setEditableSample] = useState<CardData>(cardData[0] || SAMPLE_CARD_DATA);

  useEffect(() => {
    // If cardData is empty or changes, update the local editable sample.
    setEditableSample(cardData[0] || SAMPLE_CARD_DATA);
  }, [cardData]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileParse(file);
    }
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    const updatedSample = { ...editableSample, [field]: value };
    setEditableSample(updatedSample);

    // If there's no real data loaded, update the "first" item in cardData
    // which serves as the global sample.
    if (cardData.length === 0) {
        setCardData([updatedSample]);
    } else {
        const updatedData = [...cardData];
        updatedData[0] = updatedSample;
        setCardData(updatedData);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <PreviewContainer title={t('editAndUpload')} isVisible={isVisible} toggleVisibility={toggleVisibility}>
        <div className="p-4 flex flex-col xl:flex-row gap-6">
            <div className="flex-grow">
                <h3 className="font-black text-xs uppercase text-gray-500 mb-4 tracking-widest">{t('editSampleCard')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <TextInput label={t('artist')} value={editableSample.artist} onChange={v => handleInputChange('artist', v)} />
                    <TextInput label={t('title')} value={editableSample.title} onChange={v => handleInputChange('title', v)} />
                    <TextInput label={t('year')} value={editableSample.year} onChange={v => handleInputChange('year', v)} />
                    <TextInput label={t('code1')} value={editableSample.code1 || ''} onChange={v => handleInputChange('code1', v)} />
                    <TextInput label={t('code2')} value={editableSample.code2 || ''} onChange={v => handleInputChange('code2', v)} />
                </div>
            </div>
            <div className="xl:w-80 xl:border-l xl:pl-6 border-gray-800">
                 <h3 className="font-black text-xs uppercase text-gray-500 mb-4 tracking-widest">{t('uploadTitle')}</h3>
                <div className="text-[10px] leading-relaxed text-gray-400 bg-gray-900 p-3 rounded-md mb-4 border border-gray-800">
                    <p className="mb-2 flex items-center text-gray-300 font-bold"><InfoIcon className="w-4 h-4 mr-2" /> {t('csvFormatInfo')}</p>
                    <div className="font-mono bg-black/30 p-2 rounded break-all opacity-70">artist, title, year, qr_url, code1, code2</div>
                </div>
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv, .xls, .xlsx"
                />
                <Button onClick={handleClick} className="w-full h-12 shadow-xl">
                    <UploadIcon className="mr-2" />
                    {t('selectFile')}
                </Button>
            </div>
        </div>
    </PreviewContainer>
  );
};