"use client"

import { Search, Bell, Pencil, Trash2 } from "lucide-react"
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
  const [pollResults, setPollResults] = useState<{[key: number]: number}>({})
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Function to load polls and their results
  const loadPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPolls()
      setPolls(data.data)
      
      // Fetch results for each poll
      const results: {[key: number]: number} = {}
      for (const poll of data.data) {
        try {
          const solveData = await fetchSolvePolls(poll.id)
          console.log(`Poll ${poll.id} solve data:`, solveData)
          
          let totalPoints = 0
          let totalAnswers = 0
          
          // Check if we have valid data
          if (solveData && solveData.data) {
            // Case 1: Data structure with answers array in data
            if (solveData.data.answers && Array.isArray(solveData.data.answers)) {
              console.log(`Poll ${poll.id} has answers array format with ${solveData.data.answers.length} answers`)
              
              for (const item of solveData.data.answers) {
                // Log the item to see its structure
                console.log(`Answer item:`, item)
                
                if (item && item.answer && typeof item.answer.points === 'number') {
                  totalPoints += item.answer.points
                  totalAnswers += 1
                  console.log(`Added points: ${item.answer.points}, total now: ${totalPoints}`)
                }
              }
            } 
            // Case 2: Data structure is an array directly
            else if (Array.isArray(solveData.data)) {
              console.log(`Poll ${poll.id} has array format with ${solveData.data.length} items`)
              
              for (const solve of solveData.data) {
                // Log the solve object to see its structure
                console.log(`Solve item:`, solve)
                
                if (solve && solve.solve && Array.isArray(solve.solve)) {
                  for (const answer of solve.solve) {
                    // Find the question and answer in the poll
                    const question = poll.questions.find(q => q.id === answer.questionId)
                    if (question) {
                      const selectedAnswer = question.answers.find(a => a.id === answer.answerId)
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
            // Case 3: Direct access to points if available
            else if (typeof solveData.data.points === 'number') {
              totalPoints = solveData.data.points;
              totalAnswers = 1;
              console.log(`Direct points value: ${totalPoints}`);
            }
            
            // Calculate simple average
            results[poll.id] = totalAnswers > 0 ? Math.round((totalPoints / totalAnswers) * 10) / 10 : 0
            console.log(`Poll ${poll.id} final calculation: totalPoints=${totalPoints}, totalAnswers=${totalAnswers}, average=${results[poll.id]}`)
          } else {
            console.log(`Poll ${poll.id} has no valid data structure`)
            results[poll.id] = 0
          }
        } catch (err) {
          console.error(`Error fetching solve data for poll ${poll.id}:`, err)
          results[poll.id] = 0
        }
      }
      
      console.log("Final poll results:", results)
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
        const response = await updatePoll(currentPoll.id, pollData)
        
        // Check the structure of the response
        const updatedPoll = response.data ? response.data : response;
        
        // Update polls state by replacing the updated poll
        setPolls(prevPolls => prevPolls.map(poll => poll.id === currentPoll.id ? updatedPoll : poll))
        
        // Refresh poll results for the updated poll
        try {
          const solveData = await fetchSolvePolls(updatedPoll.id)
          let totalPoints = 0
          let totalAnswers = 0
          
          if (solveData && solveData.data) {
            // Process the data based on its structure (similar to loadPolls)
            if (solveData.data.answers && Array.isArray(solveData.data.answers)) {
              for (const item of solveData.data.answers) {
                if (item && item.answer && typeof item.answer.points === 'number') {
                  totalPoints += item.answer.points
                  totalAnswers += 1
                }
              }
            } else if (Array.isArray(solveData.data)) {
              for (const solve of solveData.data) {
                if (solve && solve.solve && Array.isArray(solve.solve)) {
                  for (const answer of solve.solve) {
                    const question = updatedPoll.questions.find(q => q.id === answer.questionId)
                    if (question) {
                      const selectedAnswer = question.answers.find(a => a.id === answer.answerId)
                      if (selectedAnswer && typeof selectedAnswer.points === 'number') {
                        totalPoints += selectedAnswer.points
                        totalAnswers += 1
                      }
                    }
                  }
                }
              }
            } else if (typeof solveData.data.points === 'number') {
              totalPoints = solveData.data.points;
              totalAnswers = 1;
            }
            
            // Update the specific poll result
            setPollResults(prev => ({
              ...prev,
              [updatedPoll.id]: totalAnswers > 0 ? Math.round((totalPoints / totalAnswers) * 10) / 10 : 0
            }))
          }
        } catch (err) {
          console.error(`Error refreshing poll results for poll ${updatedPoll.id}:`, err)
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
          [newPoll.id]: 0
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

  const handleDeletePoll = async (pollId: number) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الاستطلاع؟')) {
      try {
        await deletePoll(pollId)
        // Remove the deleted poll from the state
        setPolls(polls.filter(poll => poll.id !== pollId))
        
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

  const navigateToPollDetail = (pollId: number) => {
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-52 bg-[#1e1e2d] text-white">
      <div className="h-screen relative">
          <Image src="/imag.png" alt="Logo" fill priority />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          {/* Search */}
          <div className="relative w-1/2" dir="rtl">
            <Input 
              placeholder="بحث..." 
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">الاستطلاعات</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-gray-100 text-gray-700">
                    تصدير للاكسل
                  </Button>
                  <Button 
                    className="bg-[#009688] hover:bg-[#00796b] text-white"
                    onClick={() => setShowPollForm(true)}
                  >
                    إضافة
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                      <tr key={poll.id} className="border-b">
                        <td className="py-4 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                          {poll.title}
                        </td>
                        <td className="py-4">{poll?.questions?.length}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                            {pollResults[poll.id] !== undefined ? 
                              <span>{pollResults[poll.id]} نقطة</span> : 
                              <span>-</span>
                            }
                          </div>                      
                        </td>
                        <td className="py-4">{poll.description}</td>
                        <td className="py-4">
                          <button 
                            className="text-[#009688] hover:text-[#00796b] hover:underline"
                            onClick={() => navigateToPollDetail(poll.id)}
                          >
                            عرض
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex justify-center">
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeletePoll(poll.id)}
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

              {/* Pagination */}
              <div className="mt-6 text-center">
                <button className="text-gray-500 hover:text-gray-700">عرض المزيد</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
