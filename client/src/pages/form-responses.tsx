import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Users, 
  TrendingUp, 
  Target,
  Calendar,
  Filter,
  MoreVertical,
  Eye,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ResponseViewer } from "@/components/responses/response-viewer";
import { AnalyticsCharts } from "@/components/responses/analytics-charts";
import type { Form } from "@shared/schema";

interface Response {
  id: string;
  form_id: string;
  answers: Record<string, any>;
  score: number;
  submitted_at: string;
}

interface ResponsesData {
  responses: Response[];
  form: Form;
  statistics: {
    totalResponses: number;
    averageScore: number;
    completionRate: number;
    chartData: Array<{ date: string; responses: number }>;
    scoreDistribution: Record<string, number>;
  };
}

export default function FormResponses() {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  const { data, isLoading, error } = useQuery<ResponsesData>({
    queryKey: [`/api/form-responses?formId=${id}`],
    enabled: !!id,
  });

  const exportToCSV = () => {
    if (!data?.responses || !data?.form) return;

    const headers = ['Response ID', 'Submitted At', 'Score'];
    data.form.questions.forEach((q, index) => {
      headers.push(`Q${index + 1}: ${q.title}`);
    });

    const rows = data.responses.map(response => {
      const row = [
        response.id,
        new Date(response.submitted_at).toLocaleString(),
        response.score.toString()
      ];
      
      data.form.questions.forEach(question => {
        const answer = response.answers[question.id];
        if (typeof answer === 'object') {
          row.push(JSON.stringify(answer));
        } else {
          row.push(answer?.toString() || '');
        }
      });
      
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.form.title}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Error Loading Responses</h1>
          <p className="text-slate-600 mb-6">Failed to load form responses. Please try again.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { responses, form, statistics } = data;
  const filteredResponses = responses.filter(response => 
    response.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(response.submitted_at).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/builder/${id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Form
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{form.title}</h1>
                <p className="text-slate-600">Form Responses & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Link href={`/form/${id}`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Form
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalResponses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageScore}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completionRate}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Response</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {responses.length > 0 
                  ? new Date(responses[0].submitted_at).toLocaleDateString()
                  : 'No responses yet'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <AnalyticsCharts statistics={statistics} />

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Individual Responses</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No responses yet</h3>
                <p className="text-slate-600">
                  {responses.length === 0 
                    ? "Share your form to start collecting responses."
                    : "No responses match your search criteria."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Response ID</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Submitted</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Completion</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response) => {
                      const answeredQuestions = Object.keys(response.answers).length;
                      const totalQuestions = form.questions.length;
                      const completionPercentage = totalQuestions > 0 
                        ? Math.round((answeredQuestions / totalQuestions) * 100) 
                        : 0;

                      return (
                        <tr key={response.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {response.id.slice(0, 8)}...
                            </code>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(response.submitted_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={response.score >= 70 ? "default" : response.score >= 50 ? "secondary" : "destructive"}
                            >
                              {response.score}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-600">{completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResponse(response)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Response Viewer Modal */}
      {selectedResponse && (
        <ResponseViewer
          response={selectedResponse}
          form={form}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
}
