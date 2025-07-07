import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, LayoutDashboard, Users, ImageIcon, Menu, Sparkles } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export const metadata: Metadata = {
  title: "Dashboard - Instagram Admin",
  description: "Gérez vos comptes Instagram et vos publications",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <Instagram className="h-6 w-6" />
            <span className="hidden md:inline-block">Instagram Admin</span>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-2 font-bold">
                  <Instagram className="h-6 w-6" />
                  <span>Instagram Admin</span>
                </div>
                <nav className="flex flex-col gap-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Tableau de bord
                    </Button>
                  </Link>
                  <Link href="/dashboard/accounts">
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-5 w-5" />
                      Comptes
                    </Button>
                  </Link>
                  <Link href="/dashboard/photos">
                    <Button variant="ghost" className="w-full justify-start">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Photos
                    </Button>
                  </Link>
                  <Link href="/dashboard/generate">
                    <Button variant="ghost" className="w-full justify-start">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Générer
                    </Button>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
          <nav className="flex flex-col gap-2 p-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Tableau de bord
              </Button>
            </Link>
            <Link href="/dashboard/accounts">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-5 w-5" />
                Comptes
              </Button>
            </Link>
            <Link href="/dashboard/photos">
              <Button variant="ghost" className="w-full justify-start">
                <ImageIcon className="mr-2 h-5 w-5" />
                Photos
              </Button>
            </Link>
            <Link href="/dashboard/generate">
              <Button variant="ghost" className="w-full justify-start">
                <Sparkles className="mr-2 h-5 w-5" />
                Générer
              </Button>
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
