import React, {createRef, Dispatch, FC, RefObject} from 'react';
import {Image, LayoutChangeEvent, Text, TouchableOpacity, View} from "react-native";
import Animated from "react-native-reanimated";
import YaMap, {Marker} from "react-native-yamap";
import MarkerBlueDot from "@/components/map_markers/MarkerBlueDot";
import MarkerBlue from "@/components/map_markers/MarkerBlue";
import {Maps} from "@/constants/Maps";
import {onMoveToMarkers, zoomDown, zoomUp} from "@/utils/MapUtils";
import {AntDesign} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {fsz, pos} from "@/constants/rStyle";
import {MARKER_BLUE} from "@/assets/images";
import {ILocation} from "@/types/Location";


interface PropsMapView {
    onMapLayout: (event: any) => void;
    styleScale: any;
    mapLocation: ILocation | null;
    mapHeight: number;
    akciya: string
}
const MapView: FC<PropsMapView> = (props) => {
    const map = createRef<YaMap>();

    return (
        <View style={{flex: 1, borderRadius: 8, overflow: "hidden"}} onLayout={(event) => props.onMapLayout(event)}>
            <Animated.View style={props.styleScale}>
                {props.mapLocation
                    ?
                    <>
                        <YaMap
                            ref={map}
                            showUserPosition={true}
                            followUser={false}
                            initialRegion={{
                                lat: props.mapLocation.lat,
                                lon: props.mapLocation.lon,
                                zoom: 18,
                                azimuth: 0,
                            }}
                            style={{height: props.mapHeight}}
                        >
                            <Marker point={{lat: props.mapLocation.lat, lon: props.mapLocation.lon}} children={props.akciya.length > 0 ? <MarkerBlueDot /> : <MarkerBlue />}/>
                        </YaMap>

                        <View style={Maps.buttonsBlock}>
                            <TouchableOpacity onPress={() => zoomUp(map)} style={Maps.buttonWrapper}>
                                <View style={Maps.button}>
                                    <AntDesign name="plus" size={24} color={Colors.black} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => zoomDown(map)} style={Maps.buttonWrapper}>
                                <View style={Maps.button}>
                                    <AntDesign name="minus" size={24} color={Colors.black} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onMoveToMarkers(map, props.mapLocation!.lat, props.mapLocation!.lon)} style={[Maps.buttonWrapper, { marginTop: pos.mb32}] }>
                                <View style={Maps.button}>
                                    <Image source={MARKER_BLUE} style={[Maps.icon, { left: 2, top: 1}]} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                    :
                    <View style={{ alignItems: "center", justifyContent: "center", height: props.mapHeight}}>
                        <Text style={{fontSize: fsz.s18, color: Colors.white}}>Координаты аптеки не указаны</Text>
                    </View>
                }
            </Animated.View>
        </View>
    );
};

export default MapView;