import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, LayersIcon, PenToolIcon, BookOpenIcon } from "lucide-react";
import { CategorizeQuestion } from "./categorize-question";
import { ClozeQuestion } from "./cloze-question";
import { ComprehensionQuestion } from "./comprehension-question";
import { FileUpload } from "@/components/ui/file-upload";
import type { Question } from "@shared/schema";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

export function QuestionEditor({ question, index, onUpdate, onDelete }: QuestionEditorProps) {
  const getQuestionIcon = () => {
    switch (question.type) {
      case "categorize":
        return <LayersIcon className="w-5 h-5 text-blue-600" />;
      case "cloze":
        return <PenToolIcon className="w-5 h-5 text-green-600" />;
      case "comprehension":
        return <BookOpenIcon className="w-5 h-5 text-purple-600" />;
    }
  };

  const getQuestionColor = () => {
    switch (question.type) {
      case "categorize":
        return "bg-blue-100";
      case "cloze":
        return "bg-green-100";
      case "comprehension":
        return "bg-purple-100";
    }
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case "categorize":
        return <CategorizeQuestion question={question} onUpdate={onUpdate} />;
      case "cloze":
        return <ClozeQuestion question={question} onUpdate={onUpdate} />;
      case "comprehension":
        return <ComprehensionQuestion question={question} onUpdate={onUpdate} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid={`question-editor-${question.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${getQuestionColor()} rounded-lg flex items-center justify-center`}>
            {getQuestionIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              Question {index + 1} - {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
            </h3>
            <p className="text-sm text-slate-600">
              {question.type === "categorize" && "Drag and drop question"}
              {question.type === "cloze" && "Fill in the blanks"}
              {question.type === "comprehension" && "Reading comprehension"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-slate-600"
            data-testid={`button-edit-question-${question.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-red-500"
            onClick={onDelete}
            data-testid={`button-delete-question-${question.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          value={question.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter your question here..."
          className="text-lg font-medium border-none outline-none bg-transparent text-slate-800 px-0"
          data-testid={`input-question-title-${question.id}`}
        />
      </div>

      {/* Image Upload for Question */}
      <div className="mb-6">
        <FileUpload
          onUpload={(url) => onUpdate({ image: url })}
          currentImage={question.image}
          onRemove={() => onUpdate({ image: undefined })}
          className="h-24"
        />
      </div>

      {/* Question-specific content */}
      {renderQuestionContent()}
    </div>
  );
}
