import {Text, View, LayoutChangeEvent, TouchableOpacity, SafeAreaView} from "react-native";
import {Redirect, useLocalSearchParams, useRouter} from "expo-router";
import React, {createRef, useEffect, useState} from "react";
import {FontAwesome6, Ionicons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {IAppVizity} from "@/types/Vizity";
import {IAppTochki} from "@/types/Tochki";
import sqlVizity from "@/sql/user/sqlVizity";
import sqlTochki from "@/sql/user/sqlTochki";
import sqlSettings from "@/sql/user/sqlSettings";
import ModalAkciya from "@/components/modals/ModalAkciya";
import ModalOprosnik from "@/components/modals/ModalOprosnik";
import ModalDeteiling from "@/components/modals/ModalDeteiling";
import {ILocation} from "@/types/Location";
import sqlDeteiling from "@/sql/user/sqlDeteiling";
import {fsz, pos, rStyle} from "@/constants/rStyle";
import {useAuth} from "@/context/AuthContext";
import VizitInfo from "@/components/items/VizitInfo";
import {VizityViewButtons} from "@/components/items/VizityViewButtons";
import LoadingStart from "@/components/LoadingStart";
import MapView from "@/components/map/MapView";


const VizityCompletedView = () => {
    const {isTabled} = useAuth();
    const {getVizityOne} = sqlVizity();
    const {getTochkiOne} = sqlTochki();
    const {getSettings} = sqlSettings();
    const {getDeteilingQuery} = sqlDeteiling();
    const router = useRouter();
    const {id} = useLocalSearchParams<any>();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [vizit, setVizit] = useState<IAppVizity | null>(null);
    const [tochka, setTochka] = useState<IAppTochki | null>(null);
    const [deteiling, setDeteiling] = useState<any | null>(null);
    const [deteilingItems, setDeteilingItems] = useState<any | null>(null);

    const [showModalAkciya, setShowModalAkciya] = useState<boolean>(false);
    const [showModalOprosnik, setShowModalOprosnik] = useState<boolean>(false);
    const [showModalDeteiling, setShowModalDeteiling] = useState<boolean>(false);

    const [viewButtons, setViewButtons] = useState<any>();
    const [mapLocation, setMapLocation] = useState<ILocation | null>(null);

    const [mapHeight, setMapHeight] = useState<number>(500);
    const showMapHeight = useSharedValue(0);

    const styleScale = useAnimatedStyle(() => {
        return {
            transform: [{scale: withTiming(showMapHeight.value)}],
        };
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            const insert = await new Promise(async (resolve) => {
                const sql  = `AND id = "${id}"`;
                await getVizityOne('*', sql).then(async ({app_vizit, error}) => {
                    if (app_vizit) {
                        await getTochkiOne(`*`, `AND elm___id = "${app_vizit.elm_tochka}"`).then(async ({app_tochka}) => {
                            if (app_tochka) {
                                setVizit(app_vizit);
                                setTochka(app_tochka);

                                if (app_tochka.elm_geokoordinaty) {
                                    setMapLocation({
                                        lat: Number(app_tochka.elm_geokoordinaty.split(',')[0]),
                                        lon: Number(app_tochka.elm_geokoordinaty.split(',')[1])
                                    });
                                }

                                await updateSelect(app_vizit);
                            }
                        });
                    }
                    setError(error);
                });
                resolve(true)
            });
            if(insert) {
                setTimeout(() => {
                    setLoading(false);
                    setTimeout(() => {
                        showMapHeight.value = 1;
                    }, 400);
                }, 300);
            }
        })()
    }, [id]);


    if(loading) {
        return <LoadingStart />
    }


    if (!vizit || !tochka) {
        return <Redirect href="/(authentificated)/(tabs)/visity" />;
    }

    async function updateSelect(vizit: any): Promise<boolean> {
        return await new Promise(async (resolve) => {
            await getSettings('*', `AND elm_table = "vizity"`).then(async ({app_settings}) => {
                if (app_settings) {
                    const elm_fields = JSON.parse(app_settings[0].elm_fields);

                    const objAkciya = {} as any
                    const objAktivnost = {} as any
                    const objOprosnik = {} as any

                    const arrAkciya = [] as any
                    const arrAktivnost = [] as any
                    const arrOprosnik = [] as any
                    const deteilingItems = [] as any

                    Object.fromEntries(Object.entries(vizit).filter(([key, value]) => {
                        if (key.toLowerCase().includes("akciya_na_pokupatelya") && key.toLowerCase().includes("elm_oprosnik") && value) {
                            objAkciya[key] = value;
                        }
                        if (key.toLowerCase().includes("prochie_aktivnosti") && key.toLowerCase().includes("elm_oprosnik") && value) {
                            objAktivnost[key] = value;
                        }

                        if (key.toLowerCase().includes("brand_sku_oprosnik") && value) {
                            objOprosnik[key] = value;
                        }
                    }));

                    Object.keys(elm_fields).forEach((key) => {
                        const code = "elm_" + elm_fields[key].code;
                        if (objAkciya[code]) {
                            const objBindings = {} as any;
                            const bindings_code = "oprosnik_" + elm_fields[key].code;

                            Object.fromEntries(Object.entries(elm_fields).filter(([_, value]: any) =>
                                value.code === bindings_code && Object.assign(objBindings, {bindings: value.bindings})));

                            arrAkciya.push({
                                name: elm_fields[key].name,
                                code: code,
                                value: objAkciya[code],
                                bindings: objBindings.bindings ?? null,
                                bindings_code: bindings_code,
                            });
                        }

                        if (objAktivnost[code]) {
                            const objBindings = {} as any;
                            const bindings_code = "oprosnik_" + elm_fields[key].code;
                            Object.fromEntries(Object.entries(elm_fields).filter(([_, value]: any) =>
                                value.code === bindings_code && Object.assign(objBindings, {bindings: value.bindings})));

                            arrAktivnost.push({
                                name: elm_fields[key].name,
                                code: code,
                                value: objAktivnost[code],
                                bindings: objBindings.bindings ?? null,
                                bindings_code: bindings_code,
                            });
                        }

                        if (objOprosnik[code]) {
                            arrOprosnik.push(elm_fields[key]);
                        }

                        if (elm_fields[key].tooltip === "Детейлинг") {
                            deteilingItems.push({
                                code: elm_fields[key].code,
                                name: elm_fields[key].name,
                            });
                        }
                    });

                    setDeteilingItems(deteilingItems);

                    const arrButtonsAkciya = [] as any;
                    if (arrAkciya && arrAkciya.length > 0) {
                        arrButtonsAkciya.push('checkmark-circle')
                    } else {
                        arrButtonsAkciya.push('close-outline')
                    }

                    // Активности
                    const arrButtonsAktivnosti = [] as any;
                    if (arrAktivnost && arrAktivnost.length > 0) {
                        arrButtonsAktivnosti.push('checkmark-circle')
                    } else {
                        arrButtonsAktivnosti.push('close-outline')
                    }

                    // Опросник
                    const arrButtonsOprosnik = [] as any;
                    if (arrOprosnik && arrOprosnik.length > 0) {
                        arrButtonsOprosnik.push('checkmark-circle')
                    } else {
                        arrButtonsOprosnik.push('close-outline')
                    }

                    // Презентация
                    const arrButtonsDeteiling = [] as any;
                    // const sql = `AND (elm_id_vizita = "${vizit?.elm___id}" OR elm_vizit_id = ${vizit.id})`;
                    const sql = `AND elm_id_vizita = "${vizit?.elm___id}"`;
                    getDeteilingQuery('*', sql).then(({app_deteiling}) => {
                        if(app_deteiling) {
                            setDeteiling(app_deteiling[0]);
                            arrButtonsDeteiling.push('checkmark-circle')
                        } else {
                            arrButtonsDeteiling.push('close-outline')
                        }
                    });

                    setViewButtons({
                        akciya: arrButtonsAkciya,
                        aktivnosti: arrButtonsAktivnosti,
                        oprosnik: arrButtonsOprosnik,
                        deteiling: arrButtonsDeteiling,
                    });
                }
            })
            resolve(true);
        });
    }


    const onMapLayout = (event: LayoutChangeEvent) => {
        const height = event.nativeEvent.layout.height;
        if(mapHeight !== height) {
            setMapHeight(Math.ceil(height));
        }
    }

    const openModalAkciya = () => {
        setShowModalAkciya(true);
    };

    const openModalOprosnik = () => {
        setShowModalOprosnik(true);
    };

    const openModalDeteiling = () => {
        setShowModalDeteiling(true);
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: Colors.mainBG}}>
            <View style={{marginBottom: 36}}>
                <View style={{position: "relative", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 64, marginHorizontal: 32}}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: "center", gap: 16}} onPress={router.back}>
                        <Ionicons name="arrow-back-outline" size={26} color={Colors.black}  style={{top: 1}} />
                        <FontAwesome6 name="building-user" size={26} color={Colors.info}  style={{top: 1, paddingLeft: 32}} />
                        <View style={{flexDirection: 'row', alignItems: "flex-end", gap: 12}}>
                            <Text style={{ fontSize: fsz.s22, fontWeight: "500", color: Colors.black }}>Визит</Text>
                            <Text style={{ fontSize: fsz.s18, fontStyle: "italic", color: Colors.mediumDark, top: -1 }}>завершён</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/*Инфо*/}
            <View style={{marginHorizontal: 16}}>
                <VizitInfo error={error} vizit={vizit} isTabled={isTabled} status={"completed"} />
            </View>

            {/*Кнопки*/}
            {viewButtons && (
                <View style={{ marginHorizontal: 16,  gap: pos.g16}}>
                    <VizityViewButtons isTabled={isTabled} viewButtons={viewButtons}
                                       openAkciya={openModalAkciya}
                                       openOprosnik={openModalOprosnik}
                                       openDeteiling={openModalDeteiling}
                                       status={"completed"}
                    />
                </View>
            )}

            {/*Карта*/}
            <View style={[rStyle.cardContainer]}>
                <TouchableOpacity style={{flexDirection: "row", alignItems: "flex-start", gap: pos.g24, marginBottom: 16}} onPress={() =>  router.push({
                    pathname: "/(authentificated)/apteki/[id]",
                    params: {id: tochka.id}
                })}>
                    <Text style={{flex: 1, color: Colors.black, fontSize: isTabled ? 18 : 14}}>{tochka.elm___name}</Text>
                    <Ionicons name="chevron-forward" size={22} color={Colors.info} style={{top: 2}} />
                </TouchableOpacity>
                <MapView onMapLayout={onMapLayout} styleScale={styleScale} mapLocation={mapLocation} mapHeight={mapHeight} akciya={tochka.elm_akciya} />
            </View>

            {showModalAkciya && <ModalAkciya vizit={vizit} visible={showModalAkciya} setVisible={setShowModalAkciya} isTabled={isTabled} />}
            {showModalOprosnik && <ModalOprosnik vizit={vizit} tochka={tochka} visible={showModalOprosnik} setVisible={setShowModalOprosnik} isTabled={isTabled} />}
            {showModalDeteiling && <ModalDeteiling vizit={vizit} deteiling={deteiling} visible={showModalDeteiling} setVisible={setShowModalDeteiling} deteilingItems={deteilingItems} isTabled={isTabled}/>}
        </SafeAreaView>
    );
};

export default VizityCompletedView;