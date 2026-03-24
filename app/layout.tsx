import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://nexogov-git-production.up.railway.app"),
  title: {
    default: "NexoGov",
    template: "%s — NexoGov",
  },
  description:
    "Sistema institucional de tramitação processual municipal. Rastreabilidade completa, controle de acesso e gestão orientada a dados.",
  icons: {
    icon: "/logos/logo-icon-light.png",
    shortcut: "/logos/logo-icon-light.png",
    apple: "/logos/logo-icon-light.png",
  },
  openGraph: {
    title: "NexoGov — Conectando processos. Transformando gestão.",
    description: "Sistema institucional de tramitação processual municipal.",
    type: "website",
    images: [{ url: "/logos/logo-light.png", width: 2048, height: 2048 }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
