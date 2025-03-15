'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import QuestionForm from '@/components/questionForm';
import { updateQuestion } from '@/lib/services/question';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/services/question';

type QuestionEditButtonProps = {
  pollId: number;
  question: Question;
  onSuccess?: () => void;
};

export default function QuestionEditButton({ pollId, question, onSuccess }: QuestionEditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: Question) => {
    try {
      setIsLoading(true);
      await updateQuestion(pollId, question.id, data);
      setIsModalOpen(false);
      
      // Refresh the page or call the success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="text-blue-500 hover:bg-blue-50 h-9 w-9 p-0 rounded-full transition-all"
      >
        <Edit className="h-5 w-5" />
      </Button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <QuestionForm
          initialData={question}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </>
  );
}
