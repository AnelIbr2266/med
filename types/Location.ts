import {IAppTochki} from "@/types/Tochki";

export interface ILocation {
    lat: number;
    lon: number;
}
export interface ILocationClaster {
    id: number;
    point: {
        lat: number;
        lon: number;
    };
    akciya: boolean;
    marker: any;
    tochka: IAppTochki;
}

export interface IIsLocation {
    android: boolean;
    gps: boolean;
}
