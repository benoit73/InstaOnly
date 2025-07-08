"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, AlertCircle } from "lucide-react"
import { accountService } from "@/services/accountService"

export default function AddAccountPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    userId: 1 // Temporaire - à remplacer par l'utilisateur connecté
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const newAccount = await accountService.createAccount(formData)
      router.push(`/dashboard/accounts/${newAccount.id}`)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setError('Erreur lors de la création du compte')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md p-4 md:p-8">
      {error && (
        <Alert className="mb-6 border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Créer un compte
          </CardTitle>
          <CardDescription>
            Créez un nouveau compte pour la génération d'images
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du compte</Label>
              <Input
                id="name"
                placeholder="Mon compte Instagram"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de ce compte..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/accounts")}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Création..." : "Créer le compte"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
