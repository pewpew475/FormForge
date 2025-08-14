import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { CategorizeQuestion } from "@shared/schema";

interface CategorizeResponseProps {
  question: CategorizeQuestion;
  value?: Record<string, string[]>;
  onChange?: (response: Record<string, string[]>) => void;
  disabled?: boolean;
}

export function CategorizeResponse({ question, value, onChange, disabled = false }: CategorizeResponseProps) {
  const [categories, setCategories] = useState<Record<string, string[]>>(() => {
    if (value) return value;
    
    const initialCategories: Record<string, string[]> = {};
    question.categories?.forEach(category => {
      initialCategories[category] = [];
    });
    return initialCategories;
  });

  const [availableItems, setAvailableItems] = useState<string[]>(() => {
    if (value) {
      const usedItems = Object.values(value).flat();
      return (question.items || []).filter(item => !usedItems.includes(item));
    }
    return question.items || [];
  });

  useEffect(() => {
    if (!disabled && onChange) {
      onChange(categories);
    }
  }, [categories, onChange, disabled]);

  const moveItemToCategory = (item: string, categoryName: string) => {
    if (disabled) return;

    // Remove item from current category and available items
    const newCategories = { ...categories };
    Object.keys(newCategories).forEach(cat => {
      newCategories[cat] = newCategories[cat].filter(i => i !== item);
    });
    
    // Add item to new category
    newCategories[categoryName] = [...(newCategories[categoryName] || []), item];
    
    // Update available items
    const newAvailableItems = availableItems.filter(i => i !== item);
    
    setCategories(newCategories);
    setAvailableItems(newAvailableItems);
  };

  const moveItemToAvailable = (item: string) => {
    if (disabled) return;

    // Remove item from all categories
    const newCategories = { ...categories };
    Object.keys(newCategories).forEach(cat => {
      newCategories[cat] = newCategories[cat].filter(i => i !== item);
    });
    
    // Add item back to available
    const newAvailableItems = [...availableItems, item];
    
    setCategories(newCategories);
    setAvailableItems(newAvailableItems);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-slate-700 mb-3">Items to categorize:</h4>
        <div className="space-y-2 min-h-32 border-2 border-dashed border-slate-300 rounded-lg p-4">
          {availableItems.map((item, index) => (
            <div
              key={index}
              className={`bg-blue-50 border border-blue-200 rounded-lg p-3 transition-colors ${
                disabled ? "cursor-default" : "cursor-move hover:bg-blue-100"
              }`}
              data-testid={`item-${index}`}
            >
              {item}
            </div>
          ))}
          {availableItems.length === 0 && (
            <div className="text-slate-500 text-center py-4">All items categorized</div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-slate-700 mb-3">Categories:</h4>
        <div className="space-y-3">
          {question.categories?.map((categoryName, categoryIndex) => (
            <div
              key={categoryIndex}
              className="border-2 border-dashed border-slate-300 rounded-lg p-4 min-h-20 bg-slate-50"
              data-testid={`category-${categoryIndex}`}
            >
              <div className="font-medium text-slate-600 mb-2">{categoryName}</div>
              <div className="space-y-2">
                {categories[categoryName]?.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`bg-green-50 border border-green-200 rounded-lg p-2 text-sm transition-colors ${
                      disabled ? "cursor-default" : "cursor-pointer hover:bg-green-100"
                    }`}
                    onClick={() => moveItemToAvailable(item)}
                    data-testid={`categorized-item-${categoryIndex}-${itemIndex}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {!disabled && (
                <div className="mt-2">
                  {availableItems.map((item, itemIndex) => (
                    <Button
                      key={itemIndex}
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItemToCategory(item, categoryName)}
                      className="text-xs mr-1 mb-1"
                      data-testid={`button-move-${itemIndex}-to-${categoryIndex}`}
                    >
                      + {item}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
