import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { ComprehensionQuestion } from "@shared/schema";

interface ComprehensionQuestionProps {
  question: ComprehensionQuestion;
  onUpdate: (updates: Partial<ComprehensionQuestion>) => void;
}

export function ComprehensionQuestion({ question, onUpdate }: ComprehensionQuestionProps) {
  const addSubQuestion = () => {
    const newSubQuestion = {
      id: `sub_${Date.now()}`,
      question: "",
      options: ["Option A", "Option B"],
    };
    onUpdate({ 
      subQuestions: [...(question.subQuestions || []), newSubQuestion] 
    });
  };

  const updateSubQuestion = (index: number, updates: any) => {
    const updatedSubQuestions = [...(question.subQuestions || [])];
    updatedSubQuestions[index] = { ...updatedSubQuestions[index], ...updates };
    onUpdate({ subQuestions: updatedSubQuestions });
  };

  const removeSubQuestion = (index: number) => {
    const updatedSubQuestions = (question.subQuestions || []).filter((_, i) => i !== index);
    onUpdate({ subQuestions: updatedSubQuestions });
  };

  const addOptionToSubQuestion = (subQuestionIndex: number) => {
    const subQuestion = question.subQuestions?.[subQuestionIndex];
    if (subQuestion) {
      const newOption = `Option ${String.fromCharCode(65 + (subQuestion.options?.length || 0))}`;
      updateSubQuestion(subQuestionIndex, {
        options: [...(subQuestion.options || []), newOption]
      });
    }
  };

  const updateOptionInSubQuestion = (subQuestionIndex: number, optionIndex: number, value: string) => {
    const subQuestion = question.subQuestions?.[subQuestionIndex];
    if (subQuestion) {
      const updatedOptions = [...(subQuestion.options || [])];
      updatedOptions[optionIndex] = value;
      updateSubQuestion(subQuestionIndex, { options: updatedOptions });
    }
  };

  const removeOptionFromSubQuestion = (subQuestionIndex: number, optionIndex: number) => {
    const subQuestion = question.subQuestions?.[subQuestionIndex];
    if (subQuestion) {
      const updatedOptions = (subQuestion.options || []).filter((_, i) => i !== optionIndex);
      updateSubQuestion(subQuestionIndex, { options: updatedOptions });
    }
  };

  return (
    <div className="space-y-6">
      {/* Passage */}
      <div>
        <h4 className="font-medium text-slate-700 mb-3">Reading Passage:</h4>
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
          <Textarea
            value={question.passage || ""}
            onChange={(e) => onUpdate({ passage: e.target.value })}
            placeholder="Enter the reading passage here..."
            className="h-40 border-none bg-transparent resize-none p-0"
            data-testid="textarea-passage"
          />
        </div>
      </div>

      {/* Sub-questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-700">Questions based on the passage:</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={addSubQuestion}
            data-testid="button-add-sub-question"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>

        {question.subQuestions?.map((subQuestion, subIndex) => (
          <div key={subQuestion.id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <Input
                value={subQuestion.question}
                onChange={(e) => updateSubQuestion(subIndex, { question: e.target.value })}
                placeholder="Enter question..."
                className="flex-1 font-medium mr-2"
                data-testid={`input-sub-question-${subIndex}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSubQuestion(subIndex)}
                className="text-red-500 hover:text-red-700"
                data-testid={`button-remove-sub-question-${subIndex}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {subQuestion.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={`correct_${subQuestion.id}`}
                    checked={subQuestion.correctAnswer === optionIndex}
                    onChange={() => updateSubQuestion(subIndex, { correctAnswer: optionIndex })}
                    className="text-primary focus:ring-primary"
                    data-testid={`radio-correct-${subIndex}-${optionIndex}`}
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOptionInSubQuestion(subIndex, optionIndex, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    className="flex-1 text-sm"
                    data-testid={`input-option-${subIndex}-${optionIndex}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOptionFromSubQuestion(subIndex, optionIndex)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`button-remove-option-${subIndex}-${optionIndex}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addOptionToSubQuestion(subIndex)}
                className="text-primary hover:text-primary/80"
                data-testid={`button-add-option-${subIndex}`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
