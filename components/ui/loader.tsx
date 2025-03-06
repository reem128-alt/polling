import React from "react";

interface LoaderProps {
  text?: string;
}

export function Loader({ text = "جاري التحميل..." }: LoaderProps) {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
      <div className="relative">
        {/* Outer circle */}
        <div className="w-16 h-16 rounded-full border-4 border-t-[#009688] border-r-[#009688] border-b-transparent border-l-transparent animate-spin"></div>
        
        {/* Inner circle */}
        <div className="absolute top-2 left-2 w-12 h-12 rounded-full border-4 border-t-transparent border-r-transparent border-b-[#1e1e2d] border-l-[#1e1e2d] animate-spin animation-delay-150"></div>
      </div>
      
      {/* Text */}
      <div className="mt-6 text-lg font-medium text-[#1e1e2d] text-center" dir="rtl">
        {text}
      </div>
      
      {/* Animated dots */}
      <div className="flex mt-2 space-x-1 space-x-reverse" dir="rtl">
        <div className="w-2 h-2 bg-[#009688] rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-[#009688] rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-[#009688] rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
}
