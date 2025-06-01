import React, {Dispatch, FC, useEffect, useRef, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity, StyleSheet, PermissionsAndroid, ImageBackground, TouchableWithoutFeedback, Image, TextInput} from "react-native";
import {AntDesign, Entypo, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import { ItemsOprosnik} from "@/types/Oprosnik";
import sqlSettings from "@/sql/user/sqlSettings";
import {IAppVizity} from "@/types/Vizity";
import {IAkciyaFields} from "@/types/Akciya";
import Loading from "@/components/Loading";
import {fsz, rStyle} from "@/constants/rStyle";
import {ErrorMessage} from "@/components/ErrorMessage";
import {Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger} from "react-native-popup-menu";
import {MenuStyle} from "@/constants/MenuStyle";
import {Camera, useCameraDevice} from "react-native-vision-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import ButtonPrimaryOutline from "@/components/ButtonPrimaryOutline";
import ButtonPrimary from "@/components/ButtonPrimary";
import {CameraStyle} from "@/constants/CameraStyle";
import sqlOprosnik from "@/sql/user/sqlOprosnik";

interface PropsCamera {
    visible: boolean;
    setVisible: Dispatch<boolean>;
    onOprosnikSelect: (main_code: string, item_code: string, select: any) => void;
    main_code: string;
    item_code: string;
}

const ModalCamera: FC<PropsCamera> = (props) => {
    const [startCamera, setStartCamera] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [capturedImage, setCapturedImage] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingView, setLoadingView] = useState<boolean>(false);

    const cameraRef = useRef<any>();
    const device = useCameraDevice('back');

    useEffect(() => {
        if (props.visible) {
            setLoading(true);
            setTimeout(() => {
                onStartCamera().then(() => {
                    setLoading(false);
                    setLoadingView(false);
                });
            }, 600);
        } else {
            setCapturedImage(null)
        }
    }, [props.visible]);


    const onStartCamera = async () => {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
            .then((status) => {
                setStartCamera(status === 'granted')
            })
            .catch(() => {
                setStartCamera(false)
            });
    }
    const onTakePicture = async () => {
        setLoadingView(true)
        if (cameraRef.current) {
            await cameraRef.current.takePhoto({
                enableShutterSound: false
            }).then((photo: any) => {
                setPreviewVisible(true);
                setCapturedImage(photo);
            }).finally(() => {
                setLoadingView(false);
            });
        }
    }

    const onRetakePicture = () => {
        setCapturedImage(null)
        setPreviewVisible(false)
        onStartCamera().then()
    }

    const onSavePhoto = async () => {
        const resize = await ImageManipulator.manipulateAsync(
            `file://${capturedImage.path}`,
            [{resize: {width: 800}}],
            {
                // compress: 0.5,
                // base64: true
            }
        );

        if(resize) {
            props.onOprosnikSelect(props.main_code, props.item_code, Object.assign(resize, {id: Crypto.randomUUID()}));
        }
        props.setVisible(false);
    }

    return(
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => {
                props.setVisible(false);
            }}
        >
            <View style={{flex: 1, backgroundColor: Colors.white}}>
                {loading
                    ?
                    <Loading />
                    :
                    <>
                        {startCamera
                            ?
                            <View style={{flex: 1}}>
                                {previewVisible && capturedImage
                                    ?
                                    <>
                                        <ImageBackground source={{uri: `file://${capturedImage.path}`}} style={{flex: 1, }} />
                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <View style={{ width: "50%" }}>
                                                <ButtonPrimaryOutline title="Изменить" onPress={onRetakePicture} />
                                            </View>
                                            <View style={{ width: "50%" }}>
                                                <ButtonPrimary title="Сохранить" onPress={onSavePhoto} style={{borderRadius: 0}} />
                                            </View>
                                        </View>
                                    </>
                                    :
                                    <>
                                        {device &&
                                            <>
                                                <Camera
                                                    ref={cameraRef}
                                                    style={StyleSheet.absoluteFill}
                                                    device={device}
                                                    isActive={startCamera}
                                                    photo={true}
                                                    focusable={true}
                                                    enableZoomGesture={true}
                                                />
                                                <View style={{flex: 1}}>
                                                    <Pressable style={[CameraStyle.buttonClose, { position: "absolute", top: 16, right: 16}]}
                                                               onPress={() => {
                                                                   props.setVisible(false);
                                                               }}>
                                                        <AntDesign name="close" size={24} color={Colors.black} />
                                                    </Pressable>
                                                    <View style={CameraStyle.container}>
                                                        <View style={{alignSelf: 'center', flex: 1, alignItems: 'center'}}>
                                                            <TouchableWithoutFeedback onPress={() => {
                                                                if(!loadingView) onTakePicture().then();
                                                            }}>
                                                                <View style={CameraStyle.buttonTakePicture}>
                                                                    {loadingView
                                                                        ?
                                                                        <Loading />
                                                                        :
                                                                        <MaterialCommunityIcons name="camera" size={32} color={Colors.main} />
                                                                    }
                                                                </View>
                                                            </TouchableWithoutFeedback>
                                                        </View>
                                                    </View>
                                                </View>
                                            </>

                                        }
                                    </>
                                }
                            </View>
                            :
                            <View style={{padding: 16}}>
                                <ErrorMessage message={"Камера не включена"} />
                            </View>
                        }
                    </>
                }
            </View>
        </Modal>
    );
}

