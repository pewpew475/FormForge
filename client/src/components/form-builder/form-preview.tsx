import { Button } from "@/components/ui/button";
import { X, Link as LinkIcon, Eye } from "lucide-react";
import { CategorizeResponse } from "../form-fill/categorize-response";
import { ClozeResponse } from "../form-fill/cloze-response";
import { ComprehensionResponse } from "../form-fill/comprehension-response";
import { useToast } from "@/hooks/use-toast";
import type { Form } from "@shared/schema";

interface FormPreviewProps {
  form: Partial<Form>;
  onClose: () => void;
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  const { toast } = useToast();

  const copyFormLink = () => {
    const formId = form.id || "preview";
    const formUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(formUrl).then(() => {
      toast({
        title: "Link copied",
        description: "Form link copied to clipboard",
      });
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-screen overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Form Preview</h3>
              <p className="text-sm text-muted-foreground">See how your form appears to respondents</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={copyFormLink}
              size="sm"
              data-testid="button-copy-form-link"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-close-preview"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form Preview Content */}
        <div className="overflow-y-auto max-h-[80vh] p-8 bg-muted/20">
          {/* Form Header Preview */}
          <div className="text-center mb-12">
            {form.headerImage && (
              <div className="h-40 bg-cover bg-center rounded-2xl mb-8 shadow-medium"
                   style={{ backgroundImage: `url(${form.headerImage})` }}></div>
            )}
            {!form.headerImage && (
              <div className="h-40 gradient-primary rounded-2xl mb-8 shadow-medium"></div>
            )}
            <h1 className="text-3xl font-bold text-foreground mb-4 text-balance" data-testid="text-preview-title">
              {form.title || "Untitled Form"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance" data-testid="text-preview-description">
              {form.description || "This is a preview of how your form will appear to respondents."}
            </p>
          </div>

          {/* Preview Questions */}
          <div className="space-y-8 max-w-3xl mx-auto">
            {form.questions?.map((question, index) => (
              <div key={question.id} className="bg-white border border-border rounded-2xl p-8 shadow-medium">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground flex-1 text-balance" data-testid={`text-preview-question-${index}`}>
                    {question.title}
                  </h3>
                </div>
                
                {question.image && (
                  <div className="mb-6">
                    <img
                      src={question.image}
                      alt="Question image"
                      className="max-w-full h-auto rounded-xl shadow-medium"
                    />
                  </div>
                )}

                {question.type === "categorize" && (
                  <CategorizeResponse question={question} disabled />
                )}
                {question.type === "cloze" && (
                  <ClozeResponse question={question} disabled />
                )}
                {question.type === "comprehension" && (
                  <ComprehensionResponse question={question} disabled />
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="text-center mt-12">
            <Button
              disabled
              size="lg"
              className="px-12 py-4 text-lg font-semibold opacity-60"
              data-testid="button-preview-submit"
            >
              Submit Form (Preview Mode)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
