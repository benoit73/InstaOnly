"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Edit, Trash2, History } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { photoService, Photo } from "@/services/imageService"
import { ImageDisplay } from "@/components/ui/image-display"

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await photoService.getPhotos()
      console.log('Photos loaded:', data)
      setPhotos(data)
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error)
      setError('Erreur lors du chargement des photos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) {
      try {
        await photoService.deletePhoto(photoId)
        await loadPhotos() // Recharger la liste
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="container p-4 md:p-8">
        <div className="text-center">Chargement des photos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container p-4 md:p-8">
        <div className="text-center text-red-600">{error}</div>
        <div className="text-center mt-2">
          <Button onClick={loadPhotos}>Réessayer</Button>
        </div>
      </div>
    )
  }

  const regularPhotos = photos.filter((photo) => !photo.isStory)
  const storyPhotos = photos.filter((photo) => photo.isStory)

  return (
    <div className="container p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photos</h1>
          <p className="text-muted-foreground">Gérez vos photos et stories Instagram</p>
        </div>
        <Link href="/dashboard/photos/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une photo
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="photos">Publications ({regularPhotos.length})</TabsTrigger>
          <TabsTrigger value="stories">Stories ({storyPhotos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6">
          {regularPhotos.length === 0 ? (
            <div className="text-center py-12">
              <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucune photo trouvée</p>
              <Link href="/dashboard/photos/add">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer votre première photo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <ImageDisplay
                      photo={photo}
                      alt={photo.prompt || photo.description || 'Image générée'}
                      className="w-full h-full object-cover"
                      width={400}
                      height={400}
                    />
                  </div>
                  <CardContent className="p-4">
                    {photo.accountId && (
                      <Link href={`/dashboard/accounts/${photo.accountId}`} className="hover:underline">
                        <p className="text-sm font-medium">
                          @{typeof photo.account === 'object' ? photo.account?.name : 'Compte'}
                        </p>
                      </Link>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {photo.description || photo.prompt || 'Aucune description'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Link href={`/dashboard/photos/${photo.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-500"
                      onClick={() => {/* Convertir en story */}}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Story
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          {storyPhotos.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucune story trouvée</p>
              <Link href="/dashboard/photos/add?type=story">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer votre première story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {storyPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative aspect-[9/16]"> {/* Format story */}
                    <div className="absolute inset-0 border-4 border-pink-500 rounded-lg z-10 pointer-events-none"></div>
                    <ImageDisplay
                      photo={photo}
                      alt={photo.prompt || photo.description || 'Story générée'}
                      className="w-full h-full object-cover"
                      width={400}
                      height={600}
                    />
                  </div>
                  <CardContent className="p-4">
                    {photo.accountId && (
                      <Link href={`/dashboard/accounts/${photo.accountId}`} className="hover:underline">
                        <p className="text-sm font-medium">
                          @{typeof photo.account === 'object' ? photo.account?.name : 'Compte'}
                        </p>
                      </Link>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {photo.description || photo.prompt || 'Aucune description'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Link href={`/dashboard/photos/${photo.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
