"use client"

import Link from "next/link"
import { Menu, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">M</span>
          </div>
          <span className="text-xl font-bold">MovilityAI</span>
        </Link>
      </div>

      <nav className="hidden items-center gap-6 lg:flex">
        <Link href="/" className="text-sm font-medium text-foreground hover:text-primary">
          Inicio
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Dashboard
        </Link>
        <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Historial
        </Link>
        <Link href="/badges" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Logros
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
