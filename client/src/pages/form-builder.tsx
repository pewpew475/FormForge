import { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useFormBuilder } from "@/hooks/use-form-builder";
import { QuestionSidebar } from "@/components/form-builder/question-sidebar";
import { QuestionEditor } from "@/components/form-builder/question-editor";
import { FormPreview } from "@/components/form-builder/form-preview";
import { PublishModal } from "@/components/form-builder/publish-modal";
import { QuestionTypeSelector } from "@/components/form-builder/question-type-selector";
import { FileUpload } from "@/components/ui/file-upload";
import { Link } from "wouter";
import { Save, Eye, ArrowLeft, Plus, Share, Settings, CheckCircle, Clock } from "lucide-react";
import type { Question } from "@shared/schema";

export default function FormBuilder() {
  const { id } = useParams<{ id?: string }>();
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false);
  const [publishedForm, setPublishedForm] = useState<any>(null);
  const {
    form,
    isLoading,
    isSaving,
    updateForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    saveForm,
  } = useFormBuilder(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">FormForge</span>
                <div className="text-xs text-muted-foreground font-medium">Form Builder</div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={form.isPublished ? "success" : "secondary"} className="animate-fade-in">
              {form.isPublished ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              data-testid="button-form-settings"
              className={showSettings ? "bg-accent" : ""}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              size="sm"
              data-testid="button-preview-form"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={saveForm}
              disabled={isSaving}
              size="sm"
              data-testid="button-save-form"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-89px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/50 backdrop-blur-sm border-r border-border flex flex-col">
          {/* Form Settings Panel */}
          {showSettings && (
            <div className="p-6 border-b border-border animate-slide-up">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Form Settings</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Form Title
                  </label>
                  <Input
                    value={form.title || ""}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    placeholder="Enter form title"
                    data-testid="input-form-title"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Textarea
                    value={form.description || ""}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="Add form description..."
                    className="min-h-[80px] resize-none"
                    data-testid="textarea-form-description"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Header Image
                  </label>
                  <FileUpload
                    onUpload={(url) => updateForm({ headerImage: url })}
                    currentImage={form.headerImage || undefined}
                    onRemove={() => updateForm({ headerImage: "" })}
                    data-testid="upload-header-image"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Published
                    </label>
                    <p className="text-xs text-muted-foreground">Make form available to respondents</p>
                  </div>
                  <Switch
                    checked={form.isPublished || false}
                    onCheckedChange={(checked) => updateForm({ isPublished: checked })}
                    data-testid="switch-form-published"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Question Types Panel */}
          <div className="flex-1">
            <QuestionSidebar onAddQuestion={addQuestion} />
          </div>

          {/* Quick Actions */}
          <div className="mt-auto p-6 border-t border-border bg-muted/30">
            <div className="space-y-3">
              <Button
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="w-full justify-start"
                data-testid="button-quick-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Quick Preview
              </Button>
              <Button
                onClick={() => {
                  const formUrl = `${window.location.origin}/form/${form.id || 'preview'}`;
                  navigator.clipboard.writeText(formUrl);
                }}
                variant="outline"
                className="w-full justify-start"
                data-testid="button-copy-share-link"
              >
                <Share className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col bg-muted/20">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Form Header */}
              <div className="bg-white rounded-2xl shadow-medium border border-border mb-8 overflow-hidden">
                {form.headerImage && (
                  <div className="h-40 bg-cover bg-center"
                       style={{ backgroundImage: `url(${form.headerImage})` }}></div>
                )}
                {!form.headerImage && (
                  <div className="h-40 gradient-primary"></div>
                )}
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-foreground mb-3 text-balance" data-testid="text-form-title-display">
                    {form.title || "Untitled Form"}
                  </h1>
                  <p className="text-slate-600" data-testid="text-form-description-display">
                    {form.description || "Add your form description here..."}
                  </p>
                </div>
              </div>

              {/* Questions Container */}
              <div className="space-y-6">
                {form.questions?.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                    onDelete={() => deleteQuestion(question.id)}
                  />
                ))}

                {/* Add Question Button */}
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer hover:bg-slate-50"
                  onClick={() => setShowQuestionTypeSelector(true)}
                  data-testid="button-add-question"
                >
                  <Plus className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-lg font-medium text-slate-600">Add a new question</p>
                  <p className="text-sm text-slate-500">Choose from Categorize, Cloze, or Comprehension</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bg-white border-t border-slate-200 px-8 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600" data-testid="text-question-count">
                  {form.questions?.length || 0} questions
                </span>
                <span className="text-sm text-slate-400">•</span>
                <span className="text-sm text-slate-600">Auto-saved</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-600">Auto-saved</span>
                </div>
                <Button
                  type="button"
                  className={`${form.isPublished ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!form.isPublished) {
                      try {
                        // Save the form with published status
                        const savedForm = await saveForm({ isPublished: true });

                        // Update local state to reflect published status
                        updateForm({ isPublished: true });

                        // Set the published form for the modal
                        setPublishedForm({ ...form, ...savedForm, isPublished: true });

                        // Show the publish modal after successful save
                        setShowPublishModal(true);
                      } catch (error) {
                        console.error('Failed to publish form:', error);
                        // Ensure form stays unpublished if save failed
                        updateForm({ isPublished: false });
                      }
                    } else {
                      updateForm({ isPublished: false });
                      saveForm({ isPublished: false });
                    }
                  }}
                  data-testid="button-toggle-publish"
                >
                  {form.isPublished ? 'Unpublish' : 'Publish Form'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <FormPreview
          form={form}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Publish Modal */}
      {showPublishModal && publishedForm && (
        <PublishModal
          form={publishedForm}
          onClose={() => {
            setShowPublishModal(false);
            setPublishedForm(null);
          }}
          onViewResponses={() => {
            setShowPublishModal(false);
            setPublishedForm(null);
            window.location.href = `/responses/${publishedForm.id}`;
          }}
        />
      )}

      {/* Question Type Selector Modal */}
      <QuestionTypeSelector
        isOpen={showQuestionTypeSelector}
        onClose={() => setShowQuestionTypeSelector(false)}
        onSelect={(type: Question["type"]) => addQuestion(type)}
        title="Add New Question"
        description="Choose the type of question you want to create"
      />
    </div>
  );
}
