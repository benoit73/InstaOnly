"use client"

import { useEffect, useState } from 'react'
import { userService, Account } from '@/services/userService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export function UserAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userAccounts = await userService.getUserAccounts()
        setAccounts(userAccounts)
      } catch (error) {
        console.error('Error fetching accounts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  if (isLoading) {
    return <div className="animate-pulse">Chargement des comptes...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes Comptes</h2>
        <Link href="/dashboard/accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau compte
          </Button>
        </Link>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun compte créé</p>
              <Link href="/dashboard/accounts/new">
                <Button className="mt-4">
                  Créer mon premier compte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {account.name}
                  <Badge variant="secondary">
                    {account.id}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {account.description || 'Aucune description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Créé le {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                  {account.mainImage && (
                    <p className="text-sm text-green-600">
                      ✓ Image principale définie
                    </p>
                  )}
                </div>
                <Link href={`/dashboard/accounts/${account.id}`}>
                  <Button className="w-full mt-4" variant="outline">
                    Voir le compte
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}