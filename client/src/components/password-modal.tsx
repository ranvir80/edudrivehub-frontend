import { useState } from "react";
import { type Subject, type PasswordValidation } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

export default function PasswordModal({ isOpen, onClose, subject }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [accessUrl, setAccessUrl] = useState("");
  const { toast } = useToast();

  const validatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordValidation) => {
      const response = await apiRequest("POST", "/api/subjects/validate-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAccessUrl(data.accessUrl);
      setShowSuccess(true);
      toast({
        title: "Access Granted!",
        description: "You can now access the study materials.",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to validate password. Please try again.";
      
      if (error.message.includes("401")) {
        errorMessage = "Invalid password. Please check your access code and try again.";
      } else if (error.message.includes("429")) {
        errorMessage = "Too many attempts. Please wait 15 minutes before trying again.";
      }
      
      toast({
        title: "Access Denied",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the access code.",
        variant: "destructive",
      });
      return;
    }

    validatePasswordMutation.mutate({
      subjectSlug: subject.slug,
      password: password.trim(),
    });
  };

  const handleClose = () => {
    setPassword("");
    setShowSuccess(false);
    setAccessUrl("");
    validatePasswordMutation.reset();
    onClose();
  };

  const handleAccessMaterials = () => {
    if (accessUrl) {
      window.open(accessUrl, "_blank");
      handleClose();
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Access Granted!</h3>
            <p className="text-slate-600 mb-6">
              You can now access the {subject.name} study materials.
            </p>
            
            <Button
              onClick={handleAccessMaterials}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Study Materials
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="text-white w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
              Secure Access Required
            </DialogTitle>
            <p className="text-slate-600">
              Enter the access code to unlock {subject.name} materials
            </p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Access Code
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              disabled={validatePasswordMutation.isPending}
            />
          </div>
          
          {validatePasswordMutation.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validatePasswordMutation.error.message.includes("401") 
                  ? "Invalid access code. Please try again."
                  : validatePasswordMutation.error.message.includes("429")
                  ? "Too many attempts. Please wait 15 minutes before trying again."
                  : "Failed to validate password. Please try again."
                }
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex space-x-3">
            <Button 
              type="button" 
              onClick={handleClose}
              variant="outline"
              className="flex-1 px-6 py-3 rounded-xl"
              disabled={validatePasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors flex items-center justify-center"
              disabled={validatePasswordMutation.isPending || !password.trim()}
            >
              {validatePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Materials"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
