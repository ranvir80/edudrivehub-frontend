import { Shield, Cloud, Smartphone } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Shield,
      title: "Secure Access",
      description: "Advanced password protection with bcrypt hashing and rate limiting for maximum security.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description: "Seamless Google Drive integration for reliable access to your study materials anywhere.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Fully responsive design ensures perfect experience across all devices and screen sizes.",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose EduDriveHub?</h2>
          <p className="text-lg text-slate-600">Built with security and user experience in mind</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
