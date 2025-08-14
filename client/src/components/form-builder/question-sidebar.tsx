import { Button } from "@/components/ui/button";
import { LayersIcon, PenToolIcon, BookOpenIcon, Plus } from "lucide-react";
import type { Question } from "@shared/schema";

interface QuestionSidebarProps {
  onAddQuestion: (type: Question["type"]) => void;
}

export function QuestionSidebar({ onAddQuestion }: QuestionSidebarProps) {
  const questionTypes = [
    {
      type: "categorize" as const,
      title: "Categorize",
      description: "Drag items into categories",
      icon: LayersIcon,
      color: "blue",
    },
    {
      type: "cloze" as const,
      title: "Cloze",
      description: "Fill in the blanks",
      icon: PenToolIcon,
      color: "green",
    },
    {
      type: "comprehension" as const,
      title: "Comprehension",
      description: "Reading comprehension questions",
      icon: BookOpenIcon,
      color: "purple",
    },
  ];

  return (
    <div className="p-6 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Question Types</h3>
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-6">Click to add questions to your form</p>
      <div className="space-y-3">
        {questionTypes.map((questionType) => {
          const Icon = questionType.icon;
          return (
            <button
              key={questionType.type}
              onClick={() => onAddQuestion(questionType.type)}
              className="w-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:from-slate-100 hover:to-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 text-left group"
              data-testid={`button-add-${questionType.type}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  questionType.color === "blue" ? "bg-blue-100 group-hover:bg-blue-200" :
                  questionType.color === "green" ? "bg-green-100 group-hover:bg-green-200" : "bg-purple-100 group-hover:bg-purple-200"
                }`}>
                  <Icon className={`w-6 h-6 ${
                    questionType.color === "blue" ? "text-blue-600" :
                    questionType.color === "green" ? "text-green-600" : "text-purple-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 group-hover:text-slate-900">{questionType.title}</h4>
                  <p className="text-sm text-slate-600 group-hover:text-slate-700">{questionType.description}</p>
                </div>
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Quick Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag questions to reorder them</li>
          <li>• Use settings to configure form details</li>
          <li>• Preview your form before publishing</li>
        </ul>
      </div>
    </div>
  );
}
