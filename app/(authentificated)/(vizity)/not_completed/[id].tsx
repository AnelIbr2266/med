import {Text, View, LayoutChangeEvent, TouchableOpacity, SafeAreaView} from "react-native";
import {Redirect, useLocalSearchParams, useRouter} from "expo-router";
import React, {createRef, useEffect, useState} from "react";
import {FontAwesome6, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Loading from "@/components/Loading";
import {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {IAppVizity, ISettingFields} from "@/types/Vizity";
import {IAppTochki} from "@/types/Tochki";
import sqlVizity from "@/sql/user/sqlVizity";
import sqlTochki from "@/sql/user/sqlTochki";
import sqlOprosnik from "@/sql/user/sqlOprosnik";
import {ILocation} from "@/types/Location";
import sqlSettings from "@/sql/user/sqlSettings";
import sqlDeteilingKartinki from "@/sql/user/sqlDeteilingKartinki";
import ButtonPrimary from "@/components/ButtonPrimary";
import {useAuth} from "@/context/AuthContext";
import {fsz, pos, rStyle} from "@/constants/rStyle";
import VizitInfo from "@/components/items/VizitInfo";
import {VizityViewButtons} from "@/components/items/VizityViewButtons";
import ModalAddAkciya from "@/components/bottom/ModalAddAkciya";
import ModalAddSku from "@/components/bottom/ModalAddSku";
import ModalAddDeteiling from "@/components/bottom/ModalAddDeteiling";
import ModalUpdateVizit from "@/components/bottom/ModalUpdateVizit";
import LoadingStart from "@/components/LoadingStart";
import MapView from "@/components/map/MapView";
import YaMap, {Marker} from "react-native-yamap";

const VizityNotCompletedView = () => {
    const {getSetIsVizityAdd, isTabled} = useAuth();
    const {getVizityOne, updateAppVizit} = sqlVizity();
    const {getSettings} = sqlSettings();
    const {getTochkiOne} = sqlTochki();
    const {getOprosnikQuery} = sqlOprosnik();
    const {getDeteilingKartinkiQuery} = sqlDeteilingKartinki();

    const router = useRouter();
    const {id} = useLocalSearchParams<any>();

    const [error, setError] = useState<string | null>(null);
    const [vizit, setVizit] = useState<IAppVizity | null>(null);
    const [tochka, setTochka] = useState<IAppTochki | null>(null);

    const [reload, setReload] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingInner, setLoadingInner] = useState<boolean>(false);
    const [loadingClose, setLoadingClose] = useState<boolean>(false);

    const [showAkciya, setShowAkciya] = useState<boolean>(false);
    const [showOprosnik, setShowOprosnik] = useState<boolean>(false);
    const [showDeteiling, setShowDeteiling] = useState<boolean>(false);
    const [showUpdateVizit, setShowUpdateVizit] = useState<boolean>(false);

    const [settingFields, setSettingFields] = useState<ISettingFields | null>(null);
    const [viewButtons, setViewButtons] = useState<any>();
    const [viewUpdateButton, setViewUpdateButton] = useState<boolean>(false);
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
            if(reload) {
                setLoadingInner(true);
            } else {
                setLoading(true);
            }
            const insert = await new Promise(async (resolve) => {
                const sql  = `AND id = "${id}" AND elm___status = "План"`;
                await getVizityOne('*', sql).then(async ({app_vizit, error}) => {
                    if (app_vizit) {
                        await getTochkiOne(`*`, `AND elm___id = "${app_vizit.elm_tochka}"`).then(async ({app_tochka, error}) => {
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
                if(reload) {
                    setTimeout(() => {
                        setLoadingInner(false);
                    }, 300);
                } else {
                    setTimeout(() => {
                        setLoading(false);
                        setTimeout(() => {
                            showMapHeight.value = 1;
                        }, 400);
                    }, 300);
                }
            }
        })()
    }, [id, reload]);

    async function deteilingSelect(objDeteiling: any, vizit: IAppVizity): Promise<any> {
        return await new Promise(async (resolve) => {
            const arrDeteiling = [] as any;
            await getDeteilingKartinkiQuery('*', '').then(async ({app_kartinki}: any) => {
                if (app_kartinki) {
                    const sql = `AND elm_id_vizita = "${vizit.elm___id}" AND elm_deteiling = "Да"`;
                    await getOprosnikQuery('*', sql).then(async ({app_oprosnik}) => {
                        if (app_oprosnik) {
                            for (const oprosnik of app_oprosnik) {
                                if (objDeteiling[oprosnik.elm_brand_sku]) {
                                    const code = "elm_" + objDeteiling[oprosnik.elm_brand_sku].code;
                                    if (app_kartinki[code]) {
                                        const images = JSON.parse(app_kartinki[code]);
                                        arrDeteiling.push({
                                            code: code,
                                            name: objDeteiling[oprosnik.elm_brand_sku].name,
                                            images: images,
                                        });
                                    }
                                }
                            }
                        }
                    })
                }
            });
            resolve(arrDeteiling);
        });
    }

    async function updateSelect(vizit: any): Promise<boolean> {
        return await new Promise(async (resolve) => {
            await getSettings('*', `AND elm_table = "vizity"`).then(async ({app_settings}) => {
                if (app_settings) {
                    const elm_fields = JSON.parse(app_settings[0].elm_fields);
                    const elm_conditions = JSON.parse(app_settings[0].elm_conditions);

                    const objAkciya = {} as any
                    const objOprosnik = {} as any
                    const objDeteiling = {} as any

                    const arrAkciya = [] as any
                    const arrAkciyaHave: boolean[] = [];

                    const arrOprosnik = [] as any
                    const arrOprosnikHave: boolean[] = [];

                    Object.fromEntries(Object.entries(vizit).filter(([key, value]) => {
                        if (key.toLowerCase().includes("akciya_na_pokupatelya") && !key.toLowerCase().includes("oprosnik") && value) {
                            objAkciya[key] = value;
                        }
                    }));

                    Object.fromEntries(Object.entries(elm_conditions).filter(([key, value]: any) => {
                        if (key.toLowerCase().includes("brand_sku_oprosnik") && value) {
                            const code = "elm_" + value.conditions[0].a.value;
                            if (vizit[code] && vizit[code].length > 0) {
                                objOprosnik["elm_" + key] = vizit[code];
                            }
                        }
                    }));

                    Object.keys(elm_fields).forEach((key) => {
                        const code = "elm_" + elm_fields[key].code;
                        if (objAkciya[code]) {
                            const objBindings = {} as any;
                            const bindings_code = "oprosnik_" + elm_fields[key].code;

                            Object.fromEntries(Object.entries(elm_fields).filter(([_, value]: any) =>
                                value.code === bindings_code && Object.assign(objBindings, {bindings: value.bindings})));

                            if (vizit["elm_" + bindings_code] && vizit["elm_" + bindings_code].length > 0) {
                                arrAkciyaHave.push(true);
                            }
                            arrAkciya.push({
                                name: elm_fields[key].name,
                                code: code,
                                value: objAkciya[code],
                                bindings: objBindings.bindings ?? null,
                                bindings_code: bindings_code,
                            });
                        }

                        if (objOprosnik[code]) {
                            if (vizit[code] && vizit[code].length > 0) {
                                arrOprosnikHave.push(true);
                            }
                            arrOprosnik.push(elm_fields[key]);
                        }


                        if (elm_fields[key].tooltip === "Детейлинг") {
                            objDeteiling[elm_fields[key].name] = {
                                code: elm_fields[key].code,
                                name: elm_fields[key].name,
                            };
                        }
                    });

                    // Акции
                    const arrButtonsAkciya = [] as any;
                    if (arrAkciya && arrAkciya.length > 0) {
                        if (arrAkciya.length === arrAkciyaHave.length) {
                            arrButtonsAkciya.push('checkmark-circle')
                        } else {
                            arrButtonsAkciya.push('plus')
                        }
                    } else {
                        arrButtonsAkciya.push('close-outline')
                    }


                    // Опросник
                    const arrButtonsOprosnik = [] as any;
                    if (arrOprosnik && arrOprosnik.length > 0) {
                         if (arrAkciya && arrAkciya.length > 0) {
                            if (arrAkciya.length === arrAkciyaHave.length) {
                                if (arrOprosnik.length === arrOprosnikHave.length) {
                                    arrButtonsOprosnik.push('checkmark-circle');
                                } else {
                                    arrButtonsOprosnik.push('plus');
                                }

                            } else {
                                arrButtonsOprosnik.push('time-slot');
                            }
                        } else {
                            if (arrOprosnik.length === arrOprosnikHave.length) {
                                arrButtonsOprosnik.push('checkmark-circle');
                            } else {
                                arrButtonsOprosnik.push('plus');
                            }
                        }
                    } else {
                        arrButtonsOprosnik.push('close-outline');
                    }

                    // Картинки презентации
                    const arrDeteiling = await deteilingSelect(objDeteiling, vizit);
                    // Презентация
                    const arrButtonsDeteiling = [] as any;
                    if (arrOprosnik.length > 0) {
                        if (arrOprosnik.length === arrOprosnikHave.length) {
                            if (arrDeteiling.length > 0) {
                                if (vizit.elm_deteiling) {
                                    arrButtonsDeteiling.push('checkmark-circle');
                                } else {
                                    arrButtonsDeteiling.push('plus');
                                }
                            } else {
                                arrButtonsDeteiling.push('close-outline');
                            }
                        } else {
                            arrButtonsDeteiling.push('time-slot');
                        }
                    } else {
                        arrButtonsDeteiling.push('close-outline');
                    }

                    setViewUpdateButton(arrAkciyaHave.concat(arrOprosnikHave).length === 0)
                    setViewButtons({
                        akciya: arrButtonsAkciya,
                        oprosnik: arrButtonsOprosnik,
                        deteiling: arrButtonsDeteiling,
                    });
                    setSettingFields({
                        akciya: arrAkciya,
                        oprosnik: arrOprosnik,
                        deteiling: arrDeteiling,
                    });

                    resolve(true);
                } else {
                    resolve(true);
                }
            })
        });
    }

    if(loading) {
        return <LoadingStart />
    }

    if (!vizit || !tochka) {
        return <Redirect href="/(authentificated)/(tabs)/visity" />;
    }


    const onMapLayout = (event: LayoutChangeEvent) => {
        const height = event.nativeEvent.layout.height;
        if(mapHeight !== height) {
            setMapHeight(Math.ceil(height));
        }
    }

    // Open
    const openBottomModalAkciya = () => {
        setShowAkciya(true);
    };

    const openBottomModalSku = () => {
        setShowOprosnik(true);
    };

    const openBottomModalDeteiling = () => {
        setShowDeteiling(true);
    };

    const openBottomModalUpdate = () => {
        setShowUpdateVizit(true);
    };

    // Reload
    const onReload = async () => {
        getSetIsVizityAdd(Date.now());
        setReload(Date.now())
    };

    const onStartVizit = async () => {
        const date = Date.now();

        const fields: any = {
            data_nachala: String(date),
            postponed: "1",
        }

        setLoadingInner(true);
        await updateAppVizit(fields, vizit.id).finally(() => {
            setReload(date);
            getSetIsVizityAdd(Date.now());
        });
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
                            <Text style={{ fontSize: fsz.s18, fontStyle: "italic", color: Colors.mediumDark, top: -1 }}>незавершён</Text>
                        </View>
                    </TouchableOpacity>
                    {viewUpdateButton && !loadingClose && !loadingInner && !vizit.elm_data_nachala &&
                        <TouchableOpacity  onPress={() => openBottomModalUpdate()} style={[rStyle.shadow, {backgroundColor: Colors.white, borderRadius: 16, alignItems: "center", justifyContent: "center", padding: 16,
                            position: "absolute", right: -17, bottom: -15, borderWidth: 1, borderColor: Colors.mediumDark}]}>
                            <MaterialCommunityIcons name="clock-edit-outline" size={fsz.i24} color={Colors.black} />
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {/*Кнопки*/}
            <View style={{ height: 58}}>
                {loadingInner
                    ?
                    <Loading style={{ backgroundColor: "none"}} />
                    :
                    <>
                        <View style={{ marginHorizontal: 16,  gap: pos.g16}}>
                            {viewButtons && vizit.elm_data_nachala &&
                                <VizityViewButtons isTabled={isTabled} viewButtons={viewButtons}
                                                   openAkciya={openBottomModalAkciya}
                                                   openOprosnik={openBottomModalSku}
                                                   openDeteiling={openBottomModalDeteiling}
                                                   status={"not_completed"}

                                />
                            }
                            {!vizit.elm_data_nachala &&
                                <View style={{position: "absolute", width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                    <ButtonPrimary title={"Начать визит"} onPress={() => onStartVizit()} />
                                </View>
                            }
                        </View>
                    </>
                }
            </View>

            {/*Инфо*/}
            <View style={{marginHorizontal: 16, marginTop: 32}}>
                <VizitInfo error={error} vizit={vizit} isTabled={isTabled} status={"not_completed"} />
            </View>

            {/*Карта*/}
            {mapLocation?.lat != null && mapLocation?.lon != null && (
                <View style={{ height: mapHeight, borderRadius: 8, overflow: "hidden" }}>
                    <YaMap
                        initialRegion={{
                            lat: mapLocation.lat,
                            lon: mapLocation.lon,
                            zoom: 16,
                        }}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <Marker
                            point={{
                                lat: mapLocation.lat,
                                lon: mapLocation.lon,
                            }}
                        />
                    </YaMap>
                </View>)}

            {vizit.elm_data_nachala &&
                <View style={[rStyle.cardContainer, {flex: 0, padding: 0, backgroundColor: Colors.greyBg, marginTop: 50}]}>
                    {loadingInner
                        ?
                        <ButtonPrimary title={"..."} onPress={() =>  {}} />
                        :
                        <ButtonPrimary title={"Завершить визит"} onPress={() =>  router.push({
                            pathname: "/(authentificated)/(vizity)/close/[id]",
                            params: {id: vizit.id}
                        })} />
                    }
                </View>

            }

            {settingFields?.akciya &&  <ModalAddAkciya vizit={vizit} visible={showAkciya} setVisible={setShowAkciya} fields={settingFields?.akciya} onReload={onReload} isTabled={isTabled} /> }

            {settingFields?.oprosnik &&  <ModalAddSku vizit={vizit} visible={showOprosnik} setVisible={setShowOprosnik} fields={settingFields?.oprosnik} onReload={onReload} isTabled={isTabled} />}

            {settingFields?.deteiling && <ModalAddDeteiling vizit={vizit} visible={showDeteiling} setVisible={setShowDeteiling}  fields={settingFields?.deteiling} onReload={onReload} isTabled={isTabled} />}

            {viewUpdateButton && showUpdateVizit && <ModalUpdateVizit vizit={vizit} visible={showUpdateVizit} setVisible={setShowUpdateVizit} onReload={onReload}/>}

        </SafeAreaView>
    );
};


export default VizityNotCompletedView;