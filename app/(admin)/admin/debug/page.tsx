import { getAdminUsers, getAdminScenarios } from "@/features/admin/actions/admin.actions";
import { getProfile } from "@/features/profile/api/profile.actions";

export default async function AdminDebugPage() {
  console.log("=== ADMIN DEBUG PAGE ===");
  
  // Get profile to check role
  const profile = await getProfile();
  console.log("Profile:", profile);
  
  // Get users
  const users = await getAdminUsers();
  console.log("Users fetched:", users.length);
  
  // Get scenarios
  const scenarios = await getAdminScenarios();
  console.log("Scenarios fetched:", scenarios.length);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Debug Page</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Profile</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Users ({users.length})</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(users, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Scenarios ({scenarios.length})</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(scenarios, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
