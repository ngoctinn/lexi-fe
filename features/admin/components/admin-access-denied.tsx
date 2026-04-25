import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Full-page blocking banner for non-admin users
 * Prevents access to admin features
 */
export function AdminAccessDenied() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-6 p-6">
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="ml-2 text-base font-semibold">
            Truy cập bị từ chối
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Khu vực dành cho quản trị viên
          </h1>
          
          <p className="text-muted-foreground">
            Bạn không có quyền truy cập trang này. Chỉ những người dùng có vai trò quản trị viên mới có thể vào.
          </p>

          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Để có quyền truy cập:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Liên hệ với quản trị viên hệ thống</li>
              <li>Yêu cầu được nâng cấp vai trò thành admin</li>
              <li>Đăng nhập lại sau khi được cấp quyền</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              Trang chủ
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với hỗ trợ.
        </p>
      </div>
    </div>
  );
}