interface PropsModal {
    vizit: IAppVizity;
    visible: boolean;
    setVisible: Dispatch<boolean>;
    fields: IAkciyaFields[];
    onReload: () => void;
    isTabled: boolean;
}

const ModalAddSku   : FC<PropsModal> = (props) => {
    const {addAppOprosnik} = sqlOprosnik();
    const {getSettings} = sqlSettings();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingSkip, setLoadingSkip] = useState<boolean>(false);
    const [matrix, setMatrix] = useState<any | null>(null);
    const [fieldCode, setFieldCode] = useState<string>("");
    const [itemCode, setItemCode] = useState<string>("");
    const [select, setSelect] = useState<any | null>(null);
    const [selectSkipBalance, setSelectSkipBalance] = useState<any | null>(null);
    const [selectSkipPhoto, setSelectSkipPhoto] = useState<any | null>(null);

    useEffect(() => {
        (async () => {
            if(props.visible) {
                setLoading(true);
                const result = await new Promise(async (resolve) => {
                    if(!matrix) {
                        getSettings('*', `AND elm_table = "tochki"`).then(({app_settings}) => {
                            if(app_settings) {
                                const fields = JSON.parse(app_settings[0].elm_fields);
                                const obj = {} as any
                                Object.keys(fields).forEach((key) => {
                                    if (String(fields[key].tooltip).trim() === "тип матрицы") {
                                        const code = "elm_" + fields[key].code;

                                        if(props.vizit[code as keyof IAppVizity]) {
                                            Object.assign(obj, {[fields[key].name]: props.vizit[code as keyof IAppVizity]})
                                        }
                                    }
                                });
                                setMatrix(obj);
                            }
                        });
                    }
                    resolve(true);
                });

                if(result) {
                    setTimeout(() => {
                        setLoading(false);
                    }, 300);
                }
            }
        })();
    }, [props.visible]);


    const openBottomModalCamera = (field_code: string, item_code: string) => {
        setShowCamera(true);
        setFieldCode(field_code);
        setItemCode(item_code);
    };

    const onRemoveImage = (main_code: string, item_code: string, id: string) => {
        const copy = {...select};
        const copyPhoto = [...copy[main_code][item_code]];

        const filter = copyPhoto.filter(( obj ) => obj.id !== id);
        if(filter.length > 0) {
            copy[main_code][item_code] = filter;
        } else {
            delete copy[main_code][item_code];
        }
        setSelect(copy);
    };


    const onSelect = (main_code: string, item_code: string, value: any) => {
        if(select) {
            const copy = {...select};

            // clear after
            if(copy[main_code]) {
                let select_clear: boolean[] = [];
                props.fields.forEach((item) => {
                    if(item.code === item_code) {
                        select_clear.push(true);
                    } else {
                        if(select_clear.length > 0) {
                            delete copy[main_code][item.code];
                        }
                    }
                })
            }

            if(value === "empty") {
                if(copy[main_code]) {
                    delete copy[main_code][item_code];
                    setSelect(copy);
                }
            } else {

                if(item_code === "propustit_fotofiksaciyu" && copy[main_code]) {
                    delete copy[main_code]["prikrepit_foto_vykladki"];
                }


                if(item_code === "prikrepit_foto_vykladki" && copy[main_code]) {
                    if(select[main_code][item_code]) {
                        const copyPhoto = [...select[main_code][item_code]];
                        copyPhoto.push(value);
                        copy[main_code] = Object.assign({
                            ...select[main_code], ...{
                                [item_code]: copyPhoto
                            }
                        });
                    } else {
                        copy[main_code] = Object.assign({
                            ...select[main_code], ...{
                                [item_code]: [value]
                            }
                        });
                    }

                    setSelect(copy);
                } else {
                    setSelect(Object.assign({
                        ...copy, ...{
                            [main_code]: Object.assign({
                                ...copy[main_code], ...{
                                    [item_code]: value
                                }
                            })
                        }
                    }));
                }
            }

        } else {
            if(value !== "empty") {
                const obj = {} as any;
                obj[main_code] = {
                    [item_code]: value
                };
                setSelect(obj);
            }
        }
    };

    const skipBalance = [
        {"code": "1_ne_predostavlyayut_ostatki", "name": "1. Не предоставляют остатки"},
        {"code": "2_u_farmacevta_net_vremeni", "name": "2. У фармацевта нет времени"},
        {"code": "3_bolshaya_ochered_v_apteke", "name": "3. Большая очередь в аптеке"},
        {"code": "4_zav_zapretila_obshatsya_s_farmacevtom", "name": "4. Зав. запретила общаться с фармацевтом"}
    ];

    const onSkipBalance = async (skip: string | null) => {
        setLoadingSkip(true);
        setSelectSkipBalance(skip);

        const isSkip = await new Promise(async (resolve) => {
            if (skip) {
                const obj = {} as any;
                props.fields && props.fields.map((field) => {
                    if(props.vizit["elm_" + field.code as keyof IAppVizity]) return;

                    obj[field.code] = {
                        ["propustit_snyatie_ostatkov_i_formirovanie_zakaza"]: skip
                    };
                });
                setSelect(obj);
            } else {
                if (select) {
                    const copy = {...select};

                    if(selectSkipPhoto) {
                        for (const [key, value] of Object.entries(copy)) {
                            delete copy[key]["propustit_fotofiksaciyu"];
                            delete copy[key]["propustit_snyatie_ostatkov_i_formirovanie_zakaza"];
                        }
                        setSelectSkipPhoto(null)
                    }
                    setSelect(null);
                }
            }
            resolve(true);
        });
        if(isSkip) {
            setTimeout(() => {
                setLoadingSkip(false);
            }, 200);
        }
    };


    const skipPhoto = [
        {"code": "1_zapret_na_foto_v_apteke", "name": "1. Запрет на фото в аптеке"},
        {"code": "2_format_apteki_ne_predpolagaet_vykladku", "name": "2. Формат аптеки не предполагает выкладку"},
        {"code": "3_net_kategorii", "name": "3. Нет категории"},
        {"code": "4_otkazalis_vystavlyat", "name": "4. Отказались выставлять"},
    ];
    const onSkipPhoto = async (skip: string | null) => {
        setLoadingSkip(true);
        setSelectSkipPhoto(skip)

        const isSkip = await new Promise(async (resolve) => {
            if (skip) {
                const copy = {...select};
                if(copy) {
                    for (const [key, value] of Object.entries(copy)) {
                        Object.assign(copy[key], {
                            "propustit_fotofiksaciyu": skip
                        });
                    }
                }
                setSelect(copy);
            } else {
                if (select) {
                    const copy = {...select};
                    props.fields && props.fields.map((field) => {
                        if(props.vizit["elm_" + field.code as keyof IAppVizity]) return;
                        delete copy[field.code]["propustit_fotofiksaciyu"];
                    });
                    setSelect(copy);
                }
            }
            resolve(true);
        });
        if (isSkip) {
            setTimeout(() => {
                setLoadingSkip(false);
            }, 200);
        }
    };

    const onSave = async () => {
        setLoading(true);
        const createFields = [] as any;
        for (const [key, item] of Object.entries(select)) {
            const obj = {} as any;
            props.fields.find((field: any) => {
                if (field.code === key) {
                    for (const bind of field.bindings) {
                        if (bind.source.kind === "manual") {
                            obj[bind.target.value] = bind.source.value
                        } else {
                            const code = "elm_" + bind.source.value as any;
                            obj[bind.target.value] = props.vizit[code as keyof IAppVizity]
                        }
                    }
                    obj["bindings_code"] = field.code
                }
            });

            const copyItem = item as any;
            if (copyItem) {
                if (copyItem.tovarnyi_zapas_v_apteke_po_preparatu &&
                    Number(copyItem.tovarnyi_zapas_v_apteke_po_preparatu.value) === 0
                    && copyItem.zakaz && copyItem.zakaz.name === "Да") {
                    obj["deteiling"] = "Да"
                }
                if (copyItem.tovarnyi_zapas_v_apteke_po_preparatu && Number(copyItem.tovarnyi_zapas_v_apteke_po_preparatu.value) > 0) {
                    obj["deteiling"] = "Да"
                } else if (copyItem.propustit_snyatie_ostatkov_i_formirovanie_zakaza) {
                    obj["deteiling"] = "Да"
                }
            }
            createFields.push(Object.assign(obj, item));
        }

        await addAppOprosnik(createFields, props.vizit.elm___id).finally(() => {
            props.onReload();

            setTimeout(() => {
                props.setVisible(false);
                setLoading(false);
                setSelect(null);
            }, 300);
        });
    }

    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => {
                props.setVisible(false);
            }}
        >
            <MenuProvider skipInstanceCheck>
                <Pressable style={ModalStyle.modalContainer} onPress={() => props.setVisible(false)}></Pressable>
                <View style={[ModalStyle.modalView, {margin: 0, marginTop: "10%", backgroundColor: Colors.greyBg, borderRadius: 0 }]}>
                    <View style={[ModalStyle.modalHeader, {marginBottom: 16}]}>
                        <Text style={ModalStyle.textHeader}>Опросник</Text>
                        <Pressable style={[ModalStyle.buttonClose]} onPress={() => props.setVisible(false)}>
                            <AntDesign name="close" size={24} color={Colors.black} />
                        </Pressable>
                    </View>
                    {loading
                        ?
                        <View style={{flex: 1}}>
                            <Loading style={{backgroundColor: Colors.mainBG}} />
                        </View>
                        :
                        <>
                            <View style={{marginHorizontal: 16}}>
                                <Menu style={{marginBottom: 16}}>
                                    <MenuTrigger style={[styles.btn, rStyle.shadow]}>
                                        {selectSkipBalance
                                            ?
                                            <View style={{flexDirection: "row", gap: 16}}>
                                                <Text style={[MenuStyle.menuText, {color: Colors.info}]}>{selectSkipBalance.name}</Text>
                                            </View>
                                            :
                                            <View style={{flexDirection: "row", gap: 16}}>
                                                <Text style={[MenuStyle.menuText, {color: Colors.mediumDark}]}>Пропустить снятие остатка</Text>
                                            </View>
                                        }
                                        <Ionicons name="chevron-down" size={22} color={Colors.mediumDark} />
                                    </MenuTrigger>
                                    <MenuOptions customStyles={{ optionsContainer: {width: "auto"} }}>
                                        <ScrollView style={{ maxHeight: 310, minWidth: 200 }}>
                                            <MenuOption style={MenuStyle.menuOption} onSelect={() => {
                                                onSkipBalance(null).then(() => true);
                                            }}>
                                                <Text style={[MenuStyle.menuText, {paddingVertical: 8, fontStyle: "italic", color: Colors.medium}]}>Пустое значение</Text>
                                            </MenuOption>
                                            {skipBalance.map((item: any) => {
                                                return(
                                                    <MenuOption key={item.code} style={MenuStyle.menuOption} onSelect={() => {
                                                        onSkipBalance(item).then(() => true);
                                                    }}>
                                                        <Text style={[MenuStyle.menuText, {paddingVertical: 8}]}>{item.name}</Text>
                                                    </MenuOption>
                                                );
                                            })}
                                        </ScrollView>
                                    </MenuOptions>
                                </Menu>

                                {selectSkipBalance &&
                                    <Menu style={{marginBottom: 16}}>
                                        <MenuTrigger style={[styles.btn, rStyle.shadow]}>
                                            {selectSkipPhoto
                                                ?
                                                <View style={{flexDirection: "row", flexWrap: "wrap", gap: 16}}>
                                                    <Text style={[MenuStyle.menuText, {color: Colors.info}]}>{selectSkipPhoto.name}</Text>
                                                </View>
                                                :
                                                <View style={{flexDirection: "row", gap: 16}}>
                                                    <Text style={[MenuStyle.menuText, {color: Colors.mediumDark}]}>Пропустить фотофиксацию</Text>
                                                </View>
                                            }
                                            <Ionicons name="chevron-down" size={22} color={Colors.mediumDark} />
                                        </MenuTrigger>
                                        <MenuOptions customStyles={{ optionsContainer: {width: "auto"} }}>
                                            <ScrollView style={{ maxHeight: 310, minWidth: 200 }}>
                                                <MenuOption style={MenuStyle.menuOption} onSelect={() => {
                                                    onSkipPhoto(null).then(() => true);
                                                }}>
                                                    <Text style={[MenuStyle.menuText, {paddingVertical: 8, fontStyle: "italic", color: Colors.medium}]}>Пустое значение</Text>
                                                </MenuOption>
                                                {skipPhoto.map((item: any) => {
                                                    return(
                                                        <MenuOption key={item.code} style={MenuStyle.menuOption} onSelect={() => {
                                                            onSkipPhoto(item).then(() => true);
                                                        }}>
                                                            <Text style={[MenuStyle.menuText, {paddingVertical: 8}]}>{item.name}</Text>
                                                        </MenuOption>
                                                    );
                                                })}
                                            </ScrollView>
                                        </MenuOptions>
                                    </Menu>
                                }
                            </View>
                            {loadingSkip
                                ?
                                <View style={{flex: 1}}>
                                    <Loading />
                                </View>
                                :
                                <ScrollView style={{flex: 1, }}>
                                    {props.fields && props.fields.map((field) => {
                                        if(props.vizit["elm_" + field.code as keyof IAppVizity]) {
                                            return;
                                        }
                                        const brand_sku = field.name.split('Brand SKU опросник ')[1].trim();

                                        return (
                                            <View key={field.code} style={[rStyle.cardContainer, rStyle.shadow, {flex: 0, marginTop: 0, marginBottom: 16}]}>
                                                <View style={{ marginBottom: 24}}>
                                                    <Text style={{fontSize: fsz.s22, fontWeight: "500", color: Colors.black}}>
                                                        {brand_sku}
                                                    </Text>
                                                    <Text style={{fontSize: fsz.s18, color: Colors.medium, fontStyle: "italic"}}>{matrix && matrix[brand_sku] ? matrix[brand_sku]: null}</Text>
                                                </View>
                                                <>
                                                    {ItemsOprosnik && ItemsOprosnik.map((item) => {

                                                        // Товарный запас
                                                        if(item.code === "tovarnyi_zapas_v_apteke_po_preparatu") {
                                                            const show: boolean[] = [];
                                                            item.conditions.forEach((condition: any) => {
                                                                const a = condition.a;
                                                                if(select && select[field.code]
                                                                    && select[field.code][a.value]) {
                                                                    show.push(true);
                                                                } else {
                                                                    show.pop();
                                                                }
                                                            });
                                                            if(show.length > 0) return;
                                                        }

                                                        // Пропустить
                                                        if(item.code === "propustit_snyatie_ostatkov_i_formirovanie_zakaza") {
                                                            const show: boolean[] = [];
                                                            item.conditions.forEach((condition: any) => {
                                                                const a = condition.a;
                                                                if(select && select[field.code]
                                                                    && select[field.code][a.value]) {
                                                                    show.push(true);
                                                                } else {
                                                                    show.pop();
                                                                }
                                                            });
                                                            if(show.length > 0) return;
                                                        }

                                                        // Заказ
                                                        if(item.code === "zakaz") {
                                                            const show: boolean[] = [];
                                                            item.conditions.forEach((condition: any) => {
                                                                const a = condition.a;
                                                                const b = condition.b;
                                                                if(select && select[field.code]
                                                                    && select[field.code][a.value]
                                                                    && Number(select[field.code][a.value].value) === Number(b.value)) {
                                                                    show.pop();
                                                                } else {
                                                                    show.push(true);
                                                                }
                                                            });
                                                            if(show.length > 0) return;
                                                        }

                                                        // Причина отсутствия препарата
                                                        if(item.code === "prichina_otsutstviya_preparata") {
                                                            const show: boolean[] = [];
                                                            item.conditions.forEach((condition: any) => {
                                                                const a = condition.a;
                                                                const b = condition.b;
                                                                if(select && select[field.code]
                                                                    && select[field.code][a.value]
                                                                    && select[field.code][a.value].name === b.value[0].name) {
                                                                    show.pop();
                                                                } else {
                                                                    show.push(true);
                                                                }
                                                            });
                                                            if(show.length > 0) return;
                                                        }


                                                        // Прикрепить фото выкладки
                                                        // Пропустить фотофиксацию
                                                        if(["prikrepit_foto_vykladki", "propustit_fotofiksaciyu"].includes(item.code)) {
                                                            if(item.code === "prikrepit_foto_vykladki") {
                                                                if(select && select[field.code] && select[field.code]["propustit_fotofiksaciyu"]) {
                                                                    return;
                                                                }
                                                            }

                                                            let first = true;
                                                            const firstUnshow: boolean[] = [];
                                                            const secondUnshow: boolean[] = [];


                                                            item.conditions.forEach((condition: any) => {
                                                                const a = condition.a;
                                                                const b = condition.b;

                                                                if(b) {
                                                                    if(condition["conjunction"]) {
                                                                        if(first) {
                                                                            if(brand_sku.trim() === b.value.trim()) {
                                                                                firstUnshow.push(true);
                                                                            }
                                                                        } else {
                                                                            if(brand_sku.trim() === b.value.trim()) {
                                                                                secondUnshow.push(true);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        const n = "propustit_snyatie_ostatkov_i_formirovanie_zakaza";
                                                                        if(select && select[field.code]
                                                                            && select[field.code][n]) {
                                                                            firstUnshow.pop();
                                                                        } else {
                                                                            if(select && select[field.code]
                                                                                && select[field.code][a.value]
                                                                                && select[field.code][a.value].value > b.value) {
                                                                                firstUnshow.pop();
                                                                            } else {
                                                                                firstUnshow.push(true);
                                                                            }
                                                                        }
                                                                    }
                                                                } else {
                                                                    first = false;
                                                                    const n = "tovarnyi_zapas_v_apteke_po_preparatu";
                                                                    if(select && select[field.code]
                                                                        && select[field.code][n]) {
                                                                        secondUnshow.pop();
                                                                    } else {
                                                                        if(select && select[field.code] && select[field.code][a.value]) {
                                                                            secondUnshow.pop();
                                                                        } else {
                                                                            secondUnshow.push(true);
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                            if(firstUnshow.length > 0 || secondUnshow.length > 0) return;
                                                        }

                                                        return(
                                                            <View key={item.code} style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
                                                                <View style={{ width: "33%",  justifyContent: "center"}}>
                                                                    <Text style={{fontSize: 18, color: Colors.black}}>{item.name}:</Text>
                                                                </View>
                                                                <View style={{flex: 1, position: "relative"}}>
                                                                    {(() => {
                                                                        if(item.code === "tovarnyi_zapas_v_apteke_po_preparatu") {
                                                                            let value;

                                                                            if(select && select[field.code]
                                                                                && select[field.code][item.code]) {
                                                                                value = select[field.code][item.code].value;
                                                                            }

                                                                            return (
                                                                                <TextInput style={[MenuStyle.menuTrigger, {
                                                                                    borderBottomWidth: 1,paddingVertical: 16, borderColor: Colors.medium,
                                                                                    fontSize: 18
                                                                                }]}
                                                                                           keyboardType="numeric"
                                                                                           autoCapitalize="none"
                                                                                           placeholder="Укажите целочисленное число от 0 и больше..."
                                                                                           value={value}
                                                                                           onChangeText={(v: string) => {
                                                                                               let num = v.replace(/[^0-9]/g, '');
                                                                                               onSelect(field.code, item.code,
                                                                                                   num
                                                                                                       ?
                                                                                                       {value: num.length > 1 && num[0] === "0" ? num.substring(1) : num}
                                                                                                       : "empty"
                                                                                               );
                                                                                           }}
                                                                                />
                                                                            );
                                                                        } else if(item.code === "prikrepit_foto_vykladki") {
                                                                            return (
                                                                                <View style={{borderBottomWidth: 1, borderBlockColor: Colors.medium}}>
                                                                                    <TouchableOpacity style={{
                                                                                        flexDirection: "row",
                                                                                        alignItems: "center",
                                                                                        padding: 16,
                                                                                        paddingHorizontal: 16,
                                                                                        gap: 8,
                                                                                    }} onPress={() => {
                                                                                        openBottomModalCamera(field.code, item.code)
                                                                                    }}>
                                                                                        <Entypo name="plus" size={24} color={Colors.info} style={{top: 1}} />
                                                                                        <Text style={{fontSize: 18, color: Colors.info}}>Изображение</Text>
                                                                                    </TouchableOpacity>

                                                                                    <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                                                                                        {select && select[field.code][item.code]
                                                                                            && select[field.code][item.code].map((image: any) => {
                                                                                                const width = Math.ceil(image.width * (1 - 0.90));
                                                                                                const height = Math.ceil(image.height * (1 - 0.90));
                                                                                                return(
                                                                                                    <View key={image.id} style={{flexDirection: "row", marginVertical: 16,}}>
                                                                                                        <Image style={{
                                                                                                            borderRadius: 8,
                                                                                                            width: width,
                                                                                                            height: height,
                                                                                                        }} source={{uri: image.uri}} />

                                                                                                        <TouchableOpacity style={styles.buttonRemove} onPress={() => {
                                                                                                            onRemoveImage(field.code, item.code, image.id)
                                                                                                        }}>
                                                                                                            <Entypo name="trash" size={24} color={Colors.danger} style={{top: 1}} />
                                                                                                        </TouchableOpacity>
                                                                                                    </View>
                                                                                                );

                                                                                            })}
                                                                                    </View>
                                                                                </View>
                                                                            );
                                                                        } else {
                                                                            if(item.variants) {

                                                                                return (
                                                                                    <Menu>
                                                                                        <MenuTrigger style={[MenuStyle.menuTrigger, {
                                                                                            borderBottomWidth: 1,paddingVertical: 16, borderColor: Colors.medium
                                                                                        }]}>
                                                                                            {select && select[field.code]
                                                                                            && select[field.code][item.code]
                                                                                                ?
                                                                                                <Text style={[MenuStyle.menuText, {color: Colors.info}]}>
                                                                                                    {select[field.code][item.code].name}
                                                                                                </Text>
                                                                                                :
                                                                                                <Text style={[MenuStyle.menuText, {color: Colors.mediumDark}]}>
                                                                                                    Выберите...
                                                                                                </Text>
                                                                                            }
                                                                                            <Ionicons name="chevron-down" size={22} color={Colors.black} />
                                                                                        </MenuTrigger>
                                                                                        <MenuOptions customStyles={{ optionsContainer: {width: "auto"} }}>
                                                                                            <ScrollView style={{ maxHeight: 310, minWidth: 200 }}>
                                                                                                <MenuOption key={`v-${item.code}-empty`} style={MenuStyle.menuOption} onSelect={() => {
                                                                                                    onSelect(field.code, item.code, "empty")
                                                                                                }}>
                                                                                                    <Text style={[MenuStyle.menuText, {paddingVertical: 8, fontStyle: "italic", color: Colors.medium}]}>Пустое значение</Text>
                                                                                                </MenuOption>
                                                                                                {item.variants.map((v: any) => {
                                                                                                    return(
                                                                                                        <MenuOption key={`v-${v.code}`} style={MenuStyle.menuOption} onSelect={() => {
                                                                                                            onSelect(field.code, item.code, {
                                                                                                                code: v.code,
                                                                                                                name: v.name
                                                                                                            })
                                                                                                        }}>
                                                                                                            <Text style={[MenuStyle.menuText, {paddingVertical: 8}]}>{v.name}</Text>
                                                                                                        </MenuOption>
                                                                                                    );
                                                                                                })}
                                                                                            </ScrollView>
                                                                                        </MenuOptions>
                                                                                    </Menu>
                                                                                );
                                                                            }
                                                                        }

                                                                        return null
                                                                    })()}
                                                                </View>
                                                            </View>
                                                        );
                                                    })}
                                                </>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            }
                        </>
                    }

                    {!loading && !loadingSkip && select && (
                        <View style={[rStyle.cardContainer, {flex: 0, padding: 0}]}>
                            <ButtonPrimary title={"Сохранить опросник"} onPress={() => onSave()} />
                        </View>
                    )}
                </View>
            </MenuProvider>

            {showCamera && <ModalCamera visible={showCamera} setVisible={setShowCamera} onOprosnikSelect={onSelect} item_code={itemCode} main_code={fieldCode}/>}
        </Modal>
    );
};

const styles = StyleSheet.create({
    buttonRemove: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 4,
        paddingHorizontal: 16,
        gap: 8,
    },
    btn: {
        padding: 16,
        borderRadius: 8,
        backgroundColor:  Colors.white,
        justifyContent: "space-between",
        flexDirection: "row",
    },
});

export default ModalAddSku;