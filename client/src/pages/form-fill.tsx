import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, CheckCircle, Clock, Loader2 } from "lucide-react";
import { CategorizeResponse } from "@/components/form-fill/categorize-response";
import { ClozeResponse } from "@/components/form-fill/cloze-response";
import { ComprehensionResponse } from "@/components/form-fill/comprehension-response";
import { useAuth } from "@/contexts/AuthContext";
import type { Form, InsertResponse } from "@shared/schema";

export default function FormFill() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, signInWithOAuth } = useAuth();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showScore, setShowScore] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { data: form, isLoading, error } = useQuery<Form>({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id,
  });

  const handleOAuthSignIn = async (provider: 'google' | 'azure') => {
    setIsSigningIn(true);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: InsertResponse) => {
      return apiRequest("POST", `/api/forms/${id}/responses`, responseData);
    },
    onSuccess: (data: any) => {
      setScoreData(data.score);
      setShowScore(true);
      setIsSubmitted(true);
      // Store submission state in localStorage to persist across page reloads
      if (id && user) {
        localStorage.setItem(`form-submitted-${id}-${user.id}`, 'true');
        localStorage.setItem(`form-score-${id}-${user.id}`, JSON.stringify(data.score));
        localStorage.setItem(`form-answers-${id}-${user.id}`, JSON.stringify(responses));
      }
      toast({
        title: "Success",
        description: "Your response has been submitted successfully!",
      });
    },
    onError: (error: any) => {
      // Handle case where user already submitted
      if (error.status === 409) {
        const errorData = error.data;
        if (errorData?.existingResponse) {
          setScoreData(errorData.existingResponse.score);
          setShowScore(true);
          setIsSubmitted(true);
          // Store the existing submission data
          if (id && user) {
            localStorage.setItem(`form-submitted-${id}-${user.id}`, 'true');
            localStorage.setItem(`form-score-${id}-${user.id}`, JSON.stringify(errorData.existingResponse.score));
            localStorage.setItem(`form-answers-${id}-${user.id}`, JSON.stringify(errorData.existingResponse.answers));
          }
          toast({
            title: "Already Submitted",
            description: "You have already submitted this form. Showing your previous results.",
          });
          return;
        }
      }

      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  const saveToLocalStorage = useCallback((responses: Record<string, any>) => {
    if (!id || !user) return;
    localStorage.setItem(`form-draft-${id}-${user.id}`, JSON.stringify({
      responses,
      timestamp: new Date().toISOString()
    }));
    setLastSaved(new Date());
    setAutoSaveStatus('saved');
  }, [id, user]);

  const loadFromLocalStorage = useCallback(() => {
    if (!id || !user) return {};
    try {
      const saved = localStorage.getItem(`form-draft-${id}-${user.id}`);
      if (saved) {
        const { responses, timestamp } = JSON.parse(saved);
        setLastSaved(new Date(timestamp));
        return responses;
      }
    } catch (error) {
      console.error('Failed to load saved responses:', error);
    }
    return {};
  }, [id, user]);

  // Load saved responses and check submission status on mount
  useEffect(() => {
    if (!id || !user) return;

    // Check if form was already submitted
    const isFormSubmitted = localStorage.getItem(`form-submitted-${id}-${user.id}`) === 'true';
    if (isFormSubmitted) {
      setIsSubmitted(true);
      setShowScore(true);

      // Load saved score and answers
      const savedScore = localStorage.getItem(`form-score-${id}-${user.id}`);
      const savedAnswers = localStorage.getItem(`form-answers-${id}-${user.id}`);

      if (savedScore) {
        setScoreData(JSON.parse(savedScore));
      }
      if (savedAnswers) {
        setResponses(JSON.parse(savedAnswers));
      }

      toast({
        title: "Form already submitted",
        description: "You have already submitted this form. Showing your results.",
      });
      return;
    }

    // Load draft responses if form not submitted
    const savedResponses = loadFromLocalStorage();
    if (Object.keys(savedResponses).length > 0) {
      setResponses(savedResponses);
      toast({
        title: "Draft restored",
        description: "Your previous responses have been restored.",
      });
    }
  }, [id, user, loadFromLocalStorage, toast]);

  // Auto-save responses when they change (only if not submitted)
  useEffect(() => {
    if (Object.keys(responses).length === 0 || isSubmitted) return;

    setAutoSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(responses);
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [responses, saveToLocalStorage, isSubmitted]);

  const updateResponse = (questionId: string, response: any) => {
    // Prevent updates if form is already submitted
    if (isSubmitted) return;

    setResponses(prev => ({
      ...prev,
      [questionId]: response,
    }));
  };

  const handleSubmit = () => {
    if (!form || isSubmitted || !user) return;

    const responseData: InsertResponse = {
      formId: form.id,
      answers: responses,
    };

    // Clear the draft when submitting
    if (id && user) {
      localStorage.removeItem(`form-draft-${id}-${user.id}`);
    }

    submitResponseMutation.mutate(responseData);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Require authentication for form filling
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Sign In Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Please sign in with your Google or Microsoft account to fill out this form.
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('azure')}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4z"
                  />
                  <path
                    fill="currentColor"
                    d="M24 11.4H12.6V0H24v11.4z"
                  />
                </svg>
              )}
              Continue with Microsoft
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-slate-500 hover:text-slate-700"
            >
              ← Back to Home
            </Button>
          </div>
        </Card>
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Form Not Published</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">This form is not yet published and cannot be filled out.</p>
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
          {/* User indicator */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Signed in as {user.email}</span>
            </div>
          </div>

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
                  disabled={isSubmitted}
                />
              )}
              {question.type === "cloze" && (
                <ClozeResponse
                  question={question}
                  value={responses[question.id]}
                  onChange={(response: any) => updateResponse(question.id, response)}
                  disabled={isSubmitted}
                />
              )}
              {question.type === "comprehension" && (
                <ComprehensionResponse
                  question={question}
                  value={responses[question.id]}
                  onChange={(response: any) => updateResponse(question.id, response)}
                  disabled={isSubmitted}
                />
              )}
            </Card>
          ))}
        </div>

        {/* Submit Button - Only show if not submitted */}
        {!isSubmitted && (
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
        )}

        {/* Submitted Status and Score */}
        {isSubmitted && (
          <div className="text-center mt-16 space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Form Submitted Successfully!</h3>
              <p className="text-green-700">You have already submitted this form. Your score and answers are shown below.</p>
            </div>

            {/* Inline Score Display */}
            {scoreData && (
              <Card className="max-w-md mx-auto p-6">
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
                  <Button
                    onClick={() => setLocation("/")}
                    className="w-full"
                    data-testid="button-go-home"
                  >
                    Go Home
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {/* Score Modal - Only show for fresh submissions, not when reloading submitted form */}
      {showScore && scoreData && !isSubmitted && (
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
