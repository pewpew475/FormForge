import { Button } from "@/components/ui/button";
import { LayersIcon, PenToolIcon, BookOpenIcon } from "lucide-react";
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
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Question Types</h3>
      <div className="space-y-3">
        {questionTypes.map((questionType) => {
          const Icon = questionType.icon;
          return (
            <button
              key={questionType.type}
              onClick={() => onAddQuestion(questionType.type)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors text-left"
              data-testid={`button-add-${questionType.type}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  questionType.color === "blue" ? "bg-blue-100" :
                  questionType.color === "green" ? "bg-green-100" : "bg-purple-100"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    questionType.color === "blue" ? "text-blue-600" :
                    questionType.color === "green" ? "text-green-600" : "text-purple-600"
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{questionType.title}</h4>
                  <p className="text-sm text-slate-600">{questionType.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
