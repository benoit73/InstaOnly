"use client"

import Image from "next/image"
import { useState } from "react"

interface ImageDisplayProps {
  photo: {
    id: number
    imageUrl?: string
    filename?: string
    prompt?: string
  }
  alt: string
  className?: string
  width: number
  height: number
}

export function ImageDisplay({ photo, alt, className, width, height }: ImageDisplayProps) {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    // Construire l'URL de l'image
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    return `${baseUrl}/photos/${photo.id}/file`
  })

  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`)
    setImageError(true)
  }

  const handleLoad = () => {
    setImageError(false)
  }

  if (imageError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gray-200 text-gray-500`}
        style={{ width, height }}
      >
        <div className="text-center">
          <p className="text-sm">Image non disponible</p>
          <p className="text-xs">{photo.filename || 'Fichier introuvable'}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized // Important pour éviter les problèmes avec Next.js Image optimization
    />
  )
}