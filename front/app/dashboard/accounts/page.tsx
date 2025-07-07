"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Instagram, BarChart3, WifiOff, Wifi } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function AccountsPage() {
  const router = useRouter()
  
  // Données simulées des comptes Instagram avec statut de connexion
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      username: "mode_paris",
      followers: "15.2K",
      posts: 342,
      avatar: "/placeholder.svg?height=100&width=100",
      isConnected: true,
    },
    {
      id: 2,
      username: "design_studio",
      followers: "8.7K",
      posts: 187,
      avatar: "/placeholder.svg?height=100&width=100",
      isConnected: true,
    },
    {
      id: 3,
      username: "travel_photos",
      followers: "23.5K",
      posts: 456,
      avatar: "/placeholder.svg?height=100&width=100",
      isConnected: false,
    },
  ])

  // Fonction pour changer le statut de connexion d'un compte
  const toggleConnectionStatus = (id: number) => {
    setAccounts(
      accounts.map((account) => {
        if (account.id === id) {
          return { ...account, isConnected: !account.isConnected }
        }
        return account
      }),
    )
  }

  // Fonction pour modifier un compte
  const handleEditAccount = (accountId: number) => {
    router.push(`/dashboard/accounts/${accountId}`)
  }

  // Fonction pour supprimer un compte
  const handleDeleteAccount = (accountId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      setAccounts(accounts.filter(account => account.id !== accountId))
    }
  }

  return (
    <div className="container p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comptes Instagram</h1>
          <p className="text-muted-foreground">Gérez vos comptes Instagram connectés</p>
        </div>
        <Link href="/dashboard/accounts/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un compte
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className={`${!account.isConnected ? "opacity-75" : ""}`}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={account.avatar || "/placeholder.svg"}
                  alt={account.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <CardTitle className="flex items-center">
                  <Link href={`/dashboard/accounts/${account.id}`} className="hover:underline">
                    {account.username}
                  </Link>
                  <Instagram className="ml-1 h-4 w-4 text-pink-500" />
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {account.followers} abonnés
                  {account.isConnected ? (
                    <span className="inline-flex items-center text-green-500 text-xs">
                      <Wifi className="h-3 w-3 ml-1" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-500 text-xs">
                      <WifiOff className="h-3 w-3 ml-1" />
                    </span>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{account.posts}</p>
                  <p className="text-xs text-muted-foreground">Publications</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">Statut: {account.isConnected ? "Connecté" : "Déconnecté"}</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`connection-status-${account.id}`}
                    checked={account.isConnected}
                    onCheckedChange={() => toggleConnectionStatus(account.id)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/dashboard/accounts/${account.id}`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Activités
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditAccount(account.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500"
                  onClick={() => handleDeleteAccount(account.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
