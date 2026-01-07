import NavigationBar from "@/components/navigation-bar";
import Footer from "@/components/footer";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <div className="pt-[65px]"></div>
      {children}
      <Footer />
    </>
  );
}
