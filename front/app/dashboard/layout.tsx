"use client"

import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, LayoutDashboard, Users, ImageIcon, Menu, Sparkles, LogOut, User, Send } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { userService, User as UserType } from "@/services/userService"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (userService.isAuthenticated()) {
          console.log('🔍 User has token, fetching profile with accounts...');
          const userData = await userService.getUserByToken();
          console.log('🔍 User data with accounts:', userData);
          setUser(userData);
        } else {
          console.log('🔍 No token found, redirecting to login');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        
        if (error instanceof Error && error.message === 'Session expirée') {
          // Rediriger vers login si session expirée
          router.push('/auth/login');
        } else if (error instanceof TypeError && error.message.includes('NetworkError')) {
          console.error('🚨 Backend server is not reachable');
          // Optionnel: Afficher une notification d'erreur
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router])

  const handleLogout = async () => {
    try {
      await userService.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Rediriger quand même vers la page de connexion
      router.push('/auth/login')
    }
  }

  const AuthSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">
              S'inscrire
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src={user.avatar || ""} alt={user.name} /> */}
              <AvatarFallback>
                {user.username ? user.username.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <Instagram className="h-6 w-6" />
            <span className="hidden md:inline-block">InstaOnly</span>
          </div>

          {/* Navigation mobile */}
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
                  <span>InstaOnly</span>
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
                  {/* Onglet Publication */}
                  <Link href="/dashboard/publication">
                    <Button variant="ghost" className="w-full justify-start">
                      <Send className="mr-2 h-5 w-5 text-blue-500" />
                      Publication
                    </Button>
                  </Link>
                </nav>
                
                {/* Section d'authentification mobile */}
                <div className="mt-auto pt-4 border-t">
                  <AuthSection />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Section d'authentification desktop */}
          <div className="hidden md:flex">
            <AuthSection />
          </div>
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
            {/* Onglet Publication */}
            <Link href="/dashboard/publication">
              <Button variant="ghost" className="w-full justify-start">
                <Send className="mr-2 h-5 w-5 text-blue-500" />
                Publication
              </Button>
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}