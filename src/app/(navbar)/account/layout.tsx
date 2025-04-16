import { SidebarNav } from "@/components/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

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
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout(
  { children }: SettingsLayoutProps,
) {
  const { isAuthenticated } = getKindeServerSession();
  return (await isAuthenticated())
    ? (
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
    )
    : (
      <div className="py-4">
        To access this you must be logged in, please&nbsp;
        <RegisterLink className="text-green-600">Login</RegisterLink>&nbsp;to
        view it. Or alternatively&nbsp;
        <RegisterLink className="text-green-600">Register</RegisterLink>{" "}
        an account.
      </div>
    );
}
