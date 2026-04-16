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
    <div className="flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-8 animate-in fade-in duration-700">
      <PageHeader icon={UserRound} title="Hồ sơ cá nhân" />
      <ProfileForm initialData={profile} />
    </div>
  );
}
