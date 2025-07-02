import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema } from "@shared/schema";
import { z } from "zod";
import type { Chapter } from "@shared/schema";

const uploadSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  chapterTitle: z.string().min(1, "Chapter title is required"),
  pdf: z.any().refine((files) => files?.length == 1, "PDF file is required"),
});

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const uploadForm = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      subject: "",
      chapterTitle: "",
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: recentChapters = [] } = useQuery<Chapter[]>({
    queryKey: ["/api/admin/recent-chapters"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const res = await fetch("/api/admin/recent-chapters", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch recent chapters");
      return res.json();
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    enabled: isLoggedIn,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const res = await apiRequest("POST", "/api/admin/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      setIsLoggedIn(true);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.admin.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof uploadSchema>) => {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("chapterTitle", data.chapterTitle);
      formData.append("pdf", data.pdf[0]);

      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chapter uploaded successfully",
        description: "The chapter has been added to the system.",
      });
      uploadForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/recent-chapters"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Chapter deleted",
        description: "The chapter has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/recent-chapters"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card className="shadow-material">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-shield text-primary text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Admin Login</h2>
              <p className="text-neutral-700">Sign in to manage course materials</p>
            </div>

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@nakshatra.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
              <p className="text-xs text-neutral-600">
                <i className="fas fa-shield-alt mr-1"></i>
                Protected by rate limiting and secure authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Admin Dashboard</h2>
        <p className="text-lg text-neutral-700">Manage course materials and uploads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Subjects</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.totalSubjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-book text-blue-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Chapters</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.totalChapters || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-pdf text-green-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Premium Subjects</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.premiumSubjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-lock text-orange-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Recent Uploads</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.recentUploads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-upload text-purple-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <i className="fas fa-plus-circle text-primary mr-2"></i>Upload New Chapter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...uploadForm}>
            <form onSubmit={uploadForm.handleSubmit((data) => uploadMutation.mutate(data))} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={uploadForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={uploadForm.control}
                name="chapterTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chapter 1: Introduction to Calculus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={uploadForm.control}
                name="pdf"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>PDF File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => onChange(e.target.files)}
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  <i className="fas fa-upload mr-2"></i>
                  {uploadMutation.isPending ? "Uploading..." : "Upload Chapter"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Recent Uploads Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <i className="fas fa-history text-primary mr-2"></i>Recent Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentChapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-file-pdf text-blue-600 text-sm"></i>
                      </div>
                      <span className="font-medium">{chapter.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell>{chapter.chapterTitle}</TableCell>
                  <TableCell>{new Date(chapter.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteMutation.mutate(chapter.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
