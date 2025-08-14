import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Form, Question, InsertForm } from "@shared/schema";
// Browser-compatible UUID function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useFormBuilder(formId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: form, isLoading } = useQuery<Form>({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId,
  });

  const [localForm, setLocalForm] = useState<Partial<Form>>({
    title: "Untitled Form",
    description: "",
    headerImage: "",
    questions: [],
    isPublished: false,
  });

  // Use form data from API if available, otherwise use local state
  const currentForm = form || localForm;

  const saveFormMutation = useMutation({
    mutationFn: async (formData: InsertForm) => {
      if (formId) {
        const response = await apiRequest("PUT", `/api/forms/${formId}`, formData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/forms", formData);
        return response.json();
      }
    },
    onSuccess: (savedForm) => {
      toast({
        title: "Success",
        description: "Form saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });

      // If this was a new form (no formId), update the URL to include the new form ID
      if (!formId && savedForm.id) {
        window.history.replaceState({}, '', `/builder/${savedForm.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      });
    },
  });

  const updateForm = useCallback((updates: Partial<Form>) => {
    if (form) {
      // If we have a form from API, update it via mutation
      const formData: InsertForm = {
        title: updates.title !== undefined ? updates.title : form.title,
        description: updates.description !== undefined ? updates.description : form.description,
        headerImage: updates.headerImage !== undefined ? updates.headerImage : form.headerImage,
        questions: updates.questions !== undefined ? updates.questions : form.questions,
        isPublished: updates.isPublished !== undefined ? updates.isPublished : form.isPublished,
      };
      saveFormMutation.mutate(formData);
    } else {
      // If no form from API, update local state
      setLocalForm(prev => ({ ...prev, ...updates }));
    }
  }, [form, saveFormMutation]);

  const addQuestion = useCallback((type: Question["type"]) => {
    let newQuestion: Question;
    
    if (type === "categorize") {
      newQuestion = {
        type: "categorize",
        id: generateUUID(),
        title: `New ${type} question`,
        items: [],
        categories: [],
      };
    } else if (type === "cloze") {
      newQuestion = {
        type: "cloze",
        id: generateUUID(),
        title: `New ${type} question`,
        text: "",
        blanks: [],
        options: [],
      };
    } else {
      newQuestion = {
        type: "comprehension",
        id: generateUUID(),
        title: `New ${type} question`,
        passage: "",
        subQuestions: [],
      };
    }

    const updatedQuestions = [...(currentForm.questions || []), newQuestion];
    updateForm({ questions: updatedQuestions });
  }, [currentForm.questions, updateForm]);

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    const updatedQuestions = (currentForm.questions || []).map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateForm({ questions: updatedQuestions });
  }, [currentForm.questions, updateForm]);

  const deleteQuestion = useCallback((questionId: string) => {
    const updatedQuestions = (currentForm.questions || []).filter(q => q.id !== questionId);
    updateForm({ questions: updatedQuestions });
  }, [currentForm.questions, updateForm]);

  const saveForm = useCallback(() => {
    const formData: InsertForm = {
      title: currentForm.title || "Untitled Form",
      description: currentForm.description || "",
      headerImage: currentForm.headerImage || "",
      questions: currentForm.questions || [],
      isPublished: currentForm.isPublished || false,
    };
    return saveFormMutation.mutateAsync(formData);
  }, [currentForm, saveFormMutation]);

  return {
    form: currentForm,
    isLoading,
    isSaving: saveFormMutation.isPending,
    updateForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    saveForm,
  };
}
