"use client"

import React from 'react';

interface MathExpressionProps {
  expression: string;
}

export function MathExpression({ expression }: MathExpressionProps) {
  // Function to parse and format mathematical expressions
  const formatExpression = (expr: string) => {
    // Replace multiplication symbol
    let formatted = expr.replace(/\*/g, '×');
    
    // Replace division symbol
    formatted = formatted.replace(/\//g, '÷');
    
    // Handle parentheses with better spacing
    formatted = formatted.replace(/\(/g, ' (');
    formatted = formatted.replace(/\)/g, ') ');
    
    // Handle exponents (e.g., ^2 becomes ²)
    formatted = formatted.replace(/\^2/g, '²');
    formatted = formatted.replace(/\^3/g, '³');
    
    return formatted;
  };

  return (
    <div className="math-expression bg-blue-50 px-4 py-2 rounded-md inline-block font-mono text-lg font-medium">
      {formatExpression(expression)}
    </div>
  );
}
