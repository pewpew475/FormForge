import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h4 className="font-semibold text-foreground mb-4 flex items-center">
          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
          Items to categorize
        </h4>
        <div className="space-y-3 min-h-40 border-2 border-dashed border-border rounded-xl p-6 bg-muted/30">
          {availableItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white border border-border rounded-lg p-4 shadow-soft transition-all duration-200 ${
                disabled ? "cursor-default" : "cursor-move hover:shadow-medium hover:scale-[1.02]"
              }`}
              data-testid={`item-${index}`}
            >
              <span className="text-foreground font-medium">{item}</span>
            </div>
          ))}
          {availableItems.length === 0 && (
            <div className="text-muted-foreground text-center py-8 flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <span className="font-medium">All items categorized</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-4 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Categories
        </h4>
        <div className="space-y-4">
          {question.categories?.map((categoryName, categoryIndex) => (
            <div
              key={categoryIndex}
              className="border-2 border-dashed border-border rounded-xl p-6 min-h-24 bg-muted/30"
              data-testid={`category-${categoryIndex}`}
            >
              <div className="font-semibold text-foreground mb-3 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                {categoryName}
              </div>
              <div className="space-y-2">
                {categories[categoryName]?.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`bg-green-50 border border-green-200 rounded-lg p-3 text-sm transition-all duration-200 shadow-soft ${
                      disabled ? "cursor-default" : "cursor-pointer hover:bg-green-100 hover:shadow-medium"
                    }`}
                    onClick={() => moveItemToAvailable(item)}
                    data-testid={`categorized-item-${categoryIndex}-${itemIndex}`}
                  >
                    <span className="text-green-800 font-medium">{item}</span>
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
