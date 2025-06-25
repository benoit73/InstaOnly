"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImagePlus } from "lucide-react"
import Image from "next/image"

export default function AddPhotoPage() {
  const [description, setDescription] = useState("")
  const [account, setAccount] = useState("")
  const [isStory, setIsStory] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Récupérer le compte depuis les paramètres d'URL si disponible
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const accountParam = searchParams.get("account")

  // Définir le compte s'il est passé en paramètre
  useEffect(() => {
    if (accountParam) {
      setAccount(accountParam)
    }
  }, [accountParam])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simuler l'ajout d'une photo
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/photos")
    }, 1000)
  }

  return (
    <div className="container max-w-2xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une photo</CardTitle>
          <CardDescription>Téléchargez une nouvelle photo pour Instagram</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Image</Label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer"
                onClick={() => document.getElementById("photo-upload")?.click()}
              >
                {previewImage ? (
                  <div className="relative w-full max-w-md aspect-square">
                    <Image src={previewImage || "/placeholder.svg"} alt="Aperçu" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Cliquez pour télécharger une image</p>
                    <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG (max. 5MB)</p>
                  </div>
                )}
                <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Compte Instagram</Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mode_paris">@mode_paris</SelectItem>
                  <SelectItem value="design_studio">@design_studio</SelectItem>
                  <SelectItem value="travel_photos">@travel_photos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Ajoutez une description et des hashtags..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="story-mode" checked={isStory} onCheckedChange={setIsStory} />
              <Label htmlFor="story-mode">Publier comme story</Label>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard/photos")}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !previewImage}>
            {isLoading ? "Publication en cours..." : "Publier"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
