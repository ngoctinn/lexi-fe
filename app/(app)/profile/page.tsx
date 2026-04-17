import { ProfileForm } from "@/features/profile";
import { getProfile } from "@/features/profile/api/profile.actions";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { UserRound } from "lucide-react";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={UserRound} title="Hồ sơ cá nhân" />
      
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl animate-in fade-in duration-700">
          <ProfileForm initialData={profile} />
        </div>
      </div>
    </div>
  );
}
