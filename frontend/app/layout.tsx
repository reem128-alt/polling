// import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "نظام الاستطلاعات",
    template: "%s | نظام الاستطلاعات"
  },
  description: "منصة متكاملة لإنشاء وإدارة الاستطلاعات الإلكترونية والمشاركة فيها",
  keywords: ["استطلاعات", "تصويت", "آراء", "ملاحظات", "مشاركة", "نظام استطلاعات"],
  authors: [{ name: "نظام الاستطلاعات" }],
  creator: "نظام الاستطلاعات",
  publisher: "نظام الاستطلاعات",
  formatDetection: {
    email: false,
    telephone: false,
    address: false
  },
  openGraph: {
    title: "نظام الاستطلاعات",
    description: "منصة متكاملة لإنشاء وإدارة الاستطلاعات الإلكترونية والمشاركة فيها",
    url: "/",
    siteName: "نظام الاستطلاعات",
    locale: "ar_SA",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
        
          {children}
       
        </body>
      </html>
    // </ClerkProvider>
  )
}
