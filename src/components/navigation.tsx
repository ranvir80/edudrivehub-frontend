import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const isAdminView = location === "/admin";

  const handleViewToggle = () => {
    setLocation(isAdminView ? "/" : "/admin");
  };

  return (
    <nav className="bg-white shadow-material sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">EduDriveHub</h1>
              <p className="text-xs text-neutral-700">Nakshatra Infotech</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleViewToggle}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <i className={`fas ${isAdminView ? 'fa-users' : 'fa-user-shield'} mr-2`}></i>
              {isAdminView ? 'Student View' : 'Admin View'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
