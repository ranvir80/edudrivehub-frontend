import Navigation from "@/components/navigation";
import AdminDashboard from "@/components/admin-dashboard";

export default function Admin() {
  return (
    <div className="font-inter bg-neutral-50 text-neutral-900 antialiased min-h-screen">
      <Navigation />
      <AdminDashboard />
    </div>
  );
}
