import Header from "@/components/header";
import Hero from "@/components/hero";
import SubjectCard from "@/components/subject-card";
import Features from "@/components/features";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { type Subject } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const { data: subjects, isLoading, error } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Hero />
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Available Subjects
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose from our carefully curated collection of study materials. Each subject offers comprehensive resources for your learning journey.
            </p>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-3/4 mb-3" />
                  <Skeleton className="h-20 w-full mb-6" />
                  <div className="space-y-3 mb-6">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-5 w-2/3" />
                    ))}
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to load subjects. Please refresh the page or try again later.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {subjects && subjects.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          )}

          {subjects && subjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No subjects available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <Features />
      <Footer />
    </div>
  );
}
