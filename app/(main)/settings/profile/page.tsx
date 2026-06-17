import { requireSession } from "@/lib/session";
import { PageShell } from "@/components/layout/page-shell";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import {
  SettingsNav,
  SettingsPageLayout,
} from "@/components/settings/settings-ui";
import {
  ModuleAccent,
  ModulePanel,
  ModuleSectionPanel,
} from "@/components/ui/module-ui";

export default async function ProfileSettingsPage() {
  const session = await requireSession();

  return (
    <PageShell
      title="个人资料"
      description="头像、昵称与登录密码"
    >
      <SettingsPageLayout>
        <SettingsNav />

        <ModulePanel module="profile">
          <ModuleAccent module="profile" className="mb-6 max-w-sm" />
          <AvatarUpload user={session} />
        </ModulePanel>

        <ModuleSectionPanel
          module="profile"
          title="基本信息"
          description="邮箱用于登录，不可修改"
        >
          <ProfileForm email={session.email} displayName={session.displayName} />
        </ModuleSectionPanel>

        <ModuleSectionPanel
          module="profile"
          title="账户安全"
          description="定期更换密码，保护账户安全"
        >
          <PasswordForm />
        </ModuleSectionPanel>
      </SettingsPageLayout>
    </PageShell>
  );
}
