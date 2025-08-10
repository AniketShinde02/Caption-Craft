'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, UserX, Shield, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'next-auth/react';
import { format } from 'date-fns';

interface DeletePreview {
  accountEmail: string;
  username: string;
  totalCaptions: number;
  accountCreated: string;
  lastActivity: string;
}

export default function ProfileDeletion({ userEmail }: { userEmail: string }) {
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [confirmEmailField, setConfirmEmailField] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePreview, setDeletePreview] = useState<DeletePreview | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const { toast } = useToast();

  const generatePreview = async () => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailConfirmation,
          confirmEmail: confirmEmailField,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeletePreview(data.preview);
        setIsDeleteDialogOpen(true);
        setIsPreviewDialogOpen(false);
      } else {
        toast({
          title: "Preview Error",
          description: data.message || "Failed to generate deletion preview.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to generate deletion preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDeleted(true);
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted. You will be logged out shortly.",
        });
        
        // Wait 3 seconds then sign out
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 3000);
      } else {
        toast({
          title: "Deletion Failed",
          description: data.message || "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to delete account due to a network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetState = () => {
    setEmailConfirmation('');
    setConfirmEmailField('');
    setDeleteReason('');
    setDeletePreview(null);
    setIsPreviewDialogOpen(false);
    setIsDeleteDialogOpen(false);
  };

  if (isDeleted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 p-4 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
            Account Successfully Deleted
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your account and data have been archived according to our data retention policy. 
            You will be logged out automatically.
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Logging out in 3 seconds...
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 dark:text-red-200 mb-1">Account Deletion</p>
              <p className="text-red-700 dark:text-red-300 mb-2">
                Deleting your account will permanently remove your profile and all associated data. 
                This action cannot be undone.
              </p>
              <ul className="text-red-600 dark:text-red-400 text-xs space-y-1">
                <li>• All your generated captions will be deleted</li>
                <li>• Your profile information will be archived for legal compliance</li>
                <li>• You will lose access to all premium features</li>
                <li>• This action is irreversible</li>
              </ul>
            </div>
          </div>
        </div>

        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setIsPreviewDialogOpen(true)}
            >
              <UserX className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Confirm Account Deletion
              </DialogTitle>
              <DialogDescription>
                Please confirm your email address to proceed with account deletion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter your email address
                </label>
                <Input
                  type="email"
                  value={emailConfirmation}
                  onChange={(e) => setEmailConfirmation(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm your email address
                </label>
                <Input
                  type="email"
                  value={confirmEmailField}
                  onChange={(e) => setConfirmEmailField(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              {emailConfirmation && confirmEmailField && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {emailConfirmation === confirmEmailField 
                      ? "Email addresses match. You can proceed to see what will be deleted."
                      : "Email addresses do not match. Please check your input."
                    }
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={resetState}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generatePreview}
                  disabled={!emailConfirmation || !confirmEmailField || 
                           emailConfirmation !== confirmEmailField || 
                           emailConfirmation !== userEmail || isLoadingPreview}
                  className="flex-1"
                >
                  {isLoadingPreview ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Preview Deletion'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Final Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription>
                This is your last chance to change your mind. Review what will be deleted:
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deletePreview && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Account Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{deletePreview.accountEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Username:</span>
                        <span>{deletePreview.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Captions:</span>
                        <Badge variant="secondary">{deletePreview.totalCaptions}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member Since:</span>
                        <span>{format(new Date(deletePreview.accountCreated), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Activity:</span>
                        <span>{format(new Date(deletePreview.lastActivity), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for deletion (optional)
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Help us improve by telling us why you're leaving..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {deleteReason.length}/500 characters
                  </p>
                </div>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetState}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={executeDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account Forever
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
