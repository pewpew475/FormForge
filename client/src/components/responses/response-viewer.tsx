import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Target, User } from "lucide-react";
import type { Form } from "@shared/schema";

interface Response {
  id: string;
  form_id: string;
  answers: Record<string, any>;
  score: number;
  submitted_at: string;
}

interface ResponseViewerProps {
  response: Response;
  form: Form;
  onClose: () => void;
}

export function ResponseViewer({ response, form, onClose }: ResponseViewerProps) {
  const formatAnswer = (question: any, answer: any) => {
    if (!answer) return "No answer provided";

    switch (question.type) {
      case 'categorize':
        if (typeof answer === 'object') {
          return (
            <div className="space-y-2">
              {Object.entries(answer).map(([category, items]) => (
                <div key={category} className="flex flex-wrap gap-1">
                  <span className="font-medium text-slate-700">{category}:</span>
                  {Array.isArray(items) && items.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              ))}
            </div>
          );
        }
        return JSON.stringify(answer);

      case 'cloze':
        if (typeof answer === 'object') {
          return (
            <div className="space-y-1">
              {Object.entries(answer).map(([blankId, value]) => (
                <div key={blankId} className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Blank {blankId}:</span>
                  <Badge variant="outline">{value as string}</Badge>
                </div>
              ))}
            </div>
          );
        }
        return JSON.stringify(answer);

      case 'comprehension':
        if (typeof answer === 'object' && question.subQuestions) {
          return (
            <div className="space-y-2">
              {question.subQuestions.map((subQ: any, index: number) => {
                const userAnswer = answer[subQ.id];
                const isCorrect = userAnswer === subQ.correctAnswer;
                return (
                  <div key={subQ.id} className="border-l-2 border-slate-200 pl-3">
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      {index + 1}. {subQ.question}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {userAnswer || "No answer"}
                      </Badge>
                      {!isCorrect && (
                        <span className="text-xs text-slate-500">
                          (Correct: {subQ.correctAnswer})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        return JSON.stringify(answer);

      default:
        return typeof answer === 'object' ? JSON.stringify(answer) : answer.toString();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Response Details</h3>
              <p className="text-sm text-slate-600">
                ID: <code className="bg-slate-200 px-1 rounded text-xs">{response.id}</code>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Response Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {new Date(response.submitted_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getScoreColor(response.score)}`}></div>
                  <span className="text-lg font-semibold">{response.score}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {Object.keys(response.answers).length} of {form.questions.length} questions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Answers */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Answers
            </h4>
            
            {form.questions.map((question, index) => {
              const answer = response.answers[question.id];
              const hasAnswer = answer !== undefined && answer !== null && answer !== "";

              return (
                <Card key={question.id} className={!hasAnswer ? "opacity-60" : ""}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-start justify-between">
                      <span>
                        {index + 1}. {question.title}
                      </span>
                      <Badge variant={hasAnswer ? "default" : "secondary"}>
                        {question.type}
                      </Badge>
                    </CardTitle>
                    {question.description && (
                      <p className="text-sm text-slate-600">{question.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 rounded-lg p-4">
                      {formatAnswer(question, answer)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
