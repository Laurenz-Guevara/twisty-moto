import FeaturedRoutes from "@/components/featured-routes";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconEyeOff, IconFileExport, IconHeartPlus, IconMapPin, IconRoute, IconShare2 } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="container mx-auto md:pt-24 px-6 space-y-40">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl tracking-tighter sm:text-5xl">
            Discover Amazing Motorbike Routes
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Explore the world&apos;s most scenic roads and share your own
            adventures with fellow riders.
          </p>
          <div className="space-x-4 pt-4">
            <Button className="hover:cursor-pointer" asChild>
              <Link
                prefetch={false}
                href={"/api/auth/register"}
              >
                Create Free Account
              </Link>
            </Button>
            <Button variant="secondary" className="hover:cursor-pointer" asChild>
              <Link href="/community-routes">
                View Community Routes
              </Link>
            </Button>
          </div>
        </div>
        <FeaturedRoutes />
        <div>
          <h2 className="text-3xl tracking-tighter sm:text-5xl pb-10 text-center">Our Features</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><IconRoute /><span>Route Editor</span></CardTitle>
                <CardDescription>Create, customize, and fine-tune your rides with our intuitive route editor. Adjust paths, add waypoints, and design the perfect journey before you hit the road.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><IconShare2 /><span>Community Sharing</span></CardTitle>
                <CardDescription>Share your favorite routes with the community or keep them private. Discover hidden gems from riders around the world.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><IconEyeOff /><span>Privacy Controls</span></CardTitle>
                <CardDescription>Full control over your routes. Choose what to share publicly and what to keep for yourself and your riding crew.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><IconMapPin /><span>Interactive Maps</span></CardTitle>
                <CardDescription>High-quality maps with satellite and terrain views. See every curve, elevation change, and point of interest along your route.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><IconFileExport /><span>GPS Export</span></CardTitle>
                <CardDescription>Use our GPX export feature to easily transfer and load your route onto your GPS device.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><IconHeartPlus /><span>Quick Access</span></CardTitle>
                <CardDescription>Favorite your best routes for instant access to find your perfect ride.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        <div>
          <h3 className="text-3xl tracking-tighter sm:text-5xl pb-10 text-center">
            Everything You Need To Plan Your Ride
          </h3>
          <Image
            src={"/splash-route-editor-dark.png"}
            alt={"Route Editor Preview"}
            width={1480}
            height={910}
            className="hidden dark:block rounded-2xl"
          />
          <Image
            src={"/splash-route-editor-light.png"}
            alt={"Route Editor Preview"}
            width={1480}
            height={910}
            className="dark:hidden rounded-2xl shadow"
          />
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 text-center pb-40">
          <h4 className="text-3xl tracking-tighter sm:text-5xl">Ready To Hit The Road?</h4>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Start planning your next adventure today. Create, share, and ride the routes that matter.
          </p>
          <div className="space-x-4 pt-4">
            <Button className="hover:cursor-pointer" asChild>
              <Link
                prefetch={false}
                href={"/api/auth/register"}
              >
                Create Free Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
