import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const emailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required to verify your identity'),
});

type EmailChangeFormData = z.infer<typeof emailChangeSchema>;

interface EmailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailChangeDialog({ open, onOpenChange }: EmailChangeDialogProps) {
  const { changeEmail, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
  });

  const newEmail = watch('newEmail');

  const onSubmit = async (data: EmailChangeFormData) => {
    setIsLoading(true);
    try {
      await changeEmail(data.newEmail, data.password);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // Check if user signed up with OAuth (no password available)
  const isOAuthUser = user?.app_metadata?.provider && user.app_metadata.provider !== 'email';

  if (isOAuthUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Change Email Address
            </DialogTitle>
            <DialogDescription>
              Email management for OAuth accounts
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              OAuth Account Detected
            </h3>
            <p className="text-slate-600 mb-4">
              You signed in with {user?.app_metadata?.provider === 'google' ? 'Google' : 'Microsoft'}. 
              Email changes should be made through your {user?.app_metadata?.provider === 'google' ? 'Google' : 'Microsoft'} account settings.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Your current email: <strong>{user?.email}</strong>
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Change Email Address
          </DialogTitle>
          <DialogDescription>
            Update your email address. You'll need to verify both your old and new email.
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current email:</strong> {user?.email}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Email */}
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="Enter your new email address"
              {...register('newEmail')}
            />
            {errors.newEmail && (
              <p className="text-sm text-destructive">{errors.newEmail.message}</p>
            )}
            {newEmail && newEmail === user?.email && (
              <p className="text-sm text-amber-600">
                This is the same as your current email address
              </p>
            )}
          </div>

          {/* Password Verification */}
          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your current password to verify"
                {...register('password')}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Information Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              After submitting, you'll receive confirmation emails at both your current and new email addresses. 
              You must confirm both to complete the change.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || newEmail === user?.email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Email'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
