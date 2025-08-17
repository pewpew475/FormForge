import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LayersIcon, PenToolIcon, BookOpenIcon } from "lucide-react";
import type { Question } from "@shared/schema";

interface QuestionTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: Question["type"]) => void;
  title?: string;
  description?: string;
}

export function QuestionTypeSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  title = "Select Question Type",
  description = "Choose the type of question you want to create"
}: QuestionTypeSelectorProps) {
  const questionTypes = [
    {
      type: "categorize" as const,
      title: "Categorize",
      description: "Drag items into categories",
      icon: LayersIcon,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
    },
    {
      type: "cloze" as const,
      title: "Cloze",
      description: "Fill in the blanks",
      icon: PenToolIcon,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
    },
    {
      type: "comprehension" as const,
      title: "Comprehension",
      description: "Reading comprehension questions",
      icon: BookOpenIcon,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      hoverColor: "hover:bg-purple-100",
    },
  ];

  const handleSelect = (type: Question["type"]) => {
    onSelect(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">{description}</p>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          {questionTypes.map((questionType) => {
            const Icon = questionType.icon;
            return (
              <button
                key={questionType.type}
                onClick={() => handleSelect(questionType.type)}
                className={`w-full ${questionType.bgColor} ${questionType.borderColor} border-2 rounded-xl p-4 ${questionType.hoverColor} transition-all duration-200 text-left group hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg`}
                data-testid={`select-question-type-${questionType.type}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${questionType.color} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${questionType.textColor} text-lg group-hover:text-opacity-90`}>
                      {questionType.title}
                    </h4>
                    <p className="text-sm text-muted-foreground group-hover:text-opacity-90">
                      {questionType.description}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${questionType.borderColor} bg-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <div className={`w-3 h-3 rounded-full ${questionType.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
