import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ChapterModal from "./chapter-modal";
import PasswordModal from "./password-modal";
import type { Subject } from "@shared/schema";

interface SubjectWithCount extends Subject {
  chapterCount: number;
}

export default function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithCount | null>(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: subjects = [], isLoading } = useQuery<SubjectWithCount[]>({
    queryKey: ["/api/subjects"],
  });

  const handleSubjectClick = (subject: SubjectWithCount) => {
    setSelectedSubject(subject);
    if (subject.type === "premium") {
      setShowPasswordModal(true);
    } else {
      setShowChapterModal(true);
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setShowChapterModal(true);
  };

  const getSubjectIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      orange: "text-orange-600 bg-orange-100",
      purple: "text-purple-600 bg-purple-100",
      indigo: "text-indigo-600 bg-indigo-100",
      red: "text-red-600 bg-red-100",
    };
    return colorMap[color] || "text-blue-600 bg-blue-100";
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Access Study Materials</h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
            Access MSCIT (open access) and KLiC Hardware (premium) study materials. Premium subjects require a password to view chapter-wise PDF content.
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="hover:shadow-material-lg transition-shadow cursor-pointer"
              onClick={() => handleSubjectClick(subject)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSubjectIconColor(subject.color)}`}>
                    <i className={`${subject.icon} text-xl`}></i>
                  </div>
                  <Badge 
                    variant={subject.type === "premium" ? "destructive" : "secondary"}
                    className={subject.type === "premium" ? "bg-accent text-white" : "bg-secondary text-white"}
                  >
                    {subject.type === "premium" ? "Premium" : "Open"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{subject.name}</h3>
                <p className="text-sm text-neutral-700 mb-4">{subject.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">{subject.chapterCount} Chapters</span>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800 p-0">
                    Access {subject.type === "premium" ? 
                      <i className="fas fa-lock ml-1"></i> : 
                      <i className="fas fa-arrow-right ml-1"></i>
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedSubject && (
        <>
          <ChapterModal
            isOpen={showChapterModal}
            onClose={() => setShowChapterModal(false)}
            subject={selectedSubject}
          />
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            subject={selectedSubject}
            onSuccess={handlePasswordSuccess}
          />
        </>
      )}
    </>
  );
}
