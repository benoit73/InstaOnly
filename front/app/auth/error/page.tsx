"use client"

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"

import ErrorContent from './ErrorContent'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Chargement de la page d’erreur...</div>}>
      <ErrorContent />
    </Suspense>
  )
}