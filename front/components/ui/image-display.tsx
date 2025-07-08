"use client"

import Image from "next/image"
import { useState } from "react"

interface ImageDisplayProps {
  photo: {
    id?: number;
    filename?: string;
    filePath?: string;
    prompt?: string;
    imageUrl?: string; // Pour les images générées
    image?: string;    // Autre format possible
  };
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ImageDisplay({ photo, alt, className = "", width, height }: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false)
  
  // Fonction pour déterminer l'URL source
  const getImageSrc = () => {
    console.log("Photo reçue:", photo); // Debug
    
    // Si c'est une image générée avec imageUrl
    if (photo.imageUrl) {
      // Si l'URL commence par /api, construire l'URL complète
      if (photo.imageUrl.startsWith('/api/')) {
        const baseUrl = process.env.NEXT_PUBLIC_BACK_URL?.replace('/api', '') || 'http://localhost:3001';
        return `${baseUrl}${photo.imageUrl}`;
      }
      return photo.imageUrl;
    }
    
    // Si c'est une image avec la propriété image (base64 ou URL)
    if (photo.image) {
      return photo.image;
    }
    
    // Si c'est une image normale avec ID
    if (photo.id) {
      return `${process.env.NEXT_PUBLIC_BACK_URL}/images/${photo.id}/file`;
    }
    
    // Si c'est une image avec filePath direct
    if (photo.filePath) {
      const baseUrl = process.env.NEXT_PUBLIC_BACK_URL?.replace('/api', '') || 'http://localhost:3001';
      return `${baseUrl}/${photo.filePath}`;
    }
    
    return '';
  };
  
  const [imageSrc, setImageSrc] = useState(getImageSrc())

  const handleImageError = () => {
    console.log('Erreur de chargement image, tentative alternative');
    
    if (!imageError) {
      // Essayer une URL alternative
      if (photo.filePath && photo.id) {
        const baseUrl = process.env.NEXT_PUBLIC_BACK_URL?.replace('/api', '') || 'http://localhost:3001';
        setImageSrc(`${baseUrl}/uploads/${photo.filePath.replace('uploads/', '')}`);
      } else if (photo.id) {
        setImageSrc(`${process.env.NEXT_PUBLIC_BACK_URL}/photos/${photo.id}/file`);
      }
      setImageError(true);
    }
  }

  // Si aucune source d'image n'est disponible
  if (!imageSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <div className="text-sm">Aucune image</div>
          <div className="text-xs">{photo.filename || 'Image non disponible'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => console.log('Image chargée avec succès')}
        onError={handleImageError}
        style={{ width, height }}
      />
      {/* Debug info */}
      <div className="text-xs text-gray-400 mt-1">
        URL: {imageSrc.length > 50 ? `${imageSrc.substring(0, 50)}...` : imageSrc}
      </div>
    </div>
  )
}