"use client"

import { useState, useEffect } from "react"
import { photoService, Photo } from "@/services/imageService"

export default function TestPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await photoService.getPhotos()
      console.log("Photos récupérées:", data)
      setPhotos(data)
    } catch (err) {
      console.error("Erreur:", err)
      setError(`Erreur: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testImageAccess = (photo: Photo) => {
    setSelectedPhoto(photo)
    const url = photoService.getImageUrl(photo)
    setImageUrl(url)
    console.log("URL de test:", url)
  }

  const testDirectImageAccess = async (photo: Photo) => {
    try {
      const url = photoService.getImageUrl(photo)
      console.log("Test direct de l'URL:", url)
      
      const response = await fetch(url)
      console.log("Réponse:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (response.ok) {
        const blob = await response.blob()
        console.log("Blob reçu:", blob)
        setError(`✅ Image accessible - Taille: ${blob.size} bytes, Type: ${blob.type}`)
      } else {
        setError(`❌ Erreur HTTP: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      console.error("Erreur fetch:", err)
      setError(`❌ Erreur réseau: ${err}`)
    }
  }

  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-6">Test d'accès aux photos</h1>
      
      <div className="mb-4">
        <button 
          onClick={loadPhotos}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          disabled={loading}
        >
          {loading ? "Chargement..." : "Recharger les photos"}
        </button>
        <span className="text-gray-600">
          {photos.length} photo(s) trouvée(s)
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Liste des photos</h2>
          <div className="space-y-2">
            {photos.map((photo) => (
              <div key={photo.id} className="border p-3 rounded">
                <p><strong>ID:</strong> {photo.id}</p>
                <p><strong>Fichier:</strong> {photo.filename}</p>
                <p><strong>Chemin:</strong> {photo.filePath}</p>
                <p><strong>Prompt:</strong> {photo.prompt}</p>
                <div className="mt-2 space-x-2">
                  <button 
                    onClick={() => testImageAccess(photo)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Afficher
                  </button>
                  <button 
                    onClick={() => testDirectImageAccess(photo)}
                    className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Test direct
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Aperçu de l'image</h2>
          {selectedPhoto && (
            <div>
              <p className="mb-2"><strong>Photo sélectionnée:</strong> {selectedPhoto.filename}</p>
              <p className="mb-2"><strong>URL:</strong> {imageUrl}</p>
              <div className="border-2 border-gray-300 p-4 rounded">
                <img 
                  src={imageUrl} 
                  alt={selectedPhoto.prompt}
                  className="max-w-full h-auto"
                  onLoad={() => setError("✅ Image chargée avec succès!")}
                  onError={(e) => {
                    console.error("Erreur de chargement d'image:", e)
                    setError("❌ Erreur de chargement de l'image")
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">URLs de test rapide</h2>
        <div className="space-y-2 font-mono text-sm">
          <p>API Photos: <a href={`${process.env.NEXT_PUBLIC_BACK_URL}/photos`} target="_blank" className="text-blue-500">{process.env.NEXT_PUBLIC_BACK_URL}/photos</a></p>
          <p>Health Check: <a href={`http://localhost:3001/health`} target="_blank" className="text-blue-500">http://localhost:3001/health</a></p>
          <p>Fichiers statiques: <a href={`${process.env.NEXT_PUBLIC_BACK_URL}/files`} target="_blank" className="text-blue-500">{process.env.NEXT_PUBLIC_BACK_URL}/files</a></p>
        </div>
      </div>
    </div>
  )
}
