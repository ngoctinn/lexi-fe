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
    <main className="flex min-h-screen flex-col px-4 py-4 md:px-8 md:py-8">
      <PageHeader icon={UserRound} title="Hồ sơ cá nhân" />

      <div className="mx-auto w-full max-w-4xl animate-in fade-in duration-700">
        <ProfileForm initialData={profile} />
      </div>
    </main>
  );
}
