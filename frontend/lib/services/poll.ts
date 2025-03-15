const url = process.env.NEXT_PUBLIC_API_URL
export type Answer={
  _id?:string,
  text:string,
  points:number
}
export type Question={
  _id:string,
  text:string,
  answers: Answer[]

}

export type Poll={
data: any
_id:string,
title:string,
description:string,
questions:Question[]
}
export type ClientPoll = {
  name: string;
  email: string;
  employment_status: string;
  teaching: string;
  date_of_birth: string;
  address: string;
  gender: string;
  solve: {
    questionId: string;
    answerId: string;
  }[];
  pollId:string,
}

export const fetchPolls = async () => {
  try {
    const response=await fetch(`${url}/polls`)
    
    if (!response.ok) {
      throw new Error('فشل في تحميل الاستطلاعات')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching polls:', error)
    throw new Error('حدث خطأ في الاتصال بالخادم')
  }
}

export const fetchPollById = async (id: string) => {
  try {
    const response = await fetch(`${url}/polls/${id}`)
    
    if (!response.ok) {
      throw new Error('فشل في تحميل الاستطلاع')
    }
    
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Error fetching poll:', error)
    throw new Error('حدث خطأ في الاتصال بالخادم')
  }
}

export const createPoll = async (pollData: Omit<Poll, 'id'>): Promise<Poll> => {
  try {
    // Create a deep copy of the poll data
    const cleanedPollData = JSON.parse(JSON.stringify(pollData));
    
    // Remove IDs from questions and answers to let the database generate them
    if (cleanedPollData.questions) {
      cleanedPollData.questions = cleanedPollData.questions.map((question: Question) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...questionWithoutId } = question;
        
        if (questionWithoutId.answers) {
          const answers = questionWithoutId.answers.map((answer: Answer) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...answerWithoutId } = answer;
            return answerWithoutId;
          });
          questionWithoutId.answers = answers;
        }
        
        return questionWithoutId;
      });
    }
    
    const response = await fetch(`${url}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       
      },
      body: JSON.stringify(cleanedPollData)
    })
    
    if (!response.ok) {
      throw new Error('فشل في إنشاء الاستطلاع')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating poll:', error)
    throw new Error('حدث خطأ في الاتصال بالخادم')
  }
}

export const deletePoll = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${url}/polls/${id}`, {
      method: 'DELETE',
    
    })
    
    if (!response.ok) {
      throw new Error('فشل في حذف الاستطلاع')
    }
  } catch (error) {
    console.error('Error deleting poll:', error)
    throw new Error('حدث خطأ في الاتصال بالخادم')
  }
}

export const updatePoll = async (id: string, pollData: Partial<Poll>): Promise<Poll> => {
  try {
    // Create a deep copy of the poll data
    const cleanedPollData = JSON.parse(JSON.stringify(pollData));
    
    // For new questions (those without IDs), remove their IDs and their answers' IDs
    if (cleanedPollData.questions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cleanedPollData.questions = cleanedPollData.questions.map((question: any) => {
        // If this is a new question (id is a temporary client-side ID like 0, 1, 2)
        if (typeof question._id === 'number' || !question._id) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...questionWithoutId } = question;
          
          if (questionWithoutId.answers) {
            const answers = questionWithoutId.answers.map((answer: Answer) => {
              // If this is a new answer
              if (typeof answer._id === 'number' || !answer._id) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id, ...answerWithoutId } = answer;
                return answerWithoutId;
              }
              return answer;
            });
            questionWithoutId.answers = answers;
          }
          
          return questionWithoutId;
        }
        
        // For existing questions, keep their IDs but check for new answers
        if (question.answers) {
          const answers = question.answers.map((answer: Answer) => {
            // If this is a new answer
            if (typeof answer._id === 'number' || !answer._id) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { _id, ...answerWithoutId } = answer;
              return answerWithoutId;
            }
            return answer;
          });
          question.answers = answers;
        }
        
        return question;
      });
    }
    
    const response = await fetch(`${url}/polls/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedPollData)
    })
    
    if (!response.ok) {
      throw new Error('فشل في تحديث الاستطلاع')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating poll:', error)
    throw new Error('حدث خطأ في الاتصال بالخادم')
  }
}
export const clientPool = async (clientData: ClientPoll): Promise<{ success: boolean; message: string; data?: ClientPoll }> => {
  try {
    const response = await fetch(`${url}/polls/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إرسال بيانات المستخدم');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting client poll data:', error);
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
}
export const fetchSolvePolls = async (pollId: string) => {
  try {
    const response = await fetch(`${url}/polls/responses/${pollId}`)
    
    if (!response.ok) {
      throw new Error('فشل في تحميل الاستطلاعات')
    }
    
    const data = await response.json()
    console.log("solv",data)
    return data
  } catch (error) {
    console.error('Error fetching polls:', error)
    throw new Error('حدث خطأ في الاتصال بالخادم')
  }
}