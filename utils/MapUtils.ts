import {CameraPosition} from "react-native-yamap";

export const getCurrentPosition = (map: any) => {
    return new Promise<CameraPosition>((resolve) => {
        if (map.current) {
            map.current.getCameraPosition((position: any) => {
                resolve(position);
            });
        }
    });
}

export const zoomUp = async (map: any) => {
    const position = await getCurrentPosition(map);
    if (map.current) {
        map.current.setZoom(position.zoom * 1.1, 0.1);
    }
}

export const zoomDown = async (map: any) => {
    const position = await getCurrentPosition(map);
    if (map.current) {
        map.current.setZoom(position.zoom * 0.9, 0.1);
    }
}

export const onMoveToMarkers = (map: any, LAT: number, LON: number) => {
    if (map.current) {
        map.current.setCenter({lat: LAT, lon: LON}, 18)
    }
}