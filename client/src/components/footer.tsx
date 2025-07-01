import { GraduationCap, Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold">Nakshatra Infotech EduDriveHub</h3>
          </div>
          <p className="text-slate-300 mb-6">Empowering education through secure digital resources</p>
          <div className="flex justify-center space-x-6 text-slate-400 mb-8">
            <a href="#" className="hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 text-slate-400 text-sm">
            <p>&copy; 2024 Nakshatra Infotech. All rights reserved. | Secure Educational Platform</p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
              <span>Created by Ranvir Pardeshi</span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="mailto:pardeshiranvir000@outlook.com" 
                className="hover:text-white transition-colors"
              >
                pardeshiranvir000@outlook.com
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://ranvirpardeshi.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                ranvirpardeshi.vercel.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
