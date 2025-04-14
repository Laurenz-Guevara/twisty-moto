import NavigationBar from "@/components/navigation-bar";
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
      <>
        <NavigationBar />
        {children}
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
