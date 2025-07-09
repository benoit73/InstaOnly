"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      // Sauvegarder le token
      localStorage.setItem('token', token)
      // Rediriger vers le dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000) //
    } else if (error) {
      // Gérer l'erreur
      setTimeout(() => {
        router.push('/auth/login?error=' + encodeURIComponent(error))
      }, 3000)
    } else {
      // Pas de token ni d'erreur, rediriger vers login
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  }, [router, searchParams])

  const token = searchParams.get('token')
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              {token ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {token ? 'Connexion réussie' : error ? 'Erreur de connexion' : 'Connexion en cours...'}
            </CardTitle>
            <CardDescription className="text-center">
              {token ? 'Redirection vers le dashboard...' : 
               error ? 'Redirection vers la page de connexion...' : 
               'Veuillez patienter pendant que nous vous connectons'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {error && (
              <p className="text-sm text-red-600 mb-4">
                {error}
              </p>
            )}
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}