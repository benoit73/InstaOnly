"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Send, Instagram, Globe } from "lucide-react";
import Link from "next/link";
import { accountService } from "@/services/accountService";
import { imageService } from "@/services/imageService";
import { descriptionService } from "@/services/descriptionService";

// Types pour accounts et photos
type Account = {
  id: number;
  name: string;
};

type Photo = {
  id: number;
  description?: string;
  prompt?: string;
};

export default function PublicationPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");
  const [site, setSite] = useState<"instagram" | "autre">("instagram");
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    accountService.getAccounts().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      imageService.getImagesByAccount(Number(selectedAccountId)).then(setPhotos).catch(() => setPhotos([]));
      setSelectedPhotoId("");
    } else {
      setPhotos([]);
      setSelectedPhotoId("");
    }
  }, [selectedAccountId]);

  const handleGenerateDescription = async () => {
    if (!selectedPhotoId) return;
    setIsGenerating(true);
    try {
      const res = await descriptionService.generateDescription(Number(selectedPhotoId));
      setDescription(res.description);
    } catch (e) {
      setDescription("Erreur lors de la génération de la description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    alert(`Publication sur ${site} lancée !`);
    // Ajoute ici l'appel à ton service de publication
  };

  const selectedPhoto = photos.find(p => p.id.toString() === selectedPhotoId);

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
          <div className="space-y-4">
            {/* Sélection du compte */}
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

            {/* Sélection de la photo */}
            {selectedAccountId && (
              <>
                <Select
                  value={selectedPhotoId}
                  onValueChange={setSelectedPhotoId}
                  disabled={photos.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Sélectionner une photo"
                      // Affiche la description ou le prompt de la photo sélectionnée dans le trigger
                      children={
                        selectedPhotoId && selectedPhoto
                          ? selectedPhoto.description || selectedPhoto.prompt || `Photo #${selectedPhoto.id}`
                          : undefined
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 80px)",
                        gap: "8px",
                        padding: "8px",
                      }}
                    >
                      {photos.map(photo => (
                        <SelectItem
                          key={photo.id}
                          value={photo.id.toString()}
                          className="p-0 m-0 border-none bg-transparent flex justify-center items-center"
                        >
                          <img
                            src={imageService.getImageFileUrl(photo.id)}
                            alt="preview"
                            width={70}
                            height={70}
                            style={{
                              objectFit: "cover",
                              borderRadius: 6,
                              border: selectedPhotoId === photo.id.toString() ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                              boxShadow: selectedPhotoId === photo.id.toString() ? "0 0 0 2px #60a5fa" : undefined,
                            }}
                          />
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>

                {/* Aperçu de la photo sélectionnée */}
                {selectedPhotoId && selectedPhoto && (
                  <div className="flex justify-center my-4">
                    <img
                      src={imageService.getImageFileUrl(selectedPhoto.id)}
                      alt="Aperçu"
                      width={200}
                      height={200}
                      className="rounded shadow"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block mb-1 font-medium">Choisir le site de publication</label>
              <div className="flex gap-4">
                <Button
                  variant={site === "instagram" ? "default" : "outline"}
                  onClick={() => setSite("instagram")}
                  className="flex items-center gap-2"
                  type="button"
                >
                  <Instagram className="w-5 h-5" /> Instagram
                </Button>
                <Button
                  variant={site === "autre" ? "default" : "outline"}
                  onClick={() => setSite("autre")}
                  className="flex items-center gap-2"
                  type="button"
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
                value={isGenerating ? "Génération de la description en cours..." : description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Génère ou modifie la description ici..."
                disabled={isGenerating}
              />
              <Button
                className="mt-2"
                onClick={handleGenerateDescription}
                disabled={!selectedPhotoId || isGenerating}
                type="button"
              >
                {isGenerating ? "Génération en cours..." : "Générer une description"}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={!selectedPhotoId || !site} onClick={handlePublish} type="button">
            Publier sur {site === "instagram" ? "Instagram" : "le site choisi"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}