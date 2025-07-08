"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash2, History, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { imageService, Photo } from "@/services/imageService"
import { accountService, Account } from "@/services"
import { ImageDisplay } from "@/components/ui/image-display"

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]) // Photos filtrées pour l'affichage
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]) // Toutes les photos pour les compteurs
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAccounts()
    loadAllPhotos() // Charger toutes les photos une fois au démarrage
  }, [])

  useEffect(() => {
    loadPhotos()
  }, [selectedAccountId, allPhotos]) // Dépendre aussi de allPhotos

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true)
      const accountsData = await accountService.getAccounts()
      setAccounts(accountsData)
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const loadAllPhotos = async () => {
    try {
      const data = await imageService.getPhotos()
      setAllPhotos(data)
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les photos:', error)
    }
  }

  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data: Photo[]
      if (selectedAccountId === "all") {
        // Si "all" est sélectionné, utiliser toutes les photos
        data = allPhotos
      } else {
        // Sinon, filtrer les photos du compte sélectionné
        data = allPhotos.filter(photo => photo.accountId === parseInt(selectedAccountId))
      }
      
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
        await imageService.deletePhoto(photoId)
        await loadAllPhotos() // Recharger toutes les photos
        // Les photos filtrées se mettront à jour automatiquement via useEffect
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const getSelectedAccountName = () => {
    if (selectedAccountId === "all") return "Tous les comptes"
    const account = accounts.find(acc => acc.id.toString() === selectedAccountId)
    return account ? account.name : "Compte sélectionné"
  }

  // Fonction pour obtenir le nombre de photos par compte (toujours basé sur allPhotos)
  const getPhotosCountForAccount = (accountId: number | "all") => {
    if (accountId === "all") {
      return allPhotos.length
    }
    return allPhotos.filter(photo => photo.accountId === accountId).length
  }

  if (loading && selectedAccountId === "all" && allPhotos.length === 0) {
    return (
      <div className="container p-4 md:p-8">
        <div className="text-center">Chargement des photos...</div>
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

      {/* Filtre par compte */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Filter className="h-5 w-5 text-gray-500" />
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filtrer par compte :</span>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-64">
              <SelectValue>
                {loadingAccounts ? "Chargement..." : getSelectedAccountName()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center">
                  <span className="font-medium">Tous les comptes</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({getPhotosCountForAccount("all")} photos)
                  </span>
                </div>
              </SelectItem>
              {accounts.map((account) => {
                const accountPhotosCount = getPhotosCountForAccount(account.id)
                return (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    <div className="flex items-center">
                      <span>@{account.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({accountPhotosCount} photos)
                      </span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        
        {selectedAccountId !== "all" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedAccountId("all")}
          >
            Effacer le filtre
          </Button>
        )}
      </div>

      {/* Indicateur de filtre actif */}
      {selectedAccountId !== "all" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Filtre actif :</span> {getSelectedAccountName()} 
            <span className="ml-2">({photos.length} photos)</span>
          </p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
          <div className="mt-2">
            <Button onClick={() => {
              loadAllPhotos()
              loadPhotos()
            }} variant="outline" size="sm">
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des photos...</p>
        </div>
      ) : (
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="photos">Publications ({regularPhotos.length})</TabsTrigger>
            <TabsTrigger value="stories">Stories ({storyPhotos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-6">
            {regularPhotos.length === 0 ? (
              <div className="text-center py-12">
                <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {selectedAccountId === "all" 
                    ? "Aucune photo trouvée" 
                    : `Aucune photo trouvée pour ${getSelectedAccountName()}`
                  }
                </p>
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
                <p className="text-gray-600 mb-4">
                  {selectedAccountId === "all" 
                    ? "Aucune story trouvée" 
                    : `Aucune story trouvée pour ${getSelectedAccountName()}`
                  }
                </p>
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
      )}
    </div>
  )
}
