import * as Location from "expo-location";
import {ILocation} from "@/types/Location";
export function useLocation() {
    const getLocation = async (): Promise<{ location: ILocation | null;}> => {
        const result: ILocation | null = await new Promise(async (resolve) => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let shouldResolve = true;
                let timer: ReturnType<typeof setTimeout>;
                Location.getCurrentPositionAsync().then((location) => {
                    if (shouldResolve) {
                        clearTimeout(timer);
                        if(location) {
                            resolve({
                                lat: location.coords.latitude,
                                lon: location.coords.longitude,
                            })
                        } else {
                            resolve(null);
                        }
                    }
                });

                timer = setTimeout(() => {
                    shouldResolve = false;
                    resolve(null);
                }, 10000);
            } else {
                resolve(null);
            }
        });
        return { location: result};
    };


    return {getLocation}

}