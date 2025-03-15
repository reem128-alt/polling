"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchPollById, fetchSolvePolls, type Poll } from "@/lib/services/poll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader } from "@/components/ui/loader";

// Dynamically import the Image component with SSR disabled
const Image = dynamic(() => import("next/image"), { ssr: false });

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    
    const loadPoll = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchPollById(pollId);
        setPoll(response.poll);
        
        // Fetch poll participants
        const solveData = await fetchSolvePolls(pollId);
        console.log("Solve data received:", solveData);
        
        if (solveData.success && solveData.data && solveData.data.answers) {
          // Extract unique users from the answers
          const uniqueUsers = Array.from(
            new Map(
              solveData.data.answers.map((item: any) => [item.user.id, item.user])
            ).values()
          );
          console.log("Unique users extracted:", uniqueUsers);
          setParticipants(uniqueUsers);
        } else {
          console.log("No participants data found in the response:", solveData);
          setParticipants([]);
        }
      } catch (err) {
        setError("فشل في تحميل الاستطلاع");
        console.error("Error loading poll:", err);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      loadPoll();
    }
  }, [pollId]);

  useEffect(() => {
    console.log("Current participants state:", participants);
  }, [participants]);

  // Return null during server-side rendering to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (loading) return <Loader />;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  if (!poll) return <div className="flex h-screen items-center justify-center">لم يتم العثور على الاستطلاع</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block w-1/4 bg-[#1e1e2d] text-white">
        <div className="h-screen relative">
          {isMounted && <Image src="/imag.png" alt="Logo" fill priority />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-scroll">
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center" dir="rtl">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-1">
                <span>العودة للوحة التحكم</span>
              </Button>
            </Link>
            <h1 className="text-xl font-bold t" >تفاصيل الاستطلاع</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6" dir="rtl">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{poll.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-500">عدد الأسئلة: </span>
                  <span className="font-medium">{poll.questions.length}</span>
                </div>
                <Link href={`/userPolling?pollId=${poll._id}`}>
                  <Button className="bg-[#009688] hover:bg-[#00796b] text-white">
                    بدء الاستطلاع <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">الأسئلة</h2>
            <div className="rtl-table-container">
              <div className="rtl-table-wrapper">
                {poll.questions.map((question, index) => (
                  <Card key={question._id} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        السؤال {index + 1}: {question.text}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h3 className="font-medium">الإجابات المحتملة:</h3>
                        <ul className="space-y-2">
                          {question.answers.map((answer) => (
                            <li key={answer._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                              <span>{answer.text}</span>
                              <span className="text-sm bg-[#009688] text-white px-2 py-1 rounded">
                                {answer.points} نقطة
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Participants Section */}
          {participants.length > 0 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-xl font-bold mb-4">المشاركون في الاستطلاع</h2>
              <div className="rtl-table-container">
                <div className="rtl-table-wrapper">
                  {participants.map((user) => (
                    <Card key={user._id} className="mb-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">{user.name || "مستخدم بدون اسم"}</h3>
                            <p className="text-sm text-gray-500">{user.email || "بدون بريد إلكتروني"}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.gender && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {user.gender === "male" ? "ذكر" : "أنثى"}
                              </span>
                            )}
                            {user.teaching && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                {user.teaching}
                              </span>
                            )}
                            {user.employment_status && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                {user.employment_status}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
