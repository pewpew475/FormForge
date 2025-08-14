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
import { FileUpload } from "@/components/ui/file-upload";
import { Link } from "wouter";
import { Save, Eye, ArrowLeft, Plus, Share, Settings, CheckCircle } from "lucide-react";

export default function FormBuilder() {
  const { id } = useParams<{ id?: string }>();
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded"></div>
              </div>
              <span className="text-xl font-bold text-slate-800">FormCraft</span>
            </div>
            <span className="text-slate-600">Form Builder</span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={form.isPublished ? "default" : "secondary"}>
              {form.isPublished ? "Published" : "Draft"}
            </Badge>
            <Button 
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              data-testid="button-form-settings"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="bg-secondary text-white hover:bg-secondary/90"
              data-testid="button-preview-form"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={saveForm} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-save-form"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          {/* Form Settings Panel */}
          {showSettings && (
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Form Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Form Title
                  </label>
                  <Input
                    value={form.title || ""}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    placeholder="Enter form title"
                    data-testid="input-form-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={form.description || ""}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="Add form description..."
                    className="h-20"
                    data-testid="textarea-form-description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Header Image
                  </label>
                  <FileUpload
                    onUpload={(url) => updateForm({ headerImage: url })}
                    currentImage={form.headerImage || undefined}
                    onRemove={() => updateForm({ headerImage: "" })}
                    data-testid="upload-header-image"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Published
                  </label>
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
          <QuestionSidebar onAddQuestion={addQuestion} />
          
          {/* Quick Actions */}
          <div className="mt-auto p-6 border-t border-slate-200">
            <div className="space-y-3">
              <Button 
                onClick={() => setShowPreview(true)}
                variant="outline" 
                className="w-full"
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
                className="w-full"
                data-testid="button-copy-share-link"
              >
                <Share className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Form Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
                {form.headerImage && (
                  <div className="h-32 bg-cover bg-center rounded-t-xl" 
                       style={{ backgroundImage: `url(${form.headerImage})` }}></div>
                )}
                {!form.headerImage && (
                  <div className="h-32 bg-gradient-to-r from-primary to-secondary rounded-t-xl"></div>
                )}
                <div className="p-8">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-form-title-display">
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
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => addQuestion("categorize")}
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
                  className={`${form.isPublished ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  onClick={() => {
                    updateForm({ isPublished: !form.isPublished });
                    saveForm();
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
    </div>
  );
}
