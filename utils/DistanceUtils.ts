import {ILocation} from "@/types/Location";

const DEFAULT_RADIUS = 6371e3;
function toRadians(value: number): number {
    return value / 180 * Math.PI;
}
export function findDistance(start: ILocation, destination: ILocation, radius: number = DEFAULT_RADIUS): number {

    const dLat = toRadians(destination.lat-start.lat);  // deg2rad below
    const dLon = toRadians(destination.lon-start.lon);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRadians(start.lat)) * Math.cos(toRadians(destination.lat)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return radius * c;
}