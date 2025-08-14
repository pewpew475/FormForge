import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClozeQuestion } from "@shared/schema";

interface ClozeResponseProps {
  question: ClozeQuestion;
  value?: Record<string, string>;
  onChange?: (response: Record<string, string>) => void;
  disabled?: boolean;
}

export function ClozeResponse({ question, value, onChange, disabled = false }: ClozeResponseProps) {
  const [responses, setResponses] = useState<Record<string, string>>(value || {});

  useEffect(() => {
    if (!disabled && onChange) {
      onChange(responses);
    }
  }, [responses, onChange, disabled]);

  const updateResponse = (blankId: string, answer: string) => {
    if (disabled) return;
    
    setResponses(prev => ({
      ...prev,
      [blankId]: answer,
    }));
  };

  const renderClozeText = () => {
    let text = question.text || "";
    
    // Replace blank patterns with select dropdowns
    question.blanks?.forEach(blank => {
      const pattern = `[${blank.id}]`;
      const selectElement = (
        <Select
          key={blank.id}
          value={responses[blank.id] || ""}
          onValueChange={(value) => updateResponse(blank.id, value)}
          disabled={disabled}
        >
          <SelectTrigger className="inline-flex w-auto min-w-32 mx-1">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option, index) => (
              <SelectItem key={index} value={option} data-testid={`option-${blank.id}-${index}`}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
      // For rendering purposes, we'll create a simplified version
      text = text.replace(pattern, `___SELECT_${blank.id}___`);
    });

    // Split text and render with selects
    const parts = text.split(/___SELECT_([^_]+)___/);
    const result = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        result.push(parts[i]);
      } else {
        // Blank placeholder - render select
        const blankId = parts[i];
        result.push(
          <Select
            key={blankId}
            value={responses[blankId] || ""}
            onValueChange={(value) => updateResponse(blankId, value)}
            disabled={disabled}
          >
            <SelectTrigger className="inline-flex w-auto min-w-32 mx-1" data-testid={`select-${blankId}`}>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option} data-testid={`option-${blankId}-${index}`}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
    }
    
    return result;
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <div className="text-slate-700 leading-relaxed text-lg">
          {renderClozeText()}
        </div>
      </div>
      
      {!disabled && question.options && question.options.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-4">
          <h5 className="font-medium text-slate-700 mb-3">Available options:</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {question.options.map((option, index) => (
              <div
                key={index}
                className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-center text-sm"
                data-testid={`available-option-${index}`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
