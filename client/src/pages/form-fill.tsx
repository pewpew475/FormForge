import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, CheckCircle, Clock, Loader2, LogOut, User, Shield, Timer, FileText, Award, Info } from "lucide-react";
import { CategorizeResponse } from "@/components/form-fill/categorize-response";
import { ClozeResponse } from "@/components/form-fill/cloze-response";
import { ComprehensionResponse } from "@/components/form-fill/comprehension-response";
import { useAuth } from "@/contexts/AuthContext";
import type { Form, InsertResponse } from "@shared/schema";

export default function FormFill() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, signInWithOAuth, signOut } = useAuth();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showScore, setShowScore] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: form, isLoading, error } = useQuery<Form>({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id,
  });

  // Update current time every minute for elapsed time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time
  const getElapsedTime = () => {
    const diff = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60);
    if (diff < 1) return "Just started";
    if (diff === 1) return "1 minute";
    return `${diff} minutes`;
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!form) return 0;
    const totalQuestions = form.questions.length;
    const answeredQuestions = Object.keys(responses).filter(key => {
      const response = responses[key];
      return response && (
        (Array.isArray(response) && response.length > 0) ||
        (typeof response === 'object' && Object.keys(response).length > 0) ||
        (typeof response === 'string' && response.trim().length > 0)
      );
    }).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Form Preview Card */}
          {form && (
            <Card className="mb-8 p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{form.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{form.description}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{form.questions.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="w-4 h-4" />
                    <span>~{Math.ceil(form.questions.length * 2)} min</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Sign In Card */}
          <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Secure Access Required
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              To ensure the integrity of responses and prevent spam, please authenticate with your account to access this form.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                <Info className="w-5 h-5" />
                <span className="font-semibold">Why sign in?</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Prevents duplicate submissions</li>
                <li>• Saves your progress automatically</li>
                <li>• Provides secure result delivery</li>
                <li>• Maintains response authenticity</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
                size="lg"
                variant="outline"
                className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => handleOAuthSignIn('azure')}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-4">
                By continuing, you agree to our terms of service and privacy policy
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="w-full text-slate-500 hover:text-slate-700"
              >
                ← Return to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Form Not Found</h1>
          <p className="text-slate-600 mb-6">The form you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home" className="w-full">
            Return to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  if (!form.isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Form Not Available</h1>
          <p className="text-slate-600 mb-6">This form is not yet published and cannot be filled out. Please check back later.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home" className="w-full">
            Return to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fixed Header with User Info and Controls */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Form Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800 truncate max-w-xs">{form.title}</h1>
                <p className="text-xs text-slate-500">Form Response</p>
              </div>
            </div>

            {/* Progress and User Info */}
            <div className="flex items-center space-x-6">
              {/* Progress Indicator */}
              {!isSubmitted && (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">{getCompletionPercentage()}% Complete</div>
                    <div className="text-xs text-slate-500">{getElapsedTime()} elapsed</div>
                  </div>
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-slate-700">{user.email}</div>
                  <div className="text-xs text-slate-500">Authenticated User</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save Status */}
      <div className="fixed top-20 right-6 z-40">
        {autoSaveStatus === 'saving' && (
          <Badge variant="secondary" className="shadow-lg animate-fade-in bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Saving...
          </Badge>
        )}
        {autoSaveStatus === 'saved' && lastSaved && (
          <Badge variant="secondary" className="shadow-lg animate-fade-in bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="pt-20">
        {/* Form Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 py-12">

            {/* Form Header Image */}
            {form.headerImage && (
              <div className="h-64 bg-cover bg-center rounded-2xl mb-8 shadow-xl border border-slate-200"
                   style={{ backgroundImage: `url(${form.headerImage})` }}>
                <div className="h-full bg-black/20 rounded-2xl flex items-end">
                  <div className="p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 inline-block mb-2">
                      <span className="text-sm font-medium">Form Assessment</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!form.headerImage && (
              <div className="h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-8 shadow-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                    <span className="font-semibold">Interactive Assessment</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Info */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-800 mb-4 text-balance" data-testid="text-form-title">
                {form.title}
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance mb-8" data-testid="text-form-description">
                {form.description}
              </p>

              {/* Form Stats */}
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">{form.questions.length} Questions</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
                  <Timer className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-800 font-medium">~{Math.ceil(form.questions.length * 2)} Minutes</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 font-medium">Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Questions */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Instructions Card */}
          {!isSubmitted && (
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Instructions</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Answer all questions to the best of your ability</li>
                    <li>• Your progress is automatically saved as you work</li>
                    <li>• You can review your answers before submitting</li>
                    <li>• Once submitted, you cannot modify your responses</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-8">
            {form.questions.map((question, index) => (
              <Card key={question.id} className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up" data-testid={`question-card-${question.id}`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2 text-balance" data-testid={`text-question-title-${index}`}>
                      {question.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-full capitalize">{question.type}</span>
                      {responses[question.id] && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Answered</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {question.image && (
                  <div className="mb-8">
                    <img
                      src={question.image}
                      alt="Question image"
                      className="max-w-full h-auto rounded-xl shadow-lg border border-slate-200"
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

          {/* Submit Section - Only show if not submitted */}
          {!isSubmitted && (
            <div className="mt-16">
              {/* Pre-submit Summary */}
              <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Ready to Submit?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{Object.keys(responses).length}</div>
                      <div className="text-sm text-slate-600">Questions Answered</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{getCompletionPercentage()}%</div>
                      <div className="text-sm text-slate-600">Completion Rate</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{getElapsedTime()}</div>
                      <div className="text-sm text-slate-600">Time Spent</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-6">
                    Please review your answers before submitting. Once submitted, you cannot make changes.
                  </p>
                </div>
              </Card>

              <div className="text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={submitResponseMutation.isPending || getCompletionPercentage() < 100}
                  size="lg"
                  className="px-16 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                  data-testid="button-submit-form"
                >
                  {submitResponseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Submit Form
                    </>
                  )}
                </Button>
                {getCompletionPercentage() < 100 && (
                  <p className="text-sm text-amber-600 mt-3">
                    Please answer all questions before submitting
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submitted Status and Score */}
          {isSubmitted && (
            <div className="mt-16 space-y-8">
              {/* Success Banner */}
              <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-3">Submission Successful!</h3>
                <p className="text-green-700 mb-6">
                  Thank you for completing this form. Your responses have been securely recorded and processed.
                </p>
                <div className="bg-white/80 rounded-lg p-4 inline-block">
                  <div className="text-sm text-green-600 font-medium">
                    Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </Card>

              {/* Score Display */}
              {scoreData && (
                <Card className="max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Results</h2>
                    <p className="text-slate-600">Here's how you performed on this assessment</p>
                  </div>

                  {/* Score Circle */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <div className="text-4xl font-bold text-white">
                          {scoreData.percentage}%
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border">
                        <span className="text-sm font-medium text-slate-700">
                          {scoreData.correctAnswers}/{scoreData.totalQuestions} Correct
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Breakdown */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Question Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(scoreData.questionScores).map(([questionId, score]: [string, any]) => (
                        <div key={questionId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-700">
                            Question {Object.keys(scoreData.questionScores).indexOf(questionId) + 1}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              score.correct
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {score.earned}/{score.total} points
                            </span>
                            {score.correct ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-4">
                      Your responses have been saved. You can now safely close this window.
                    </p>
                    <Button
                      onClick={() => setLocation("/")}
                      size="lg"
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      data-testid="button-go-home"
                    >
                      Return to Homepage
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Score Modal - Only show for fresh submissions, not when reloading submitted form */}
      {showScore && scoreData && !isSubmitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Submission Complete!</h2>
              <p className="text-slate-600 mb-8">Your form has been successfully submitted</p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {scoreData.percentage}%
                </div>
                <p className="text-lg text-slate-700 font-medium">
                  {scoreData.correctAnswers} out of {scoreData.totalQuestions} correct
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {Object.entries(scoreData.questionScores).map(([questionId, score]: [string, any]) => (
                  <div key={questionId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">Question {Object.keys(scoreData.questionScores).indexOf(questionId) + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      score.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {score.earned}/{score.total}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setLocation("/")}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  data-testid="button-go-home"
                >
                  Return Home
                </Button>
                <Button
                  onClick={() => setShowScore(false)}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  data-testid="button-close-score"
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
