export function convertToMiles(distanceInMeters: number): number {
  const miles = distanceInMeters / 1609.344;
  return Math.round(miles * 10) / 10;
}
