import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { ClozeQuestion } from "@shared/schema";

interface ClozeQuestionProps {
  question: ClozeQuestion;
  onUpdate: (updates: Partial<ClozeQuestion>) => void;
}

export function ClozeQuestion({ question, onUpdate }: ClozeQuestionProps) {
  const addOption = () => {
    const newOption = `Option ${(question.options?.length || 0) + 1}`;
    onUpdate({ options: [...(question.options || []), newOption] });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...(question.options || [])];
    updatedOptions[index] = value;
    onUpdate({ options: updatedOptions });
  };

  const removeOption = (index: number) => {
    const updatedOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate({ options: updatedOptions });
  };

  const createBlank = () => {
    // Simple implementation - in a real app, you'd have text selection
    const blankId = `blank_${Date.now()}`;
    const newBlank = { id: blankId, correctAnswer: "" };
    onUpdate({ 
      blanks: [...(question.blanks || []), newBlank],
      text: (question.text || "") + ` [${blankId}] `
    });
  };

  return (
    <div className="space-y-8">
      {/* Cloze Text Editor */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Cloze Text
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={createBlank}
            data-testid="button-create-blank"
            className="shadow-soft hover:shadow-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Blank
          </Button>
        </div>
        <div className="border border-border rounded-xl p-6 bg-muted/30 shadow-soft">
          <Textarea
            value={question.text || ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter your text here. Use [blank_id] to create blanks..."
            className="min-h-40 border-none bg-transparent p-0 text-base leading-relaxed resize-none focus-visible:ring-0"
            data-testid="textarea-cloze-text"
          />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
            Type your text and use [blank_id] format for blanks
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="border border-slate-200 rounded-lg p-4">
        <h4 className="font-medium text-slate-700 mb-3">Answer Options:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1"
                data-testid={`input-option-${index}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700"
                data-testid={`button-remove-option-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={addOption}
          className="text-primary hover:text-primary/80"
          data-testid="button-add-option"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Option
        </Button>
      </div>

      {/* Blanks Configuration */}
      {question.blanks && question.blanks.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-700 mb-3">Blank Answers:</h4>
          <div className="space-y-2">
            {question.blanks.map((blank, index) => (
              <div key={blank.id} className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 w-20">{blank.id}:</span>
                <Input
                  value={blank.correctAnswer}
                  onChange={(e) => {
                    const updatedBlanks = [...(question.blanks || [])];
                    updatedBlanks[index] = { ...blank, correctAnswer: e.target.value };
                    onUpdate({ blanks: updatedBlanks });
                  }}
                  placeholder="Correct answer"
                  className="flex-1"
                  data-testid={`input-blank-answer-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
