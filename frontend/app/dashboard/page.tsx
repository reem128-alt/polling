"use client"

import { Search, Bell, Pencil, Trash2, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { fetchPolls, createPoll, deletePoll, updatePoll, type Poll, fetchSolvePolls } from "@/lib/services/poll"
import { useEffect, useState } from "react"
import PollForm from "@/components/pollForm"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/ui/loader"

export default function Page() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPollForm, setShowPollForm] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [pollResults, setPollResults] = useState<{[key: string]: number}>({})
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Function to load polls and their results
  const loadPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPolls()
      setPolls(data.polls)
      
      // Fetch results for each poll
      const results: {[key: string]: number} = {}
      for (const poll of data.polls) {
        try {
          const solveData = await fetchSolvePolls(poll._id)
          
          let totalPoints = 0
          let totalAnswers = 0
          
          // Check if we have valid data
          if (solveData && solveData.success && solveData.data) {
            // Case 1: Data structure with answers array in data
            if (solveData.data.answers && Array.isArray(solveData.data.answers)) {
              
              for (const item of solveData.data.answers) {
                if (item && item.answer && typeof item.answer.points === 'number') {
                  totalPoints += item.answer.points
                  totalAnswers += 1
                  console.log(`Added points: ${item.answer.points}, total now: ${totalPoints}`)
                }
              }
            } 
            // Case 2: Data structure is an array directly
            else if (Array.isArray(solveData.poll)) {
              console.log(`Poll ${poll._id} has array format with ${solveData.poll.length} items`)
              
              for (const solve of solveData.poll) {
                if (solve && solve.solve && Array.isArray(solve.solve)) {
                  for (const answer of solve.solve) {
                    // Find the question and answer in the poll
                    const question = poll.questions.find(q => q._id === answer.questionId)
                    if (question) {
                      const selectedAnswer = question.answers.find(a => a._id === answer.answerId)
                      if (selectedAnswer && typeof selectedAnswer.points === 'number') {
                        totalPoints += selectedAnswer.points
                        totalAnswers += 1
                        console.log(`Added points from question: ${selectedAnswer.points}, total now: ${totalPoints}`)
                      }
                    }
                  }
                }
              }
            }
            
            // Calculate simple average
            results[poll._id] = totalAnswers > 0 ? Math.round((totalPoints / totalAnswers) * 10) / 10 : 0
            console.log(`Poll ${poll._id} final calculation: totalPoints=${totalPoints}, totalAnswers=${totalAnswers}, average=${results[poll._id]}`)
          } else {
            console.log(`Poll ${poll._id} has no valid data structure`)
            results[poll._id] = 0
          }
        } catch (err) {
          console.error(`Error fetching solve data for poll ${poll._id}:`, err)
          results[poll._id] = 0
        }
      }
      
      
      setPollResults(results)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('فشل في تحميل الاستطلاعات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    
    
    if (!token) {
      router.push('/login')
      return
    }
    
    loadPolls()
  }, [router])

  const handlePollSubmit = async (pollData: Omit<Poll, 'id'>) => {
    try {
      setFormSubmitting(true)
      if (isUpdating && currentPoll) {
        // Update existing poll
        const response = await updatePoll(currentPoll._id, pollData)
        
        
        // Check the structure of the response and extract the updated poll data
        const responseAny = response as any;
        const updatedPoll = responseAny.poll || responseAny.data || response;
        
        // Update polls state by replacing the updated poll
        setPolls(prevPolls => prevPolls.map(poll => poll._id === currentPoll._id ? updatedPoll : poll))
        
        // Refresh poll results for the updated poll
        try {
          const solveData = await fetchSolvePolls(updatedPoll._id)
          let totalPoints = 0
          let totalAnswers = 0
          
          if (solveData && solveData.success && solveData.data) {
            // Process the data based on its structure (similar to loadPolls)
            if (solveData.data.answers && Array.isArray(solveData.data.answers)) {
              for (const item of solveData.data.answers) {
                if (item && item.answer && typeof item.answer.points === 'number') {
                  totalPoints += item.answer.points
                  totalAnswers += 1
                }
              }
            } else if (Array.isArray(solveData.poll)) {
              for (const solve of solveData.poll) {
                if (solve && solve.solve && Array.isArray(solve.solve)) {
                  for (const answer of solve.solve) {
                    const question = updatedPoll.questions.find(q => q._id === answer.questionId)
                    if (question) {
                      const selectedAnswer = question.answers.find(a => a._id === answer.answerId)
                      if (selectedAnswer && typeof selectedAnswer.points === 'number') {
                        totalPoints += selectedAnswer.points
                        totalAnswers += 1
                      }
                    }
                  }
                }
              }
            } else if (typeof solveData.poll.points === 'number') {
              totalPoints = solveData.poll.points;
              totalAnswers = 1;
            }
            
            // Update the specific poll result
            setPollResults(prev => ({
              ...prev,
              [updatedPoll._id]: totalAnswers > 0 ? Math.round((totalPoints / totalAnswers) * 10) / 10 : 0
            }))
          }
        } catch (err) {
          console.error(`Error refreshing poll results for poll ${updatedPoll._id}:`, err)
        }
        
        // Force a refresh of the polls data to ensure we have the latest data
        setTimeout(() => {
          loadPolls();
        }, 500);
      } else {
        // Create new poll
        const response = await createPoll(pollData)
        
        // Check the structure of the response
        const newPoll = response.data ? response.data : response;
        
        // Add the new poll to the state
        setPolls(prevPolls => [...prevPolls, newPoll])
        
        // Initialize result for the new poll
        setPollResults(prev => ({
          ...prev,
          [newPoll._id]: 0
        }))
        
        // Force a refresh of the polls data to ensure we have the latest data
        setTimeout(() => {
          loadPolls();
        }, 500);
      }
      setShowPollForm(false)
      setCurrentPoll(null)
      setIsUpdating(false)
    } catch (error) {
      console.error('Error saving poll:', error)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeletePoll = async (pollId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الاستطلاع؟')) {
      try {
        await deletePoll(pollId)
        // Remove the deleted poll from the state
        setPolls(polls.filter(poll => poll._id !== pollId))
        
        // Remove the poll result from the state
        setPollResults(prev => {
          const newResults = { ...prev }
          delete newResults[pollId]
          return newResults
        })
      } catch (error) {
        console.error('Error deleting poll:', error)
        alert('حدث خطأ أثناء حذف الاستطلاع')
      }
    }
  }

  const handleUpdatePoll = (poll: Poll) => {
    setCurrentPoll(poll)
    setIsUpdating(true)
    setShowPollForm(true)
  }

  const navigateToPollDetail = (pollId: string) => {
    router.push(`/pollDetail/${pollId}`)
  }

  // Filter polls based on search query
  const filteredPolls = polls.filter(poll => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      poll.title.toLowerCase().includes(query) ||
      poll.description.toLowerCase().includes(query)
    );
  });

  // If not authenticated, show nothing while redirecting
  if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return <Loader text="جاري التحقق من الصلاحيات..." />;
  }

  if (loading) return <Loader />;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - hidden on mobile/small screens */}
      <div className="hidden md:block w-52 bg-[#1e1e2d] text-white">
        <div className="h-screen relative">
          <Image src="/imag.png" alt="Logo" fill priority className="object-cover" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <header className="bg-white p-3 md:p-4 shadow-sm flex justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-1/2" dir="rtl">
            <Input 
              placeholder="بحث..." 
              className="pl-10 pr-4 py-1 md:py-2 w-full rounded-md border border-gray-300" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2 md:top-2.5 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#009688] hover:bg-green-50"
              onClick={() => router.push('/')}
              title="الصفحة الرئيسية"
            >
              <Home className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">الصفحة الرئيسية</span>
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <span className="sr-only">الإشعارات</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full text-[8px] md:text-[10px] text-white flex items-center justify-center">
                  1
                </div>
                <Bell className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-700"
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              title="تسجيل الخروج"
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">تسجيل الخروج</span>
            </Button>
            <div className="text-right">
              <h3 className="font-bold text-sm md:text-base">اسم المدير</h3>
              <p className="text-xs md:text-sm text-gray-500">مرحبا بك</p>
            </div>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 overflow-auto" dir="rtl">
          {showPollForm ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{isUpdating ? 'تعديل استطلاع' : 'إضافة استطلاع جديد'}</h2>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPollForm(false)
                    setCurrentPoll(null)
                    setIsUpdating(false)
                  }}
                  className="bg-gray-100 text-gray-700"
                >
                  إلغاء
                </Button>
              </div>
              <PollForm 
                onSubmitAction={handlePollSubmit} 
                isLoading={formSubmitting}
                initialData={isUpdating && currentPoll ? {
                  title: currentPoll.title,
                  description: currentPoll.description,
                  questions: currentPoll.questions
                } as Omit<Poll, 'id'> : undefined}
                pollId={isUpdating && currentPoll ? currentPoll._id.toString() : undefined}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">الاستطلاعات</h2>
                <div className="flex gap-2">
                 
                  <Button 
                    className="bg-[#009688] hover:bg-[#00796b] text-white"
                    onClick={() => setShowPollForm(true)}
                  >
                    إضافة
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div 
                className="rtl-table-container overflow-x-auto w-full" 
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin', /* For Firefox */
                  msOverflowStyle: 'none', /* For Internet Explorer and Edge */
                }}
              >
                <style jsx>{`
                  .rtl-table-container::-webkit-scrollbar {
                    height: 4px;
                  }
                  .rtl-table-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                  }
                  .rtl-table-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 4px;
                  }
                  .rtl-table-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                  }
                `}</style>
                <div className="rtl-table-wrapper min-w-max">
                  <table className="w-full divide-y divide-gray-200" dir="rtl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الأسئلة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النتيجة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وصف مبسط</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تفاصيل</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">حذف</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تعديل</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPolls.map(poll => (
                        <tr key={poll._id} className="border-b">
                          <td className="py-4 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                            {poll.title}
                          </td>
                          <td className="py-4">{poll?.questions?.length}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                              {pollResults[poll._id] !== undefined ? 
                                <span>{pollResults[poll._id]} نقطة</span> : 
                                <span>-</span>
                              }
                            </div>                      
                          </td>
                          <td className="py-4">{poll.description}</td>
                          <td className="py-4">
                            <button 
                              className="text-[#009688] hover:text-[#00796b] hover:underline"
                              onClick={() => navigateToPollDetail(poll._id)}
                            >
                              عرض
                            </button>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeletePoll(poll._id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              <button 
                                className="text-[#009688] hover:text-[#00796b]"
                                onClick={() => handleUpdatePoll(poll)}
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

             
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
