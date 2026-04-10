import { ProfileForm } from "@/features/profile";
import { getProfile } from "@/features/profile/api/profile.actions";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex-1 p-4 md:p-8 animate-in fade-in duration-700 max-w-5xl w-full space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý định danh và thiết lập lộ trình học tập của bạn.</p>
      </div>
      <ProfileForm initialData={profile} />
    </div>
  );
}
