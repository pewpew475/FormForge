import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { ComprehensionQuestion } from "@shared/schema";

interface ComprehensionResponseProps {
  question: ComprehensionQuestion;
  value?: Record<string, number>;
  onChange?: (response: Record<string, number>) => void;
  disabled?: boolean;
}

export function ComprehensionResponse({ question, value, onChange, disabled = false }: ComprehensionResponseProps) {
  const [responses, setResponses] = useState<Record<string, number>>(value || {});

  useEffect(() => {
    if (!disabled && onChange) {
      onChange(responses);
    }
  }, [responses, onChange, disabled]);

  const updateResponse = (subQuestionId: string, optionIndex: number) => {
    if (disabled) return;
    
    setResponses(prev => ({
      ...prev,
      [subQuestionId]: optionIndex,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Passage */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
          {question.passage}
        </div>
      </div>

      {/* Sub-questions */}
      <div className="space-y-6">
        {question.subQuestions?.map((subQuestion, subIndex) => (
          <div key={subQuestion.id} className="space-y-3" data-testid={`sub-question-${subIndex}`}>
            <h4 className="font-medium text-slate-700 text-lg">
              {subIndex + 1}. {subQuestion.question}
            </h4>
            
            <RadioGroup
              value={responses[subQuestion.id]?.toString() || ""}
              onValueChange={(value) => updateResponse(subQuestion.id, parseInt(value))}
              disabled={disabled}
              className="space-y-2"
            >
              {subQuestion.options?.map((option, optionIndex) => (
                <div 
                  key={optionIndex} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RadioGroupItem 
                    value={optionIndex.toString()} 
                    id={`${subQuestion.id}_${optionIndex}`}
                    className="text-primary"
                    data-testid={`radio-${subIndex}-${optionIndex}`}
                  />
                  <Label 
                    htmlFor={`${subQuestion.id}_${optionIndex}`}
                    className="flex-1 cursor-pointer text-slate-700"
                    data-testid={`label-${subIndex}-${optionIndex}`}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
