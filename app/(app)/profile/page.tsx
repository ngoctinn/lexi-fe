import { ProfileForm } from "@/features/profile";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-2">Quản lý không gian cá nhân và thiết lập ngôn ngữ của bạn.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
