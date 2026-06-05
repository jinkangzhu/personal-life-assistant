import { requireSession } from "@/lib/session";
import { PageShell } from "@/components/layout/page-shell";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfileSettingsPage() {
  const session = await requireSession();

  return (
    <PageShell title="个人资料" description="头像、昵称与账户安全">
      <Card>
        <CardHeader>
          <CardTitle>头像</CardTitle>
        </CardHeader>
        <AvatarUpload user={session} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <ProfileForm email={session.email} displayName={session.displayName} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <PasswordForm />
      </Card>
    </PageShell>
  );
}
