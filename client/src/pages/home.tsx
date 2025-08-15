import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Plus, Eye, Edit, Trash2, BarChart3 } from "lucide-react";
import type { Form } from "@shared/schema";

export default function Home() {
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      console.log('Deleting form with ID:', formId);
      const response = await apiRequest("DELETE", `/api/forms/${formId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      setDeleteFormId(null);
    },
    onError: (error: any) => {
      console.error('Delete form error:', error);
      toast({
        title: "Error",
        description: `Failed to delete form: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded"></div>
            </div>
            <span className="text-xl font-bold text-slate-800">FormCraft</span>
          </div>
          <Link href="/builder">
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-form">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Forms</h1>
          <p className="text-slate-600">Create and manage your custom forms with ease</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-slate-800" data-testid={`text-form-title-${form.id}`}>
                    {form.title}
                  </CardTitle>
                  <CardDescription data-testid={`text-form-description-${form.id}`}>
                    {form.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      <span data-testid={`text-question-count-${form.id}`}>
                        {form.questions.length} questions
                      </span>
                      <span className="mx-2">•</span>
                      <span data-testid={`text-form-status-${form.id}`}>
                        {form.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/form/${form.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-form-${form.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/builder/${form.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-edit-form-${form.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {form.isPublished && (
                        <Link href={`/responses/${form.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-responses-${form.id}`}>
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-form-${form.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Form</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{form.title}"?
                              <br /><br />
                              <strong>This action cannot be undone and will permanently delete:</strong>
                              <ul className="list-disc list-inside mt-2 text-sm">
                                <li>The form and all its questions</li>
                                <li>All submitted responses and data</li>
                                <li>All analytics and statistics</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteFormMutation.mutate(form.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteFormMutation.isPending}
                            >
                              {deleteFormMutation.isPending ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No forms yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first form</p>
            <Link href="/builder">
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-first-form">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
