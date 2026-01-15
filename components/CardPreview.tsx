import React from 'react';
import type { CardData } from '../types.ts';
import { Card } from './Card.tsx';
import { PreviewContainer } from './ui/PreviewContainer.tsx';
import { useLocalization } from '../hooks/useLocalization.tsx';
import { EnlargeIcon } from './ui/Icons.tsx';
import { useCardData } from '../context/CardDataContext.tsx';
import { SAMPLE_CARD_DATA } from '../constants.ts';

interface CardPreviewProps {
  isVisible: boolean;
  toggleVisibility: () => void;
  onEnlarge: () => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ isVisible, toggleVisibility, onEnlarge }) => {
  const { t } = useLocalization();
  const { cardData } = useCardData();
  const sampleData = cardData[0] || SAMPLE_CARD_DATA;

  const headerActions = (
     <button onClick={onEnlarge} className="text-gray-400 hover:text-white" title={t('enlarge')}>
        <EnlargeIcon />
     </button>
  );

  return (
    <PreviewContainer title={t('cardPreview')} isVisible={isVisible} toggleVisibility={toggleVisibility} actions={headerActions}>
      <div className="flex justify-around items-center h-full gap-4 flex-wrap p-4">
        <div className="flex flex-col items-center">
          <h3 className="font-bold mb-2 text-gray-400">{t('front')}</h3>
          <Card data={sampleData} side="front" />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="font-bold mb-2 text-gray-400">{t('back')}</h3>
          <Card data={sampleData} side="back" />
        </div>
      </div>
    </PreviewContainer>
  );
};