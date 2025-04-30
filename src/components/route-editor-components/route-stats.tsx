import { useRouteStore } from "@/app/stores/useRouteStore";
import { Label } from "@/components/ui/label";

export default function RouteStats() {
  const storedRouteStats = useRouteStore((s) => s.routeStats);

  function convertToMiles(distanceInMeters: number): number {
    const miles = distanceInMeters / 1609.344;
    return Math.round(miles * 10) / 10;
  }

  function formatDurationHoursMinutes(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  return (
    <div className="space-y-2">
      <Label>Route Stats</Label>
      <div className="rounded-md border py-2 px-4 text-sm">
        <div className="flex justify-between py-1">
          <span>Distance:</span>
          {storedRouteStats.distance !== undefined
            ? (
              <span className="font-medium">
                {convertToMiles(storedRouteStats.distance)} miles
              </span>
            )
            : <span>0 km</span>}
        </div>
        <div className="flex justify-between py-1">
          <span>Est. Time:</span>
          {storedRouteStats.duration !== undefined
            ? (
              <span className="font-medium">
                {formatDurationHoursMinutes(storedRouteStats.duration)}
              </span>
            )
            : <span className="font-medium">0h 0m</span>}
        </div>
      </div>
    </div>
  );
}
