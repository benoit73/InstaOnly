"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('message') || 'Une erreur est survenue lors de la connexion'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erreur de connexion
            </CardTitle>
            <CardDescription className="text-center">
              La connexion avec Google a échoué
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {error}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Button>
              <Button
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACK_URL || 'http://localhost:3001'}/auth/google`}
              >
                Réessayer avec Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}