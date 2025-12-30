'use client';

import { Search, Bell, Pencil, ArrowRight, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { fetchPollById, type Poll, type Question } from "@/lib/services/poll"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import QuestionForm from "@/components/questionForm"
import { updateQuestion, createQuestion, deleteQuestion } from "@/lib/services/question";
import { toast } from "@/components/ui/toast";


// Create a client component that uses useSearchParams
function QuestionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pollId = searchParams.get('pollId')
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Set mounted state to true when component mounts on client
    setIsMounted(true)
    
    // Check authentication only on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
    }

    // Check if pollId exists
    if (!pollId) {
      setError('معرف الاستطلاع غير موجود')
      setLoading(false)
      return
    }

    // Fetch poll data
    const loadPoll = async () => {
      try {
        setLoading(true)
        const response = await fetchPollById(pollId)
        setPoll(response.poll || response)
      } catch (err) {
        console.error('Error fetching poll:', err)
        setError('فشل في تحميل بيانات الاستطلاع')
        toast({
          title: 'تعذر تحميل الاستطلاع',
          description: 'حدث خطأ أثناء تحميل البيانات، حاول مرة أخرى.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    // Only load poll if we're mounted on the client
    if (isMounted) {
      loadPoll()
    }
  }, [pollId, router, isMounted])

  // Handle editing a question
  const handleEditQuestion = (questionId: string) => {
    console.log('Edit question:', questionId)
    // Find the question with the matching ID
    const questionToEdit = poll?.questions.find(q => q._id === questionId)
    if (questionToEdit) {
      setCurrentQuestion(questionToEdit)
      setIsCreatingQuestion(false)
      setIsQuestionModalOpen(true)
    }
  }

  // Handle creating a new question
  const handleCreateQuestion = () => {
    // Create an empty question template
    const newQuestion: Question = {
      _id: '',
      text: '',
      answers: [
        { _id: '0', text: '', points: 0 },
        { _id: '1', text: '', points: 0 }
      ]
    }
    setCurrentQuestion(newQuestion)
    setIsCreatingQuestion(true)
    setIsQuestionModalOpen(true)
  }

  // Handle deleting a question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      return
    }
    
    try {
      setIsDeleting(true)
      await deleteQuestion(questionId)
      toast({
        title: 'تم حذف السؤال',
        description: 'تمت إزالة السؤال بنجاح من الاستطلاع.',
        variant: 'success',
      })
      
      // Refresh poll data to show the updated questions list
      if (pollId) {
        const response = await fetchPollById(pollId)
        setPoll(response.poll || response)
      }
      
     
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: 'فشل حذف السؤال',
        description: 'حدث خطأ أثناء حذف السؤال، يرجى المحاولة لاحقًا.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle saving edited question
  const handleSaveQuestion = async (questionData: Question) => {
    try {
      if (isCreatingQuestion) {
        // Create a new question
        const cleanQuestionData = {
          text: questionData.text,
          answers: questionData.answers.map(answer => ({
            text: answer.text,
            points: answer.points,
            _id: answer._id
          })),
          pollId: pollId // Add the poll ID to associate the question with the poll
        };
        
        await createQuestion(cleanQuestionData)
        toast({
          title: 'تم إنشاء السؤال',
          description: 'تمت إضافة السؤال الجديد بنجاح.',
          variant: 'success',
        })
       
      } else {
        // Update existing question
        if (!currentQuestion?._id) return
        
        // Create a clean copy of the question data with only the required fields
        const cleanQuestionData = {
          text: questionData.text,
          answers: questionData.answers.map(answer => ({
            text: answer.text,
            points: answer.points,
            _id: answer._id
          }))
        };
        
        // Call the updated updateQuestion function with just the question ID
        await updateQuestion(currentQuestion._id, cleanQuestionData)
        toast({
          title: 'تم تحديث السؤال',
          description: 'تم حفظ التعديلات بنجاح.',
          variant: 'success',
        })
       
      }
      
      // Refresh poll data to show the updated question
      if (pollId) {
        const response = await fetchPollById(pollId)
        setPoll(response.poll || response)
      }
      
      // Close modal
      setIsQuestionModalOpen(false)
      setCurrentQuestion(null)
      setIsCreatingQuestion(false)
    } catch (error) {
      console.error('Error saving question:', error)
      toast({
        title: 'فشل حفظ السؤال',
        description: 'حدث خطأ أثناء حفظ السؤال، حاول مرة أخرى.',
        variant: 'destructive',
      })
    }
  }

  // Handle canceling question edit
  const handleCancelQuestionEdit = () => {
    setIsQuestionModalOpen(false)
    setCurrentQuestion(null)
    setIsCreatingQuestion(false)
  }

  // Return null during server-side rendering or initial client render
  if (!isMounted) {
    return null
  }

  if (loading) return <Loader />
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  if (!poll) return <div className="flex h-screen items-center justify-center">الاستطلاع غير موجود</div>

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block w-48 bg-[#1e1e2d] text-white">
        <div className="h-screen relative">
          <Image 
            src="/imag.png"
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link 
                  href="/dashboard" 
                  className="text-[#009688] hover:text-[#00796b] flex items-center gap-2 mb-2"
                >
                  <ArrowRight className="h-4 w-4" /> العودة للوحة التحكم
                </Link>
                <h1 className="text-2xl font-bold">تعديل أسئلة الاستطلاع: {poll.title}</h1>
                <p className="text-gray-600">{poll.description}</p>
              </div>
              <Button 
                onClick={handleCreateQuestion}
                className="bg-[#009688] hover:bg-[#00796b] text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                إضافة سؤال جديد
              </Button>
            </div>
            
            {poll.questions.map((question, index) => (
              <div key={question._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold">السؤال {index + 1}: {question.text}</h2>
                  <div className="flex gap-2">
                    <button 
                      className="text-[#009688] hover:text-[#00796b]"
                      onClick={() => handleEditQuestion(question._id)}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteQuestion(question._id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4" dir="rtl">
                  {question.answers.map((answer, optionIndex) => (
                    <div key={answer._id || optionIndex} className="flex items-center space-x-2 space-x-reverse p-3 border border-gray-200 rounded-md">
                      <div className="bg-[#1e1e2d] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm mr-2">
                        {optionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{answer.text}</p>
                        <p className="text-sm text-gray-500">{answer.points} نقاط</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

           
          </div>
        </main>
      </div>

      {/* Question Edit/Create Modal */}
      {currentQuestion && (
        <Modal 
          isOpen={isQuestionModalOpen} 
          onClose={handleCancelQuestionEdit}
          size="lg"
        >
          <QuestionForm 
            initialData={currentQuestion}
            onSubmitAction={handleSaveQuestion}
            onCancelAction={handleCancelQuestionEdit}
            isCreating={isCreatingQuestion}
          />
        </Modal>
      )}
      

     
    </div>
  )
}

// Main component with Suspense boundary
export default function QuestionsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <QuestionsContent />
    </Suspense>
  );
}
