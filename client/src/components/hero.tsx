import { Shield, Cloud, Smartphone } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Study Materials Vault
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Secure access to premium educational resources. Your gateway to comprehensive study materials and certification preparation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center text-blue-100">
            <Shield className="w-5 h-5 mr-2" />
            <span>Secure Access</span>
          </div>
          <div className="flex items-center text-blue-100">
            <Cloud className="w-5 h-5 mr-2" />
            <span>Cloud Storage</span>
          </div>
          <div className="flex items-center text-blue-100">
            <Smartphone className="w-5 h-5 mr-2" />
            <span>Mobile Friendly</span>
          </div>
        </div>
      </div>
    </section>
  );
}
