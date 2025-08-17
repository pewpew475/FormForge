import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Plus, Eye, Edit, Trash2, BarChart3, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/auth/UserMenu";
import type { Form } from "@shared/schema";

export default function Home() {
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">FormForge</span>
              <div className="text-xs text-muted-foreground font-medium">Professional Form Builder</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/builder">
              <Button size="sm" data-testid="button-create-form" className="shadow-soft hover:shadow-medium">
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </Link>
            {user ? (
              <UserMenu />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                disabled={authLoading}
              >
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
              <div className="w-6 h-6 bg-white rounded-md"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Forms</h1>
              <p className="text-lg text-muted-foreground">Create and manage your custom forms with ease</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse p-6">
                <div className="h-6 bg-muted rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded-lg w-2/3 mb-4"></div>
                <div className="h-4 bg-muted rounded-lg mb-2"></div>
                <div className="h-4 bg-muted rounded-lg w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forms.map((form, index) => (
              <Card key={form.id} className="group hover:shadow-strong transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-foreground text-lg group-hover:text-primary transition-colors" data-testid={`text-form-title-${form.id}`}>
                      {form.title}
                    </CardTitle>
                    <Badge variant={form.isPublished ? "success" : "secondary"} className="ml-2">
                      {form.isPublished ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed" data-testid={`text-form-description-${form.id}`}>
                    {form.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span data-testid={`text-question-count-${form.id}`}>
                        {form.questions.length} {form.questions.length === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/form/${form.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-form-${form.id}`} className="hover:bg-primary hover:text-primary-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/builder/${form.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-edit-form-${form.id}`} className="hover:bg-primary hover:text-primary-foreground">
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

      {/* Authentication Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
