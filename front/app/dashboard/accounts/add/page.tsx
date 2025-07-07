"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Instagram, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AddAccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Vérifier les paramètres d'URL pour les messages OAuth
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const userId = searchParams.get('user_id')
    
    if (success && userId) {
      setAlertMessage("Compte Instagram connecté avec succès !")
      setAlertType("success")
      setShowAlert(true)
      
      // Rediriger vers la page du compte après 2 secondes
      setTimeout(() => {
        router.push(`/dashboard/accounts/${userId}`)
      }, 2000)
    } else if (error) {
      let errorMessage = "Erreur lors de la connexion Instagram"
      
      switch (error) {
        case 'access_denied':
          errorMessage = "Autorisation refusée. Vous devez autoriser l'accès à votre compte Instagram."
          break
        case 'no_code':
          errorMessage = "Code d'autorisation manquant."
          break
        case 'token_exchange_failed':
          errorMessage = "Échec de l'échange du token d'autorisation."
          break
        case 'user_info_failed':
          errorMessage = "Impossible de récupérer les informations du compte Instagram."
          break
        case 'server_error':
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard."
          break
        default:
          errorMessage = `Erreur: ${error}`
      }
      
      setAlertMessage(errorMessage)
      setAlertType("error")
      setShowAlert(true)
    }
  }, [searchParams, router])

  const handleInstagramOAuth = () => {
    setIsLoading(true)
    // Utiliser la variable d'environnement pour l'endpoint OAuth du backend
    // const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    // window.location.href = `${backendUrl}/auth/instagram`
    console.log(`https://www.facebook.com/v19.0/dialog/oauth?client_id=1880111709386910&redirect_uri=http://localhost:5000&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&response_type=code&state=some_random_string`);
    window.location.href = 'https://www.facebook.com/v19.0/dialog/oauth?client_id=1880111709386910&redirect_uri=http://localhost:5000&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&response_type=code&state=some_random_string';
  }

  return (
    <div className="container max-w-md p-4 md:p-8">
      {showAlert && (
        <div className="mb-6">
          <Alert className={alertType === "success" ? "border-green-500" : "border-red-500"}>
            {alertType === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Ajouter un compte Instagram
          </CardTitle>
          <CardDescription>
            Connectez votre compte Instagram en utilisant l'authentification officielle
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Méthode OAuth */}
          <div className="text-center space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
              <Instagram className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Connexion sécurisée</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Utilisez l'authentification officielle Instagram pour connecter votre compte en toute sécurité.
              </p>
              <Button 
                onClick={handleInstagramOAuth} 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Instagram className="mr-2 h-4 w-4" />
                    Se connecter avec Instagram
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Informations sur la sécurité */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Pourquoi utiliser OAuth ?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vos identifiants restent sécurisés</li>
              <li>• Authentification officielle Instagram</li>
              <li>• Vous pouvez révoquer l'accès à tout moment</li>
              <li>• Conforme aux politiques de sécurité</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/accounts")}
            className="w-full"
          >
            Retour aux comptes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
