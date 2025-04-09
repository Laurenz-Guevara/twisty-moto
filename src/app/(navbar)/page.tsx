import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="container mx-auto py-8 md:py-12 px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Discover Amazing Motorbike Routes
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Explore the world's most scenic roads and share your own adventures
            with fellow riders.
          </p>
        </div>
      </section>
      <section className="mx-auto container py-8 px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={route.image || "/placeholder-map.png"}
                  alt={route.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{route.title}</h3>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {route.location}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {route.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-0.5">
                    <Star className="h-5 w-5 text-green-600 fill-green-600" />
                    <Star className="h-5 w-5 text-green-600 fill-green-600" />
                    <Star className="h-5 w-5 text-green-600 fill-green-600" />
                    <Star className="h-5 w-5 text-green-600 fill-green-600" />
                    <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      className="hover:cursor-pointer"
                      variant="outline"
                      size="sm"
                    >
                      View Route
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const routes = [
  {
    id: 1,
    title: "Pacific Coast Highway",
    description:
      "A stunning coastal ride along California's rugged shoreline with breathtaking ocean views.",
    location: "California, USA",
    image: "/placeholder-map.png",
  },
  {
    id: 2,
    title: "Transfăgărășan Highway",
    description:
      "One of the most spectacular mountain roads with hairpin turns and alpine scenery.",
    location: "Carpathian Mountains, Romania",
    image: "/placeholder-map.png",
  },
  {
    id: 3,
    title: "Great Ocean Road",
    description:
      "Coastal journey featuring the famous Twelve Apostles limestone formations.",
    location: "Victoria, Australia",
    image: "/placeholder-map.png",
  },
  {
    id: 4,
    title: "Amalfi Coast",
    description:
      "Winding coastal roads with picturesque villages and Mediterranean views.",
    location: "Campania, Italy",
    image: "/placeholder-map.png",
  },
  {
    id: 5,
    title: "Route 66",
    description:
      "The historic Mother Road crossing through the heart of America.",
    location: "Chicago to Santa Monica, USA",
    image: "/placeholder-map.png",
  },
  {
    id: 6,
    title: "North Coast 500",
    description:
      "Scotland's ultimate road trip through the stunning Highlands.",
    location: "Scottish Highlands, UK",
    image: "/placeholder-map.png",
  },
  {
    id: 7,
    title: "Trollstigen",
    description:
      "Serpentine mountain road with 11 hairpin bends and waterfalls.",
    location: "Rauma, Norway",
    image: "/placeholder-map.png",
  },
  {
    id: 8,
    title: "Hai Van Pass",
    description:
      "Mountain pass with panoramic views of the coastline made famous by Top Gear.",
    location: "Central Vietnam",
    image: "/placeholder-map.png",
  },
];
