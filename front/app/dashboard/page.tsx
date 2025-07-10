"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, ImageIcon, History } from "lucide-react"
import { accountService } from "@/services/accountService"
import { imageService } from "@/services/imageService"
import { userService } from "@/services/userService"

export default function DashboardPage() {
  const [accountsCount, setAccountsCount] = useState<number | null>(null)
  const [photosCount, setPhotosCount] = useState<number | null>(null)
  const [storiesCount, setStoriesCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer l'utilisateur courant pour avoir son id
        const user = await userService.getUserByToken()
        // Récupérer les comptes Instagram
        const accounts = await accountService.getAccounts()
        setAccountsCount(accounts.length)

        // Récupérer toutes les photos de tous les comptes de l'utilisateur
        let totalPhotos = 0
        let totalStories = 0
        for (const account of accounts) {
          const photos = await imageService.getPhotos()
          totalPhotos += photos.filter((p: any) => !p.isStory).length
          totalStories += photos.filter((p: any) => p.isStory).length
        }
        setPhotosCount(totalPhotos)
        setStoriesCount(totalStories)
      } catch (e) {
        setAccountsCount(0)
        setPhotosCount(0)
        setStoriesCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="container p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur votre tableau de bord de gestion Instagram</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes Instagram</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : accountsCount}
            </div>
            <p className="text-xs text-muted-foreground">Comptes Instagram gérés</p>
            <div className="mt-4">
              <Link href="/dashboard/accounts">
                <Button variant="outline" size="sm">
                  Gérer les comptes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : photosCount}
            </div>
            <p className="text-xs text-muted-foreground">Photos prêtes à publier</p>
            <div className="mt-4">
              <Link href="/dashboard/photos">
                <Button variant="outline" size="sm">
                  Gérer les photos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : storiesCount}
            </div>
            <p className="text-xs text-muted-foreground">Stories actives</p>
            <div className="mt-4">
              <Link href="/dashboard/photos">
                <Button variant="outline" size="sm">
                  Gérer les stories
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Les dernières actions effectuées sur vos comptes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Photo ajoutée à @mode_paris</p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Story publiée sur @design_studio</p>
                  <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau compte ajouté: @travel_photos</p>
                  <p className="text-xs text-muted-foreground">Hier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/accounts/add">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Ajouter un compte
              </Button>
            </Link>
            <Link href="/dashboard/photos/add">
              <Button variant="outline" className="w-full justify-start">
                <ImageIcon className="mr-2 h-4 w-4" />
                Ajouter une photo
              </Button>
            </Link>
            <Link href="/dashboard/photos">
              <Button variant="outline" className="w-full justify-start">
                <History className="mr-2 h-4 w-4" />
                Créer une story
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
