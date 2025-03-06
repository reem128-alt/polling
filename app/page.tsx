"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { fetchPolls, type Poll } from "@/lib/services/poll"
import { Loader } from "@/components/ui/loader"

export default function HomePage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)

    // Fetch polls
    const loadPolls = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPolls()
        setPolls(data.data)
      } catch (err) {
        setError('فشل في تحميل الاستطلاعات')
        console.error('Error fetching polls:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPolls()
  }, [])

  const handleStartPolling = (pollId: number) => {
    router.push(`/userPolling?pollId=${pollId}`)
  }

  if (loading) return <Loader />

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar with Login Image */}
      <div className="hidden md:block w-1/4 bg-[#1e1e2d] text-white relative h-screen">
        {/* Background Image Layer */}
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/imag.png" 
            alt="Login Background" 
            fill 
            priority 
            className="object-cover opacity-90"
            style={{ objectPosition: 'center' }}
          />
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        {/* Content */}
        <div className="p-8 relative z-10 flex flex-col h-full">
          <div className="mt-auto w-full text-center">
            <h1 className="text-4xl  mb-40">نظام الاستطلاعات</h1>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 flex flex-col h-screen overflow-y-scroll custom-scrollbar">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 md:hidden">نظام الاستطلاعات</h1>
            </div>
            <div>
              {isAuthenticated ? (
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#008080] hover:bg-[#006666] text-white"
                >
                  لوحة التحكم
                </Button>
              ) : (
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-[#008080] hover:bg-[#006666] text-white"
                >
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Polls Content */}
        <main className="container mx-auto px-6 py-8 flex-grow flex flex-col overflow-hidden">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">استطلاعات متاحة</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اختر من الاستطلاعات المتاحة أدناه للمشاركة. كل استطلاع يحتوي على مجموعة من الأسئلة المصممة لجمع آرائك وملاحظاتك القيمة.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md text-center mb-4">
              {error}
            </div>
          )}

          {polls.length === 0 && !loading && !error ? (
            <div className="text-center py-12 text-gray-500">
              لا توجد استطلاعات متاحة حالياً
            </div>
          ) : (
            <div className="polls-container h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {polls.map((poll) => (
                  <div 
                    key={poll.id} 
                    onClick={() => handleStartPolling(poll.id)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="p-6 border-l-4 border-[#008080]">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{poll.title}</h3>
                      <p className="text-gray-600 mb-4 min-h-[60px]">{poll.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{poll.questions.length} أسئلة</span>
                        <Button
                          className="bg-[#008080] hover:bg-[#006666] text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartPolling(poll.id);
                          }}
                        >
                          بدء الاستطلاع
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">  {new Date().getFullYear()} نظام الاستطلاعات. جميع الحقوق محفوظة.</p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm">الشروط والأحكام</Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm mr-4">سياسة الخصوصية</Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm mr-4">اتصل بنا</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}