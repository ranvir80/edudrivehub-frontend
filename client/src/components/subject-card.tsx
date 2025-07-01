import { useState } from "react";
import { type Subject } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Key, ArrowRight, Cpu, Monitor } from "lucide-react";
import PasswordModal from "./password-modal";

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "microchip":
        return <Cpu className="text-white text-2xl w-8 h-8" />;
      case "desktop":
        return <Monitor className="text-white text-2xl w-8 h-8" />;
      default:
        return <Cpu className="text-white text-2xl w-8 h-8" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "amber":
        return {
          icon: "from-amber-400 to-orange-500",
          badge: "bg-amber-100 text-amber-800",
          button: "bg-amber-500 hover:bg-amber-600",
        };
      case "green":
        return {
          icon: "from-green-500 to-green-600",
          badge: "bg-green-100 text-green-800",
          button: "bg-green-500 hover:bg-green-600",
        };
      default:
        return {
          icon: "from-blue-500 to-blue-600",
          badge: "bg-blue-100 text-blue-800",
          button: "bg-blue-500 hover:bg-blue-600",
        };
    }
  };

  const colors = getColorClasses(subject.color);

  const handleAccess = () => {
    if (subject.isProtected) {
      setShowPasswordModal(true);
    } else {
      window.open(subject.accessUrl, "_blank");
    }
  };

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${colors.icon} rounded-xl flex items-center justify-center`}>
              {getIcon(subject.icon)}
            </div>
            <Badge className={colors.badge}>
              {subject.isProtected ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Premium Course
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 mr-1" />
                  Open Course
                </>
              )}
            </Badge>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{subject.name}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {subject.description}
          </p>
          
          <div className="space-y-3 mb-6">
            {subject.features.map((feature, index) => (
              <div key={index} className="flex items-center text-slate-600">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  {feature.includes("PDF") && <i className="fas fa-file-pdf text-red-500"></i>}
                  {feature.includes("Google") && <i className="fab fa-google-drive text-blue-500"></i>}
                  {feature.includes("Download") && <i className="fas fa-download text-green-500"></i>}
                  {feature.includes("Computer") && <i className="fas fa-desktop text-blue-500"></i>}
                  {feature.includes("Internet") && <i className="fas fa-globe text-green-500"></i>}
                  {feature.includes("eLearning") && <i className="fas fa-graduation-cap text-purple-500"></i>}
                  {feature.includes("Government") && <i className="fas fa-briefcase text-orange-500"></i>}
                  {feature.includes("Official") && <i className="fas fa-globe text-blue-500"></i>}
                  {feature.includes("Certification") && <i className="fas fa-certificate text-purple-500"></i>}
                  {feature.includes("Direct") && <i className="fas fa-external-link-alt text-green-500"></i>}
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleAccess}
            className={`w-full ${colors.button} text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center`}
          >
            {subject.isProtected ? (
              <>
                <Key className="w-4 h-4 mr-2" />
                Enter Access Code
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Access Materials
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {subject.isProtected && (
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          subject={subject}
        />
      )}
    </>
  );
}
