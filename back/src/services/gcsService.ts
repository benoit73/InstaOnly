import { Storage } from "@google-cloud/storage";
import path from "path";

// Crée le client Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, "../config/instaonly-uploader.json")
});

const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * Upload un buffer dans GCS à l'emplacement "destination".
 * Retourne l'URL publique du fichier.
 */
export async function uploadBufferToGCS(buffer: Buffer, destination: string): Promise<string> {
  const file = bucket.file(destination);

  await file.save(buffer, {
    resumable: false,
    gzip: true,
    contentType: 'image/png',
    public: true
  });

  return `https://storage.googleapis.com/${bucketName}/${destination}`;
}
