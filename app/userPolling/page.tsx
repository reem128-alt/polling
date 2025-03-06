"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
//import { Progress } from "@/components/ui/progress"
import dynamic from "next/dynamic"
import { clientPool, type ClientPoll, fetchPollById, type Poll } from "@/lib/services/poll"
import { useRouter, useSearchParams } from "next/navigation"
import { MathExpression } from "@/components/MathExpression"
import { Loader } from "@/components/ui/loader"

// Dynamically import the Image component with SSR disabled
const Image = dynamic(() => import("next/image"), { ssr: false })

export default function Survey() {
  return (
    <Suspense fallback={<Loader />}>
      <SurveyContent />
    </Suspense>
  )
}

function SurveyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pollId = searchParams.get('pollId')

  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employment_status: "Student", // Default value
    teaching: "",
    date_of_birth: "",
    address: "",
    gender: "male", // Default value
  })
  const [answers, setAnswers] = useState<Array<{ questionId: number; answerId: number }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch poll data based on pollId
  useEffect(() => {
    const loadPoll = async () => {
      if (!pollId) {
        setError("معرف الاستطلاع غير موجود")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetchPollById(pollId)
        setPoll(response.data)
      } catch (err) {
        setError("فشل في تحميل الاستطلاع")
        console.error("Error loading poll:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPoll()
  }, [pollId])

  const progress: { [key in 1 | 2 | 3]: number } = {
    1: 25,
    2: 50,
    3: 100,
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    // Check if this question has been answered before
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId)
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      const updatedAnswers = [...answers]
      updatedAnswers[existingAnswerIndex] = { questionId, answerId }
      setAnswers(updatedAnswers)
    } else {
      // Add new answer
      setAnswers([...answers, { questionId, answerId }])
    }
  }

  const handleNext = async () => {
    if (step === 3) {
      // Submit the form data
      await handleSubmit()
    } else {
      // Move to next step
      setStep((step + 1) as 1 | 2 | 3)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      // Create the data object to submit
      const clientPollData: ClientPoll = {
        ...formData,
        solve: answers,
        //pollId: Number(pollId) // Add pollId to the submission
      }
      
      // Call the clientPool function
      const response = await clientPool(clientPollData)
      
      if (response.success) {
        setSubmitSuccess(true)
        // Optionally redirect or show success message
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setSubmitError(response.message || 'حدث خطأ أثناء إرسال البيانات')
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      setSubmitError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (loading) return <Loader />;
  
  // Show error state
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  
  // Show message if poll not found
  if (!poll) return <div className="flex h-screen items-center justify-center">لم يتم العثور على الاستطلاع</div>

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block w-1/4 bg-[#1e1e2d] text-white relative h-screen">
        {/* Background Image Layer */}
        <div className="absolute inset-0 w-full h-full">
         
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-transparent "></div>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 w-full h-full">
          {typeof window !== 'undefined' && (
            <Image 
              src="/img2.png"
              alt="Background"
              fill
              priority
              className="object-cover opacity-80"
              style={{ objectPosition: 'center' }}
            />
          )}
        </div>
        {/* Content */}
        <div className="p-8 relative z-10 flex flex-col h-full">
          <div className="mt-auto w-full">
            <div className="flex flex-col mb-6 items-end">
              <h1 className="text-5xl font-bold mb-4">{poll.title}</h1>
              <p className="text-gray-400 mb-2 text-sm">{poll.description}</p>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                {progress[step]}% تم استكمال
              </span>
              <span className="text-sm font-semibold text-white">
                {step === 1 ? "المعلومات الشخصية" : step === 2 ? "الأسئلة" : "الانتهاء"}
              </span>
            </div>
            <div className="overflow-hidden h-1 text-xs flex rounded bg-[#ffffff33] mb-12">
              <div
                style={{ width: `${progress[step]}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#009688]"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              <div className="w-full max-w-3xl flex justify-between items-center">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className={`flex flex-col items-center ${step >= 1 ? 'text-[#009688]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200'}`}>
                      <span className="text-lg font-medium">1</span>
                    </div>
                    <span className="text-sm mt-1">المعلومات الخاصة بك</span>
                  </div>
                  <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-[#009688]' : 'bg-gray-200'}`}></div>
                  <div className={`flex flex-col items-center ${step >= 2 ? 'text-[#009688]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200'}`}>
                      <span className="text-lg font-medium">2</span>
                    </div>
                    <span className="text-sm mt-1">الأسئلة</span>
                  </div>
                  <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-[#009688]' : 'bg-gray-200'}`}></div>
                  <div className={`flex flex-col items-center ${step >= 3 ? 'text-[#009688]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200'}`}>
                      <span className="text-lg font-medium">3</span>
                    </div>
                    <span className="text-sm mt-1">الموافقة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-sm rounded-lg p-6 max-w-3xl mx-auto">
              {step === 1 && (
                <div className="space-y-8">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e0f2f1] to-[#f5f5f5] p-1">
                    <div className="absolute top-0 left-0 w-20 h-20 bg-[#009688]/10 rounded-br-full"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#009688]/10 rounded-tl-full"></div>
                    <div className="bg-white rounded-lg p-6 shadow-sm relative z-10">
                      <h2 className="text-2xl font-bold text-[#1e1e2d] mb-6 text-right flex items-center justify-end gap-2">
                        <span>المعلومات الشخصية</span>
                        <div className="bg-[#009688] text-white p-1.5 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                          <Label htmlFor="name" className="block text-right mb-2 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                            <div className="bg-[#009688] text-white p-1 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            الاسم
                          </Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="text-right border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md" 
                            placeholder="أدخل اسمك الكامل"
                          />
                        </div>
                        
                        <div className="space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                          <Label htmlFor="email" className="block text-right mb-2 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                            <div className="bg-[#1e1e2d] text-white p-1 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </div>
                            البريد الالكتروني
                          </Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="text-right border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md" 
                            placeholder="أدخل بريدك الإلكتروني"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50 transition-all duration-300 hover:shadow-md hover:border-[#009688]/20">
                        <Label className="block text-right mb-4 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                          <div className="bg-[#009688] text-white p-1 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                          </div>
                          الحالة وظيفية
                        </Label>
                        <RadioGroup 
                          value={formData.employment_status} 
                          onValueChange={(value) => handleRadioChange('employment_status', value)}
                          className="flex flex-wrap gap-4 mt-2 justify-end"
                        >
                          <div className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.employment_status === 'Student' ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200 hover:border-[#009688]/50'}`}>
                            <Label htmlFor="student" className="cursor-pointer">طالب</Label>
                            <RadioGroupItem value="Student" id="student" className="text-[#009688]" />
                          </div>
                          <div className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.employment_status === 'Employee' ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200 hover:border-[#009688]/50'}`}>
                            <Label htmlFor="employee" className="cursor-pointer">موظف</Label>
                            <RadioGroupItem value="Employee" id="employee" className="text-[#009688]" />
                          </div>
                          <div className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.employment_status === 'Business' ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200 hover:border-[#009688]/50'}`}>
                            <Label htmlFor="business" className="cursor-pointer">صاحب عمل</Label>
                            <RadioGroupItem value="Business" id="business" className="text-[#009688]" />
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="mt-6 space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                        <Label htmlFor="teaching" className="block text-right mb-2 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                          <div className="bg-[#1e1e2d] text-white p-1 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 1-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                          </div>
                          التعليم
                        </Label>
                        <Input 
                          id="teaching" 
                          name="teaching" 
                          value={formData.teaching} 
                          onChange={handleInputChange} 
                          className="text-right border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md" 
                          placeholder="أدخل مستواك التعليمي"
                        />
                      </div>
                      
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                          <Label htmlFor="address" className="block text-right mb-2 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                            <div className="bg-[#009688] text-white p-1 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
                            عنوان السكن
                          </Label>
                          <Input 
                            id="address" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            className="text-right border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md" 
                            placeholder="أدخل عنوان سكنك"
                          />
                        </div>
                        
                        <div className="space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                          <Label htmlFor="date_of_birth" className="block text-right mb-2 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                            <div className="bg-[#1e1e2d] text-white p-1 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </div>
                            تاريخ ولادة
                          </Label>
                          <Input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="text-right border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50 transition-all duration-300 hover:shadow-md hover:border-[#009688]/20">
                        <Label className="block text-right mb-4 text-lg font-medium flex items-center gap-2 justify-end text-[#1e1e2d]">
                          <div className="bg-[#009688] text-white p-1 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                          </div>
                          الجنس
                        </Label>
                        <RadioGroup 
                          value={formData.gender} 
                          onValueChange={(value) => handleRadioChange('gender', value)}
                          className="flex gap-4 mt-2 justify-end"
                        >
                          <div className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.gender === 'male' ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200 hover:border-[#009688]/50'}`}>
                            <Label htmlFor="male" className="cursor-pointer">ذكر</Label>
                            <RadioGroupItem value="male" id="male" className="text-[#009688]" />
                          </div>
                          <div className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.gender === 'female' ? 'border-[#009688] bg-[#e0f2f1]' : 'border-gray-200 hover:border-[#009688]/50'}`}>
                            <Label htmlFor="female" className="cursor-pointer">انثى</Label>
                            <RadioGroupItem value="female" id="female" className="text-[#009688]" />
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8" dir="rtl">
                  {poll.questions.map((question, index) => (
                    <div key={question.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e0f2f1] to-[#f5f5f5] p-1">
                      <div className="absolute top-0 left-0 w-20 h-20 bg-[#009688]/10 rounded-br-full"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#009688]/10 rounded-tl-full"></div>
                      <div className="bg-white p-6 rounded-lg shadow-sm relative z-10">
                        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center mb-6" dir="rtl">
                          <span className="bg-[#009688] text-white px-3 py-1.5 rounded-full text-sm mt-3 md:mt-0 inline-block w-fit">
                            سؤال {index + 1} من {poll.questions.length}
                          </span>
                          <h3 className="font-bold text-xl text-right text-[#1e1e2d] flex items-center gap-2">
                            <div className="bg-[#009688] text-white p-1.5 rounded-md flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            </div>
                            {question.text.includes('*') || question.text.includes('/') || question.text.includes('+') || question.text.includes('-') || question.text.includes('(') ? 
                              <MathExpression expression={question.text} /> : 
                              question.text
                            }
                          </h3>
                        </div>
                        
                        <div className="w-full bg-gray-200 h-2 mb-6 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#009688] h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(answers.find(a => a.questionId === question.id) ? 100 : 0)}%` }}
                          ></div>
                        </div>
                        
                        <RadioGroup 
                          value={answers.find(a => a.questionId === question.id)?.answerId.toString() || ""}
                          onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right"
                          dir="rtl"
                        >
                          {question.answers.map((answer) => (
                            <div 
                              key={answer.id ?? `answer-${Math.random()}`} 
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                answers.find(a => a.questionId === question.id)?.answerId === answer.id 
                                  ? 'border-[#009688] bg-[#e0f2f1]' 
                                  : 'border-gray-200 hover:border-[#009688]/50 hover:bg-gray-50'
                              }`}
                              dir="rtl"
                            >
                              <RadioGroupItem
                                value={answer.id?.toString() ?? "0"}
                                id={`q${question.id}-option-${answer.id ?? 0}`}
                                className="text-[#009688]"
                              />
                              <Label 
                                htmlFor={`q${question.id}-option-${answer.id ?? 0}`}
                                className="flex-1 cursor-pointer font-medium"
                              >
                                {answer.text.includes('*') || answer.text.includes('/') || answer.text.includes('+') || answer.text.includes('-') || answer.text.includes('(') ? 
                                  <MathExpression expression={answer.text} /> : 
                                  answer.text
                                }
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e0f2f1] to-[#f5f5f5] p-1">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-[#009688]/10 rounded-br-full"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#009688]/10 rounded-tl-full"></div>
                  <div className="bg-white rounded-lg p-6 shadow-sm relative z-10">
                    {submitSuccess ? (
                      <div className="text-center py-8">
                        {/* Use Image component only when component is mounted */}
                        <div className="mx-auto mb-6 w-[300px] h-[300px] relative">
                          {typeof window !== 'undefined' && <Image src="/fill.png" alt="Completion" fill className="object-contain" />}
                        </div>
                        <h2 className="text-2xl font-bold text-[#009688] mb-4">تم الانتهاء</h2>
                        <p className="text-gray-500 mb-6">شكراً لك على المشاركة</p>
                        <div className="w-32 h-32 mx-auto bg-[#e0f2f1] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div dir="rtl">
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-[#1e1e2d] mb-4 text-right flex items-center justify-end gap-2">
                            <span>مراجعة المعلومات</span>
                            <div className="bg-[#009688] text-white p-1.5 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            </div>
                          </h2>
                          <p className="text-gray-600 mb-6 text-right">يرجى مراجعة معلوماتك قبل الإرسال</p>
                          
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                  </svg>
                                  الاسم:
                                </p>
                                <p className="text-gray-700">{formData.name}</p>
                              </div>
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                  </svg>
                                  البريد الإلكتروني:
                                </p>
                                <p className="text-gray-700">{formData.email}</p>
                              </div>
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                  </svg>
                                  الحالة الوظيفية:
                                </p>
                                <p className="text-gray-700">{formData.employment_status}</p>
                              </div>
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 1-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                  </svg>
                                  التعليم:
                                </p>
                                <p className="text-gray-700">{formData.teaching}</p>
                              </div>
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                  </svg>
                                  تاريخ الميلاد:
                                </p>
                                <p className="text-gray-700">{formData.date_of_birth}</p>
                              </div>
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  العنوان:
                                </p>
                                <p className="text-gray-700">{formData.address}</p>
                              </div>
                              <div className="p-4 rounded-lg border border-gray-200 hover:border-[#009688]/20 hover:shadow-sm transition-all">
                                <p className="font-semibold text-[#1e1e2d] mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                  </svg>
                                  الجنس:
                                </p>
                                <p className="text-gray-700">{formData.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {submitError && (
                          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {submitError}
                          </div>
                        )}
                        
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full bg-[#009688] hover:bg-[#00796b] text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              جاري الإرسال...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                              </svg>
                              إرسال
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {step !== 3 && (
                <div className="mt-8">
                  <Button 
                    className="w-full bg-[#009688] hover:bg-[#00796b] text-white" 
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "جاري الإرسال..." : "التالي"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
