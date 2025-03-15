"use client"

import { useForm } from "react-hook-form"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/services/auth"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type FormValues = {
  username: string
  password: string
}

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Login attempt with:", { username: data.username });
      setLoading(true)
      setError(null)
      const result = await login(data.username, data.password)
      
      console.log("Login result:", result);
      
      if (result.error) {
        setError(result.error)
        return
      }
      
      // Store a default token value if not provided
      localStorage.setItem('token', result.token ?? 'default-token')
      // Store the auth boolean value to indicate admin access
      localStorage.setItem('auth', String(result.auth))
      console.log("Token and auth status stored, redirecting to dashboard");
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : 'حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Dark background with title */}
      <div className="hidden md:flex md:w-1/4 bg-[#1e293b] relative overflow-hidden">
        <div className="w-full h-full">
          <Image 
            src="/imag.png" 
            alt="Login Background" 
            fill 
            priority 
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Text overlay at the bottom of the image */}
        <div className="absolute bottom-10 w-full text-center text-white z-10">
          <h1 className="text-4xl  mb-12">تسجيل الدخول</h1>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-3/4 flex items-center justify-center p-6">
        <div className="w-full max-w-xl px-12 py-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-800 mb-8">أهلاً بك</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-center text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              <Label htmlFor="username" className="block text-right text-gray-900 text-lg">اسم المستخدم أو الإيميل</Label>
              <Input
                id="username"
                type="text"
                placeholder="youremail@guru.com"
                className="w-full p-4 border border-gray-200 rounded-md bg-gray-50 text-right text-lg"
                {...register("username", { required: "هذا الحقل مطلوب" })}
              />
              {errors.username && <p className="text-sm text-red-500 text-right">{errors.username.message}</p>}
            </div>

            <div className="space-y-3 mb-8" dir="rtl">
              <div className="flex justify-between items-center">
              <Label htmlFor="password" className="block text-gray-900 text-lg">كلمة المرور</Label>
                <span className="text-xs text-gray-500">نسيت كلمة المرور؟</span>
               
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  className="w-full p-4 border border-gray-200 rounded-md bg-gray-50 text-right text-lg"
                  {...register("password", { required: "هذا الحقل مطلوب" })}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 text-right">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full p-4 bg-[#008080] hover:bg-[#006666] text-white rounded-md text-center text-lg font-semibold mt-4"
              disabled={loading}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل دخول"}
            </Button>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link href="#" className="text-[#008080] hover:underline">
                  تواصل معنا
                </Link>
              </p>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-12">
              <span>الدعم الفني</span>
              <span>شروطنا الخدمية</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
