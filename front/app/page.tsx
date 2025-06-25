import { redirect } from "next/navigation"

export default function Home() {
  // Rediriger directement vers le tableau de bord
  redirect("/dashboard")
}
