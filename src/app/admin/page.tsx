import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
          <CardDescription>
            This is your central hub. Use the sidebar to navigate to different modules and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can start by configuring your organization's information and managing active modules in the 'Settings' panel.</p>
        </CardContent>
      </Card>
    </div>
  );
}
