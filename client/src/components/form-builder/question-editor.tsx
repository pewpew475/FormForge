import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, LayersIcon, PenToolIcon, BookOpenIcon, ChevronDown, ChevronUp } from "lucide-react";
import { CategorizeQuestion } from "./categorize-question";
import { ClozeQuestion } from "./cloze-question";
import { ComprehensionQuestion } from "./comprehension-question";
import { QuestionTypeSelector } from "./question-type-selector";
import { FileUpload } from "@/components/ui/file-upload";
import type { Question } from "@shared/schema";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

export function QuestionEditor({ question, index, onUpdate, onDelete }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const getQuestionConfig = () => {
    switch (question.type) {
      case "categorize":
        return {
          gradient: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          icon: <LayersIcon className="w-5 h-5 text-white" />,
          description: "Drag and drop question"
        };
      case "cloze":
        return {
          gradient: "from-green-500 to-green-600",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          icon: <PenToolIcon className="w-5 h-5 text-white" />,
          description: "Fill in the blanks"
        };
      case "comprehension":
        return {
          gradient: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
          icon: <BookOpenIcon className="w-5 h-5 text-white" />,
          description: "Reading comprehension"
        };
      default:
        return {
          gradient: "from-slate-500 to-slate-600",
          bgColor: "bg-slate-50",
          textColor: "text-slate-700",
          icon: <LayersIcon className="w-5 h-5 text-white" />,
          description: "Question"
        };
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

  const config = getQuestionConfig();

  return (
    <div className="bg-white rounded-2xl shadow-medium border border-border p-6 animate-slide-up" data-testid={`question-editor-${question.id}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-soft`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              Question {index + 1}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm font-medium ${config.textColor}`}>
                {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
              </span>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-sm text-muted-foreground">
                {config.description}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`button-toggle-question-${question.id}`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowTypeSelector(true)}
            data-testid={`button-edit-question-${question.id}`}
            title="Change question type"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            data-testid={`button-delete-question-${question.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collapsed view - just show the question title */}
      {!isExpanded && (
        <div className="py-2">
          <p className="text-lg font-medium text-slate-800 truncate">
            {question.title || "Untitled Question"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Click edit to modify this question
          </p>
        </div>
      )}

      {/* Expanded view - full editor */}
      {isExpanded && (
        <>
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
        </>
      )}

      {/* Question Type Selector Modal */}
      <QuestionTypeSelector
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={(newType: Question["type"]) => {
          // When changing question type, reset question-specific data but keep title and image
          const baseQuestion = {
            title: question.title,
            image: question.image,
            type: newType,
          };

          // Reset type-specific properties
          switch (newType) {
            case "categorize":
              onUpdate({
                ...baseQuestion,
                items: [],
                categories: [],
                text: undefined,
                blanks: undefined,
                passage: undefined,
                questions: undefined,
              });
              break;
            case "cloze":
              onUpdate({
                ...baseQuestion,
                text: "",
                blanks: [],
                items: undefined,
                categories: undefined,
                passage: undefined,
                questions: undefined,
              });
              break;
            case "comprehension":
              onUpdate({
                ...baseQuestion,
                passage: "",
                questions: [],
                items: undefined,
                categories: undefined,
                text: undefined,
                blanks: undefined,
              });
              break;
          }
        }}
        title="Change Question Type"
        description="Select a new type for this question. Note: This will reset question-specific content."
      />
    </div>
  );
}
