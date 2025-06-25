import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Edit, Trash2, History } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PhotosPage() {
  // Données simulées des photos
  const photos = [
    {
      id: 1,
      image: "/placeholder.svg?height=400&width=400",
      description: "Notre nouvelle collection printemps #mode #fashion",
      account: "mode_paris",
      accountId: 1,
      isStory: false,
    },
    {
      id: 2,
      image: "/placeholder.svg?height=400&width=400",
      description: "Design minimaliste pour votre intérieur #design #minimal",
      account: "design_studio",
      accountId: 2,
      isStory: false,
    },
    {
      id: 3,
      image: "/placeholder.svg?height=400&width=400",
      description: "Coucher de soleil à Paris #travel #paris",
      account: "travel_photos",
      accountId: 3,
      isStory: false,
    },
    {
      id: 4,
      image: "/placeholder.svg?height=400&width=400",
      description: "Nouvelle collection été #summer #fashion",
      account: "mode_paris",
      accountId: 1,
      isStory: true,
    },
    {
      id: 5,
      image: "/placeholder.svg?height=400&width=400",
      description: "Inspiration design #creative",
      account: "design_studio",
      accountId: 2,
      isStory: true,
    },
  ]

  const regularPhotos = photos.filter((photo) => !photo.isStory)
  const storyPhotos = photos.filter((photo) => photo.isStory)

  return (
    <div className="container p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photos</h1>
          <p className="text-muted-foreground">Gérez vos photos et stories Instagram</p>
        </div>
        <Link href="/dashboard/photos/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une photo
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="photos">Publications</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={photo.image || "/placeholder.svg"}
                    alt={photo.description}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Link href={`/dashboard/accounts/${photo.accountId}`} className="hover:underline">
                    <p className="text-sm font-medium">@{photo.account}</p>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{photo.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-500">
                    <History className="mr-2 h-4 w-4" />
                    Story
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storyPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <div className="absolute inset-0 border-4 border-pink-500 rounded-lg z-10"></div>
                  <Image
                    src={photo.image || "/placeholder.svg"}
                    alt={photo.description}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Link href={`/dashboard/accounts/${photo.accountId}`} className="hover:underline">
                    <p className="text-sm font-medium">@{photo.account}</p>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{photo.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
