'use client';

import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Award, Save, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Question } from '@/lib/services/poll';

type QuestionFormProps = {
  onSubmitAction: (data: Question) => Promise<void>;
  initialData: Question;
  onCancelAction: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
};

export default function QuestionForm({ onSubmitAction, initialData, onCancelAction, isLoading = false, isCreating = false }: QuestionFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Question>({
    defaultValues: initialData,
  });

  // Field array for answers
  const { fields: answerFields, append: appendAnswer, remove: removeAnswer } = useFieldArray({
    control,
    name: 'answers',
  });

  const onFormSubmit: SubmitHandler<Question> = async (data) => {
    try {
      setSubmitting(true);
      await onSubmitAction(data);
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6" dir="rtl">
      <Card className="border shadow-md overflow-hidden rounded-xl">
        <CardHeader className="bg-gradient-to-r from-[#009688] to-[#1e1e2d] text-white p-6">
          <CardTitle className="text-2xl font-bold">
            {isCreating ? 'إضافة سؤال جديد' : 'تعديل السؤال'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <Label htmlFor="text" className="text-lg font-medium flex items-center gap-2 text-[#1e1e2d]">
              <div className="bg-[#009688] text-white p-1 rounded-md">
                <HelpCircle className="h-5 w-5" />
              </div>
              نص السؤال
            </Label>
            <Input
              id="text"
              {...register('text', { required: 'نص السؤال مطلوب' })}
              placeholder="أدخل نص السؤال"
              className="w-full border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md"
            />
            {errors.text && (
              <p className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-md flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {errors.text.message}
              </p>
            )}
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
              <Label className="font-medium flex items-center gap-2 text-[#1e1e2d]">
                <div className="bg-[#1e1e2d] text-white p-1 rounded-full">
                  <Award className="h-4 w-4" />
                </div>
                الإجابات ({answerFields.length})
              </Label>
              <Button
                type="button"
                onClick={() => appendAnswer({ text: '', points: 0 })}
                className="px-4 py-1 bg-[#009688] hover:bg-[#00796b] text-white rounded-lg transition-all shadow-sm hover:shadow-md text-sm flex items-center gap-1"
              >
                إضافة إجابة
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3 mt-3 bg-gray-50 p-4 rounded-lg">
              {answerFields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="flex gap-3 items-center bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <div className="bg-[#1e1e2d] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      {...register(`answers.${index}.text` as const, {
                        required: 'نص الإجابة مطلوب',
                      })}
                      placeholder="نص الإجابة"
                      className="flex-1 border border-gray-200 focus:border-[#009688] transition-all rounded-lg"
                    />
                  </div>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      {...register(`answers.${index}.points` as const, {
                        required: 'النقاط مطلوبة',
                        valueAsNumber: true,
                      })}
                      placeholder="النقاط"
                      className="w-full border border-gray-200 focus:border-[#009688] transition-all rounded-lg text-center"
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">نقاط</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeAnswer(index)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg transition-all"
                    aria-label="حذف الإجابة"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-200 flex justify-between">
          <Button 
            type="button" 
            onClick={onCancelAction}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
          >
            إلغاء
          </Button>
          <Button 
            type="submit" 
            className="px-6 py-2 bg-gradient-to-r from-[#009688] to-[#00796b] hover:from-[#00796b] hover:to-[#005a4f] text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            disabled={isLoading || submitting}
          >
            <Save className="h-5 w-5" />
            {submitting ? 'جاري الحفظ...' : isCreating ? 'إضافة السؤال' : 'حفظ التغييرات'}
            {!submitting && <CheckCircle2 className="h-5 w-5 ml-1" />}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
