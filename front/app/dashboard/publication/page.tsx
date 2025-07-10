"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Send, Instagram, Globe, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { accountService } from "@/services/accountService";
import { imageService } from "@/services/imageService";
import Link from "next/link";

export default function PublicationPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [photos, setPhotos] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [site, setSite] = useState("instagram");
  const [description, setDescription] = useState("");

  useEffect(() => {
    accountService.getAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      imageService.getPhotosByAccount(Number(selectedAccountId)).then(setPhotos);
    } else {
      setPhotos([]);
    }
  }, [selectedAccountId]);

  const handleGenerateDescription = async () => {
    setDescription("Description générée automatiquement ! (démo)");
    // Remplace par un appel API réel si besoin
  };

  const handlePublish = async () => {
    alert(`Publication sur ${site} lancée !`);
    // Ajoute ici l'appel à ton service de publication
  };

  return (
    <div className="container p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Link
            href="/dashboard/publication"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition"
          >
            <Send className="w-5 h-5 text-blue-500" />
            <span>Publication</span>
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="choose-photo" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="choose-photo">
                <ImageIcon className="w-4 h-4 mr-1" /> Choisir la photo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="choose-photo">
              <div className="space-y-4">
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        @{acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPhotoId} onValueChange={setSelectedPhotoId} disabled={!selectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une photo" />
                  </SelectTrigger>
                  <SelectContent>
                    {photos.map(photo => (
                      <SelectItem key={photo.id} value={photo.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Image src={photo.image || "/placeholder.svg"} alt="photo" width={32} height={32} className="rounded" />
                          <span>{photo.description?.slice(0, 30) || "Photo"}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPhotoId && (
                  <div className="flex justify-center my-4">
                    <Image
                      src={photos.find(p => p.id.toString() === selectedPhotoId)?.image || "/placeholder.svg"}
                      alt="Aperçu"
                      width={200}
                      height={200}
                      className="rounded shadow"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block mb-1 font-medium">Choisir le site de publication</label>
              <div className="flex gap-4">
                <Button
                  variant={site === "instagram" ? "default" : "outline"}
                  onClick={() => setSite("instagram")}
                  className="flex items-center gap-2"
                >
                  <Instagram className="w-5 h-5" /> Instagram
                </Button>
                <Button
                  variant={site === "autre" ? "default" : "outline"}
                  onClick={() => setSite("autre")}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-5 h-5" /> Autre
                </Button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Génère ou modifie la description ici..."
              />
              <Button className="mt-2" onClick={handleGenerateDescription} disabled={!selectedPhotoId}>
                Générer une description
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={!selectedPhotoId || !site} onClick={handlePublish}>
            Publier sur {site === "instagram" ? "Instagram" : "le site choisi"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}