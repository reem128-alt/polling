import { Search, Bell, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function page() {
  // Sample data for questions
  const questions = Array(3).fill(null)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-48 bg-[#1e1e2d] text-white">
      <div className="h-screen relative">
          <Image 
            src="/image.png"
            alt="Logo"
            fill
            priority
            
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          {/* Search */}
          <div className="relative w-1/2">
            <Input placeholder="بحث..." className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300" />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <span className="sr-only">الإشعارات</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  1
                </div>
                <Bell className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-right">
              <h3 className="font-bold">اسم المدير</h3>
              <p className="text-sm text-gray-500">مرحبا بك</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto" dir="rtl">
          <div className="max-w-4xl mx-auto space-y-6">
            {questions.map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold">السؤال</h2>
                  <div className="flex gap-2">
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="text-[#009688] hover:text-[#00796b]">
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <RadioGroup defaultValue="option-1" className="grid grid-cols-2 gap-4" dir="rtl">
                  {Array(4)
                    .fill(null)
                    .map((_, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={`option-${optionIndex + 1}`} id={`option-${index}-${optionIndex + 1}`} />
                        <Label htmlFor={`option-${index}-${optionIndex + 1}`}>جواب</Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>
            ))}

            <Button className="w-full bg-[#009688] hover:bg-[#00796b] text-white">إضافة سؤال جديد</Button>

            {/* Blue section at bottom */}
           
          </div>
        </main>
      </div>
    </div>
  )
}

