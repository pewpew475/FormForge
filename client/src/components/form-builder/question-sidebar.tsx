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
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      type: "cloze" as const,
      title: "Cloze",
      description: "Fill in the blanks",
      icon: PenToolIcon,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      type: "comprehension" as const,
      title: "Comprehension",
      description: "Reading comprehension questions",
      icon: BookOpenIcon,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  return (
    <div className="p-6 flex-1">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Question Types</h3>
          <p className="text-sm text-muted-foreground">Add questions to your form</p>
        </div>
      </div>

      <div className="space-y-4">
        {questionTypes.map((questionType) => {
          const Icon = questionType.icon;
          return (
            <button
              key={questionType.type}
              onClick={() => onAddQuestion(questionType.type)}
              className={`w-full ${questionType.bgColor} border border-border rounded-xl p-4 hover:shadow-medium transition-all duration-200 text-left group hover:scale-[1.02] active:scale-[0.98]`}
              data-testid={`button-add-${questionType.type}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${questionType.color} rounded-xl flex items-center justify-center shadow-soft transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${questionType.textColor} group-hover:text-opacity-80`}>{questionType.title}</h4>
                  <p className="text-sm text-muted-foreground group-hover:text-opacity-80">{questionType.description}</p>
                </div>
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
