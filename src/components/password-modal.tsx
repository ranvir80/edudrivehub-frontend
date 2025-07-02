import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Subject } from "@shared/schema";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  onSuccess: () => void;
}

export default function PasswordModal({ isOpen, onClose, subject, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/subjects/verify-password", {
        subject: subject.name,
        password,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Access granted",
        description: "You can now access the premium content.",
      });
      setPassword("");
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Access denied",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      verifyMutation.mutate(password);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lock text-accent text-2xl"></i>
            </div>
            <DialogTitle className="text-xl font-semibold text-neutral-900 mb-2">Premium Content</DialogTitle>
            <p className="text-sm text-neutral-700">This subject requires a password to access premium materials.</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Enter Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter subject password"
              className="w-full"
              disabled={verifyMutation.isPending}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={verifyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-blue-700"
              disabled={verifyMutation.isPending || !password.trim()}
            >
              {verifyMutation.isPending ? "Verifying..." : "Access Content"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
