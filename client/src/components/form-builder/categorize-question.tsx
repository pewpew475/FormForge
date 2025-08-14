import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import type { CategorizeQuestion } from "@shared/schema";

interface CategorizeQuestionProps {
  question: CategorizeQuestion;
  onUpdate: (updates: Partial<CategorizeQuestion>) => void;
}

export function CategorizeQuestion({ question, onUpdate }: CategorizeQuestionProps) {
  const addItem = () => {
    const newItem = `Item ${(question.items?.length || 0) + 1}`;
    onUpdate({ items: [...(question.items || []), newItem] });
  };

  const updateItem = (index: number, value: string) => {
    const updatedItems = [...(question.items || [])];
    updatedItems[index] = value;
    onUpdate({ items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = (question.items || []).filter((_, i) => i !== index);
    onUpdate({ items: updatedItems });
  };

  const addCategory = () => {
    const newCategory = `Category ${(question.categories?.length || 0) + 1}`;
    onUpdate({ categories: [...(question.categories || []), newCategory] });
  };

  const updateCategory = (index: number, value: string) => {
    const updatedCategories = [...(question.categories || [])];
    updatedCategories[index] = value;
    onUpdate({ categories: updatedCategories });
  };

  const removeCategory = (index: number) => {
    const updatedCategories = (question.categories || []).filter((_, i) => i !== index);
    onUpdate({ categories: updatedCategories });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-slate-700 mb-3">Items to categorize:</h4>
        <div className="space-y-2">
          {question.items?.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="flex-1"
                data-testid={`input-item-${index}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
                data-testid={`button-remove-item-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="text-primary hover:text-primary/80"
            data-testid="button-add-item"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-slate-700 mb-3">Categories:</h4>
        <div className="space-y-3">
          {question.categories?.map((category, index) => (
            <div key={index} className="border-2 border-dashed border-slate-300 rounded-lg p-4 min-h-20">
              <div className="flex items-center justify-between mb-2">
                <Input
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  className="font-medium border-none p-0 h-auto"
                  data-testid={`input-category-${index}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(index)}
                  className="text-red-500 hover:text-red-700"
                  data-testid={`button-remove-category-${index}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-slate-500">Drop items here</div>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={addCategory}
            className="text-primary hover:text-primary/80"
            data-testid="button-add-category"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        </div>
      </div>
    </div>
  );
}
