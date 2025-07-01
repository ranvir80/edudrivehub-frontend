import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Subject } from "@shared/schema";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function SubjectAccess() {
  const [, params] = useRoute("/subject/:slug");
  const slug = params?.slug;

  const { data: subject, isLoading, error } = useQuery<Subject>({
    queryKey: [`/api/subjects/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading subject...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Subject Not Found</h1>
              <p className="text-slate-600 mb-6">
                The subject you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                <ArrowLeft className="w-4 h-4" />
                Back to Subjects
              </Button>
            </Link>
          </div>

          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-12">
              <div className="text-center">
                <div className={`w-24 h-24 bg-gradient-to-br ${
                  subject.color === 'amber' 
                    ? 'from-amber-400 to-orange-500' 
                    : 'from-green-500 to-green-600'
                } rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <i className={`fas fa-${subject.icon} text-white text-3xl`}></i>
                </div>
                
                <h1 className="text-4xl font-bold text-slate-800 mb-4">
                  {subject.name}
                </h1>
                
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {subject.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {subject.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-center text-slate-700">
                      <i className={`fas fa-${
                        feature.includes('PDF') ? 'file-pdf text-red-500' :
                        feature.includes('Google') ? 'google-drive text-blue-500' :
                        feature.includes('Download') ? 'download text-green-500' :
                        feature.includes('Computer') ? 'desktop text-blue-500' :
                        feature.includes('Internet') ? 'globe text-green-500' :
                        feature.includes('eLearning') ? 'graduation-cap text-purple-500' :
                        feature.includes('Government') ? 'briefcase text-orange-500' :
                        feature.includes('Official') ? 'globe text-blue-500' :
                        feature.includes('Certification') ? 'certificate text-purple-500' :
                        'external-link-alt text-green-500'
                      } mr-3`}></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={subject.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-8 py-4 ${
                    subject.color === 'amber' 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white font-semibold rounded-xl transition-colors duration-200 text-lg`}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Access Study Materials
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
