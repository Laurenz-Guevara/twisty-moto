import { SidebarNav } from "@/components/sidebar-nav";
import { Separator } from "@/components/ui/separator";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/account/profile",
  },
  {
    title: "Settings",
    href: "/account/settings",
  },
  {
    title: "Manage Payments",
    href: "/account/manage-payments",
  },
  {
    title: "Notifications",
    href: "/account/notifications",
  },
];

export default async function SettingsLayout(
  { children }: { children: React.ReactNode },
) {
  return (
    <>
      <div className="container mx-auto">
        <div className="space-y-6 py-10 px-7 pb-16">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">
              Account Management
            </h2>
            <p className="text-muted-foreground">
              Manage your account settings and payment preferences.
            </p>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
