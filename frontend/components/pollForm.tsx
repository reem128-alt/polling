'use client';

import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Poll } from '@/lib/services/poll';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {  FileText, HelpCircle, Award, Save, PenSquare, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Link from 'next/link';

type PollFormProps = {
  onSubmitAction: (data: Omit<Poll, 'id'>) => void;
  initialData?: Omit<Poll, 'id'>;
  isLoading?: boolean;
  pollId?: string;
};

// Define a type that matches the structure of our form data
type PollFormData = {
  title: string;
  description: string;
  questions: {
    id: number;
    text: string;
    answers: {
      id?: number;
      text: string;
      points: number;
    }[];
  }[];
};

export default function PollForm({ onSubmitAction, initialData, isLoading = false, pollId }: PollFormProps) {
  const defaultValues: PollFormData = initialData || {
    title: '',
    description: '',
    questions: [
      {
        id: 0,
        text: '',
        answers: [
          { id: 0, text: '', points: 0 },
          { id: 1, text: '', points: 0 },
        ],
      },
    ],
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    
  
  } = useForm<PollFormData>({
    defaultValues,
  });

  // Main questions field array
  const { fields: questionFields, append: appendQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  // This is a workaround to avoid using useFieldArray inside the map function
  // We'll use a simple state to track the number of answers for each question
  const [answersCount, setAnswersCount] = useState<Record<number, number>>(
    questionFields.reduce((acc, field, index) => {
      acc[index] = defaultValues.questions[index]?.answers.length || 2;
      return acc;
    }, {} as Record<number, number>)
  );

  const onFormSubmit: SubmitHandler<PollFormData> = (data) => {
    // Convert PollFormData to Omit<Poll, 'id'> if needed
    onSubmitAction(data as unknown as Omit<Poll, 'id'>);
  };

 
  // Remove an answer from a specific question
 
  // Add a new answer to a specific question
  const addAnswer = (questionIndex: number) => {
    setAnswersCount((prev) => ({
      ...prev,
      [questionIndex]: (prev[questionIndex] || 2) + 1,
    }));
  };

  const handleUpdate = () => {
    handleSubmit(onFormSubmit)();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8" dir="rtl">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#009688]/10 to-[#1e1e2d]/10 rounded-3xl transform -rotate-1 scale-[1.03] blur-sm"></div>
        <Card className="border-none shadow-xl overflow-hidden rounded-2xl relative z-10 backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-[#009688] to-[#1e1e2d] text-white p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-tr-full"></div>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              {initialData ? (
                <>
                  <PenSquare className="h-8 w-8" />
                  تعديل الاستطلاع
                </>
              ) : (
                <>
                  <FileText className="h-8 w-8" />
                  إنشاء استطلاع جديد
                </>
              )}
            </CardTitle>
            <p className="text-white/80 mt-2 text-lg">
              {initialData 
                ? 'قم بتعديل تفاصيل الاستطلاع والأسئلة والإجابات المتاحة' 
                : 'قم بإنشاء استطلاع جديد وإضافة الأسئلة والإجابات المتاحة'}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                <Label htmlFor="title" className="text-lg font-medium flex items-center gap-2 text-[#1e1e2d]">
                  <div className="bg-[#009688] text-white p-1 rounded-md">
                    <FileText className="h-5 w-5" />
                  </div>
                  عنوان الاستطلاع
                </Label>
                <Input
                  id="title"
                  {...register('title', { required: 'عنوان الاستطلاع مطلوب' })}
                  placeholder="أدخل عنوان الاستطلاع"
                  className="w-full border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-md flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 transition-all duration-300 hover:shadow-md p-4 rounded-xl border border-transparent hover:border-[#009688]/20">
                <Label htmlFor="description" className="text-lg font-medium flex items-center gap-2 text-[#1e1e2d]">
                  <div className="bg-[#1e1e2d] text-white p-1 rounded-md">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  وصف الاستطلاع
                </Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'وصف الاستطلاع مطلوب' })}
                  placeholder="أدخل وصف الاستطلاع"
                  className="w-full min-h-[120px] border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md resize-none"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-md flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-[#1e1e2d] flex items-center gap-2">
                  <div className="bg-[#009688] text-white p-1.5 rounded-full">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  الأسئلة ({questionFields.length})
                </h3>
                {pollId && (
                  <Link 
                    href={`/dashboard/questions?pollId=${pollId}`}
                    className="bg-[#009688] hover:bg-[#00796b] text-white text-sm py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1"
                  >
                    <PenSquare className="h-4 w-4" /> تعديل الأسئلة
                  </Link>
                )}
              </div>

              <div className="space-y-6">
                {questionFields.map((field, questionIndex) => {
                  return (
                    <Card 
                      key={field.id} 
                      className="border border-gray-200 shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#009688]/30"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
                        <Label htmlFor={`questions.${questionIndex}.text`} className="font-bold text-lg flex items-center gap-3">
                          <span className="bg-[#009688] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                            {questionIndex + 1}
                          </span>
                          <span className="text-[#1e1e2d]">السؤال {questionIndex + 1}</span>
                        </Label>
                      </div>

                      <div className="p-5 bg-white">
                        <div className="relative">
                          <Input
                            id={`questions.${questionIndex}.text`}
                            {...register(`questions.${questionIndex}.text` as const, {
                              required: 'نص السؤال مطلوب',
                            })}
                            placeholder="أدخل نص السؤال"
                            className="w-full border-2 focus:border-[#009688] transition-all p-3 rounded-lg shadow-sm focus:shadow-md pr-10"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <HelpCircle className="h-5 w-5" />
                          </div>
                        </div>
                        {errors.questions?.[questionIndex]?.text && (
                          <p className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-md flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {errors.questions[questionIndex]?.text?.message}
                          </p>
                        )}

                        <div className="space-y-4 mt-6">
                          <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                            <Label className="font-medium flex items-center gap-2 text-[#1e1e2d]">
                              <div className="bg-[#1e1e2d] text-white p-1 rounded-full">
                                <Award className="h-4 w-4" />
                              </div>
                              الإجابات ({answersCount[questionIndex] || 2})
                            </Label>
                            {!initialData && (
                              <Button 
                                type="button" 
                                onClick={() => addAnswer(questionIndex)}
                                className="bg-[#009688] hover:bg-[#00796b] text-white text-sm py-1 px-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1"
                              >
                                <span className="text-white">+</span> اضف جواب
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3 mt-3 bg-gray-50 p-4 rounded-lg">
                            {Array.from({ length: answersCount[questionIndex] || 2 }).map((_, answerIndex) => (
                              <div 
                                key={`question-${questionIndex}-answer-${answerIndex}`} 
                                className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                              >
                                <div className="bg-[#1e1e2d] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                  {answerIndex + 1}
                                </div>
                                <div className="w-full sm:flex-1 relative">
                                  <Input
                                    {...register(`questions.${questionIndex}.answers.${answerIndex}.text` as const, {
                                      required: 'نص الإجابة مطلوب',
                                    })}
                                    placeholder="نص الإجابة"
                                    className="w-full border border-gray-200 focus:border-[#009688] transition-all rounded-lg"
                                  />
                                </div>
                                <div className="relative w-full sm:w-24 mt-2 sm:mt-0">
                                  <Input
                                    type="number"
                                    {...register(`questions.${questionIndex}.answers.${answerIndex}.points` as const, {
                                      required: 'النقاط مطلوبة',
                                      valueAsNumber: true,
                                    })}
                                    placeholder="النقاط"
                                    className="w-full border border-gray-200 focus:border-[#009688] transition-all rounded-lg text-center"
                                  />
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">نقاط</span>
                                </div>
                              
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-t border-gray-200">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#009688] to-[#00796b] hover:from-[#00796b] hover:to-[#005a4f] text-white text-lg py-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              disabled={isLoading}
              onClick={initialData ? handleUpdate : undefined}
            >
              <Save className="h-5 w-5" />
              {isLoading ? 'جاري الحفظ...' : initialData ? 'تحديث الاستطلاع' : 'حفظ الاستطلاع'}
              {!isLoading && <CheckCircle2 className="h-5 w-5 ml-1" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}