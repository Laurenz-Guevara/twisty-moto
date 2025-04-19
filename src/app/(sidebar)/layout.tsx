import { AppSidebar } from "@/components/app-sidebar";
// import NavigationBar from "@/components/navigation-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = getKindeServerSession();
  return (await isAuthenticated())
    ? (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <BreadcrumbNavigation />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
    : (
      <div className="py-4">
        To access this you must be logged in, please&nbsp;
        <RegisterLink className="text-green-600">Login</RegisterLink>&nbsp;to
        view it. Or alternatively&nbsp;
        <RegisterLink className="text-green-600">Register</RegisterLink>&nbsp;
        an account.
      </div>
    );
}

function BreadcrumbNavigation() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/my-routes">My Routes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            Route Editor
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Unnamed Route</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
