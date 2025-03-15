import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تسجيل الدخول | نظام الاستطلاعات",
  description: "صفحة تسجيل الدخول إلى نظام الاستطلاعات للمسؤولين والمشرفين",
  keywords: ["تسجيل الدخول", "نظام الاستطلاعات", "مسؤول النظام", "لوحة التحكم"],
  openGraph: {
    title: "تسجيل الدخول | نظام الاستطلاعات",
    description: "صفحة تسجيل الدخول إلى نظام الاستطلاعات للمسؤولين والمشرفين",
    type: "website",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
