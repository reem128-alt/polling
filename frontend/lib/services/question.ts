const url=process.env.NEXT_PUBLIC_API_URL
import { Question } from "./poll";


export const updateQuestion = async (id: string, questionData: Partial<Question>): Promise<Question> => {
  try {
   
    
    // Create a deep copy of the question data to avoid modifying the original
    const cleanedQuestionData = JSON.parse(JSON.stringify(questionData));
    
    // Handle answers IDs for new answers
    if (cleanedQuestionData.answers) {
      cleanedQuestionData.answers = cleanedQuestionData.answers.map((answer: any) => {
        // If this is a new answer (id is a temporary client-side ID like 0, 1, 2)
        if (typeof answer._id === 'number' || !answer._id) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...answerWithoutId } = answer;
          return answerWithoutId;
        }
        return answer;
      });
    }
    
    console.log('Sending data to server:', JSON.stringify(cleanedQuestionData));
    
    const response = await fetch(`${url}/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedQuestionData)
    });
    
    // Debug: Log the response status
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('فشل في تحديث السؤال');
    }
    
    const data = await response.json();
    return data.question || data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// Create a new question
export const createQuestion = async (questionData: Partial<Question>): Promise<Question> => {
  try {
    // Create a deep copy of the question data to avoid modifying the original
    const cleanedQuestionData = JSON.parse(JSON.stringify(questionData));
    
    // Handle answers - completely remove all _id fields to prevent MongoDB validation errors
    if (cleanedQuestionData.answers && Array.isArray(cleanedQuestionData.answers)) {
      cleanedQuestionData.answers = cleanedQuestionData.answers.map((answer: any) => {
        // Remove _id field completely for all answers
        // This ensures MongoDB will generate proper ObjectIds
        const { _id, ...answerWithoutId } = answer;
        
        // Log the cleaned answer for debugging
        console.log('Cleaned answer:', answerWithoutId);
        
        return answerWithoutId;
      });
    }
    
    console.log('Sending data to server for new question:', JSON.stringify(cleanedQuestionData));
    
    const response = await fetch(`${url}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedQuestionData)
    });
    
    // Debug: Log the response status
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('فشل في إنشاء السؤال');
    }
    
    const data = await response.json();
    return data.question || data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// Delete a question
export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${url}/questions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('فشل في حذف السؤال');
    }
  } catch (error) {
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};
