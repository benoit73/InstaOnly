"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Instagram, AlertTriangle, ArrowLeft } from "lucide-react"

export default function AddAccountManualPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Appel à votre API backend pour ajouter le compte
      const response = await fetch('http://localhost:5000/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.replace('@', ''), // Enlever @ si présent
          password: password
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/accounts/${data.id}?success=true`)
      } else {
        throw new Error('Erreur lors de l\'ajout du compte')
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Afficher une erreur à l'utilisateur
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md p-4 md:p-8">
      <Button 
        variant="ghost" 
        onClick={() => router.push("/dashboard/accounts/add")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Ajout manuel de compte
          </CardTitle>
          <CardDescription>
            Ajout manuel pour les comptes de développement et de test
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-4 border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention:</strong> Cette méthode est moins sécurisée et destinée uniquement aux comptes de test. 
              Nous recommandons fortement l'utilisation de l'authentification OAuth.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur Instagram</Label>
              <Input
                id="username"
                placeholder="@votre_compte"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Utilisé uniquement pour l'authentification initiale via instagrapi.
              </p>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/accounts/add")}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Ajout en cours..." : "Ajouter le compte"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}