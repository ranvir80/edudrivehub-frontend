import Navigation from "@/components/navigation";
import StudentDashboard from "@/components/student-dashboard";

export default function Home() {
  return (
    <div className="font-inter bg-neutral-50 text-neutral-900 antialiased min-h-screen">
      <Navigation />
      <StudentDashboard />
      
      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white"></i>
              </div>
              <span className="text-lg font-semibold">EduDriveHub</span>
            </div>
            <p className="text-neutral-400 text-sm">© 2024 Nakshatra Infotech. All rights reserved.</p>
            <p className="text-neutral-500 text-xs mt-2">Secure document management for educational institutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
