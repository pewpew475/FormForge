import { Button } from "@/components/ui/button";
import { X, Link as LinkIcon } from "lucide-react";
import { CategorizeResponse } from "@/components/form-fill/categorize-response";
import { ClozeResponse } from "@/components/form-fill/cloze-response";
import { ComprehensionResponse } from "@/components/form-fill/comprehension-response";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 text-slate-600">👁</div>
            <h3 className="text-lg font-semibold text-slate-800">Form Preview</h3>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={copyFormLink}
              className="bg-primary text-white hover:bg-primary/90 text-sm"
              data-testid="button-copy-form-link"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              data-testid="button-close-preview"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form Preview Content */}
        <div className="overflow-y-auto max-h-[80vh] p-8">
          {/* Form Header Preview */}
          <div className="text-center mb-8">
            {form.headerImage && (
              <div className="h-32 bg-cover bg-center rounded-xl mb-6" 
                   style={{ backgroundImage: `url(${form.headerImage})` }}></div>
            )}
            {!form.headerImage && (
              <div className="h-32 bg-gradient-to-r from-primary to-secondary rounded-xl mb-6"></div>
            )}
            <h1 className="text-3xl font-bold text-slate-800 mb-3" data-testid="text-preview-title">
              {form.title || "Untitled Form"}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto" data-testid="text-preview-description">
              {form.description || "This is a preview of how your form will appear to respondents."}
            </p>
          </div>

          {/* Preview Questions */}
          <div className="space-y-8 max-w-3xl mx-auto">
            {form.questions?.map((question, index) => (
              <div key={question.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4" data-testid={`text-preview-question-${index}`}>
                  {index + 1}. {question.title}
                </h3>
                
                {question.image && (
                  <div className="mb-4">
                    <img 
                      src={question.image} 
                      alt="Question image" 
                      className="max-w-full h-auto rounded-lg"
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
          <div className="text-center mt-8">
            <Button 
              disabled
              className="bg-primary text-white px-8 py-3 text-lg"
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
