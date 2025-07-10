"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Instagram, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { accountService, Account } from "@/services/accountService"

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les comptes depuis l'API
  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountService.getAccounts()
      console.log('Loaded accounts:', data)
      setAccounts(data)
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error)
      setError(`Erreur lors du chargement des comptes. URL: ${process.env.BACKEND_URL || 'http://localhost:3001/'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAccount = (accountId: number) => {
    router.push(`/dashboard/accounts/${accountId}`)
  }

  const handleDeleteAccount = async (accountId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      try {
        await accountService.deleteAccount(accountId)
        await loadAccounts()
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="container p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-600">Chargement des comptes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={loadAccounts}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comptes</h1>
          <p className="text-muted-foreground">Gérez vos comptes de génération d'images</p>
        </div>
        <Link href="/dashboard/accounts/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un compte
          </Button>
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucun compte trouvé</p>
          <Link href="/dashboard/accounts/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer votre premier compte
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  {account.mainImage ? (
                    <Image
                      src={`${process.env.BACKEND_URL?.replace('/', '') || 'http://localhost:3001'}/images/${account.mainImage.id}`}
                      alt={account.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Instagram className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="flex items-center">
                    <Link href={`/dashboard/accounts/${account.id}`} className="hover:underline">
                      {account.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {account.description || 'Aucune description'}
                  </CardDescription>
                  <CardDescription className="text-xs text-muted-foreground">
                    Par {account.user?.username || 'Utilisateur inconnu'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{account.imagesCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Images</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Publications</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Créé le {new Date(account.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/dashboard/accounts/${account.id}`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Détails
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
      )}
    </div>
  )
}
