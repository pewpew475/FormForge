import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, CheckCircle, Clock } from "lucide-react";
import { CategorizeResponse } from "@/components/form-fill/categorize-response";
import { ClozeResponse } from "@/components/form-fill/cloze-response";
import { ComprehensionResponse } from "@/components/form-fill/comprehension-response";
import type { Form, InsertResponse } from "@shared/schema";

export default function FormFill() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showScore, setShowScore] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { data: form, isLoading, error } = useQuery<Form>({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id,
  });

  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: InsertResponse) => {
      return apiRequest("POST", `/api/form-responses?formId=${id}`, responseData);
    },
    onSuccess: (data: any) => {
      setScoreData(data.score);
      setShowScore(true);
      toast({
        title: "Success", 
        description: "Your response has been submitted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  const saveToLocalStorage = useCallback((responses: Record<string, any>) => {
    if (!id) return;
    localStorage.setItem(`form-draft-${id}`, JSON.stringify({
      responses,
      timestamp: new Date().toISOString()
    }));
    setLastSaved(new Date());
    setAutoSaveStatus('saved');
  }, [id]);

  const loadFromLocalStorage = useCallback(() => {
    if (!id) return {};
    try {
      const saved = localStorage.getItem(`form-draft-${id}`);
      if (saved) {
        const { responses, timestamp } = JSON.parse(saved);
        setLastSaved(new Date(timestamp));
        return responses;
      }
    } catch (error) {
      console.error('Failed to load saved responses:', error);
    }
    return {};
  }, [id]);

  // Load saved responses on mount
  useEffect(() => {
    const savedResponses = loadFromLocalStorage();
    if (Object.keys(savedResponses).length > 0) {
      setResponses(savedResponses);
      toast({
        title: "Draft restored",
        description: "Your previous responses have been restored.",
      });
    }
  }, [loadFromLocalStorage, toast]);

  // Auto-save responses when they change
  useEffect(() => {
    if (Object.keys(responses).length === 0) return;

    setAutoSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(responses);
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [responses, saveToLocalStorage]);

  const updateResponse = (questionId: string, response: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response,
    }));
  };

  const handleSubmit = () => {
    if (!form) return;

    const responseData: InsertResponse = {
      formId: form.id,
      answers: responses,
    };

    // Clear the draft when submitting
    if (id) {
      localStorage.removeItem(`form-draft-${id}`);
    }

    submitResponseMutation.mutate(responseData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Form Not Found</h1>
          <p className="text-slate-600 mb-6">The form you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!form.isPublished) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Form Not Published</h1>
          <p className="text-slate-600 mb-6">This form is not yet published and cannot be filled out.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Auto-save Status */}
      <div className="fixed top-6 right-6 z-50">
        {autoSaveStatus === 'saving' && (
          <Badge variant="warning" className="shadow-medium animate-fade-in">
            <Clock className="w-3 h-3 mr-1" />
            Saving...
          </Badge>
        )}
        {autoSaveStatus === 'saved' && lastSaved && (
          <Badge variant="success" className="shadow-medium animate-fade-in">
            <CheckCircle className="w-3 h-3 mr-1" />
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </Badge>
        )}
      </div>

      {/* Form Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {form.headerImage && (
            <div className="h-56 bg-cover bg-center rounded-2xl mb-8 shadow-medium"
                 style={{ backgroundImage: `url(${form.headerImage})` }}></div>
          )}
          {!form.headerImage && (
            <div className="h-56 gradient-primary rounded-2xl mb-8 shadow-medium"></div>
          )}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-balance" data-testid="text-form-title">
              {form.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance" data-testid="text-form-description">
              {form.description}
            </p>
          </div>
        </div>
      </div>

      {/* Form Questions */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {form.questions.map((question, index) => (
            <Card key={question.id} className="p-8 animate-slide-up" data-testid={`question-card-${question.id}`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                  {index + 1}
                </div>
                <h2 className="text-2xl font-semibold text-foreground flex-1 text-balance" data-testid={`text-question-title-${index}`}>
                  {question.title}
                </h2>
              </div>

              {question.image && (
                <div className="mb-8">
                  <img
                    src={question.image}
                    alt="Question image"
                    className="max-w-full h-auto rounded-xl shadow-medium"
                  />
                </div>
              )}

              {question.type === "categorize" && (
                <CategorizeResponse 
                  question={question} 
                  value={responses[question.id]}
                  onChange={(response: any) => updateResponse(question.id, response)}
                />
              )}
              {question.type === "cloze" && (
                <ClozeResponse 
                  question={question} 
                  value={responses[question.id]}
                  onChange={(response: any) => updateResponse(question.id, response)}
                />
              )}
              {question.type === "comprehension" && (
                <ComprehensionResponse 
                  question={question} 
                  value={responses[question.id]}
                  onChange={(response: any) => updateResponse(question.id, response)}
                />
              )}
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-16">
          <Button
            onClick={handleSubmit}
            disabled={submitResponseMutation.isPending}
            size="lg"
            className="px-16 py-4 text-lg font-semibold shadow-medium hover:shadow-strong"
            data-testid="button-submit-form"
          >
            {submitResponseMutation.isPending ? "Submitting..." : "Submit Form"}
          </Button>
        </div>
      </div>
      
      {/* Score Modal */}
      {showScore && scoreData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Your Score</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {scoreData.percentage}%
              </div>
              <p className="text-lg text-slate-600 mb-4">
                {scoreData.correctAnswers} out of {scoreData.totalQuestions} correct
              </p>
              <div className="space-y-2 text-left mb-6">
                {Object.entries(scoreData.questionScores).map(([questionId, score]: [string, any]) => (
                  <div key={questionId} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Question {Object.keys(scoreData.questionScores).indexOf(questionId) + 1}</span>
                    <span className={`text-sm font-medium ${score.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {score.earned}/{score.total}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setLocation("/")}
                  className="flex-1"
                  data-testid="button-go-home"
                >
                  Go Home
                </Button>
                <Button 
                  onClick={() => setShowScore(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-close-score"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
