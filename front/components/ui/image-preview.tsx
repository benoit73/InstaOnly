import React, { useState } from 'react';
import { imageService } from '@/services/imageService';

interface ImagePreviewProps {
  imageId?: number;
  title: string;
  isLoading?: boolean;
  showDetails?: boolean;
  imageData?: any;
  className?: string;
  children?: React.ReactNode;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageId,
  title,
  isLoading = false,
  showDetails = true,
  imageData,
  className = "",
  children
}) => {
  const [imageError, setImageError] = useState(false);
  const [hasLoggedError, setHasLoggedError] = useState(false);

  const getImageSrc = () => {
    if (imageId && !imageError) {
      return imageService.getImageFileUrl(imageId);
    }
    return null;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasLoggedError) {
      console.error('Erreur de chargement de l\'image ID:', imageId);
      setHasLoggedError(true);
    }
    setImageError(true);
  };

  const imageSrc = getImageSrc();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {isLoading ? (
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : imageSrc ? (
        <div>
          <div className="aspect-square rounded-lg overflow-hidden mb-4">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          
          {showDetails && imageData && (
            <div className="text-sm text-gray-600">
              <p><strong>Prompt:</strong> {imageData.prompt}</p>
              <p><strong>Dimensions:</strong> {imageData.width}x{imageData.height}</p>
            </div>
          )}
          
          {children}
        </div>
      ) : (
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">
            {imageError ? 'Erreur de chargement de l\'image' : 'Aucune image disponible'}
          </p>
        </div>
      )}
    </div>
  );
};