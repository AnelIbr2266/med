import React, {Dispatch, FC, useEffect, useRef, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity, StyleSheet, PermissionsAndroid, ImageBackground, TouchableWithoutFeedback, Image} from "react-native";
import {AntDesign, Entypo, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import sqlAkciya from "@/sql/user/sqlAkciya";
import {IAppVizity} from "@/types/Vizity";
import {IAkciyaFields, ItemsAkciya} from "@/types/Akciya";
import Loading from "@/components/Loading";
import {fsz, pos, rStyle} from "@/constants/rStyle";
import {ErrorMessage} from "@/components/ErrorMessage";
import {Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger} from "react-native-popup-menu";
import {MenuStyle} from "@/constants/MenuStyle";
import {Camera, useCameraDevice} from "react-native-vision-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import ButtonPrimaryOutline from "@/components/ButtonPrimaryOutline";
import ButtonPrimary from "@/components/ButtonPrimary";
import {CameraStyle} from "@/constants/CameraStyle";


interface PropsCamera {
    visible: boolean;
    setVisible: Dispatch<boolean>;
    onSelect: (main_code: string, item_code: string, select: any) => void
    main_code: string;
    item_code: string;
}

const ModalCamera: FC<PropsCamera> = (props) => {
    const cameraRef = useRef<any>();
    const device = useCameraDevice('back');
    const [startCamera, setStartCamera] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [capturedImage, setCapturedImage] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingView, setLoadingView] = useState<boolean>(false);

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
        );
        if(resize) {
            props.onSelect(props.main_code, props.item_code, Object.assign(resize, {id: Crypto.randomUUID()}));
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
                                        <View style={{ flexDirection: "row", justifyContent: "space-between"}}>
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
                                                        <AntDesign name="close" size={fsz.i24} color={Colors.mediumDark} />
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

const ModalAddAkciya: FC<PropsModal> = (props) => {
    const {addAppAkciya} = sqlAkciya();

    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [select, setSelect] = useState<any | null>(null);
    const [itemCode, setItemCode] = useState<string>("");
    const [fieldCode, setFieldCode] = useState<string>("");

    useEffect(() => {
        (async () => {
            if(props.visible) {
                setLoading(true);
                const result = await new Promise(async (resolve) => {
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


    const openBottomModalCamera = (item_code: string, field_code: string) => {
        setItemCode(item_code);
        setFieldCode(field_code);

        setShowCamera(true);
    };
    const onRemoveImage = (main_code: string, item_code: string) => {
        const copy = {...select};
        delete copy[main_code][item_code];
        setSelect(copy);
    };

    const onSelect = (main_code: string, item_code: string, value: any) => {
        if(select) {
            const copy = {...select};
            if(item_code === "foto") {
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
                if(item_code === "status" && copy[main_code]) {
                    delete copy[main_code].aktivaciya;
                    delete copy[main_code].foto;
                    delete copy[main_code].prichina;
                }
                if(item_code === "aktivaciya" && copy[main_code]) {
                    delete copy[main_code].foto;
                    delete copy[main_code].prichina;
                }

                setSelect(Object.assign({
                    ...copy, ...{
                        [main_code]: Object.assign({
                            ...copy[main_code], ...{
                                [item_code]: {
                                    code: value.code,
                                    name: value.name
                                }
                            }
                        })
                    }
                }));
            }
        } else {
            const obj = {} as any;
            obj[main_code] = {
                [item_code]: {
                    code: value.code,
                    name: value.name
                }
            };
            setSelect(obj);
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
                    obj["bindings_code"] = field.bindings_code
                }
            });
            createFields.push(Object.assign(obj, item));
        }

        await addAppAkciya(createFields, props.vizit.elm___id).then(() => {
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
                        <Text style={ModalStyle.textHeader}>Акции</Text>
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
                        <ScrollView style={{flex: 1}}>
                            {props.fields && props.fields.map((field) => {
                                if(props.vizit["elm_" + field.bindings_code as keyof IAppVizity]) {
                                    return;
                                }
                                return (
                                    <View key={field.code} style={[rStyle.cardContainer, rStyle.shadow, {flex: 0, marginTop: 0, marginBottom: pos.mb16}]}>
                                        <View style={{ marginBottom: 24}}>
                                            <Text style={{fontSize: 22, fontWeight: "500", color: Colors.black}}>
                                                {field.name.split(' - ')[0]}
                                            </Text>
                                            <Text style={{fontSize: 18, color: Colors.medium, fontStyle: "italic"}}>{field.value}</Text>
                                        </View>
                                        <View style={{ flexDirection: "row", marginBottom: 16, gap: 32 }}>
                                            {/*PHOTO*/}
                                            <View style={{ width: "18%", alignItems: "center"}}>
                                                {ItemsAkciya && ItemsAkciya.map((item) => {
                                                    if(item.code !== "foto") return;
                                                    let emptyStatus, emptyActivate;

                                                    if(!select) {
                                                        emptyStatus = true;
                                                        emptyActivate = true;
                                                    } else {
                                                        if(select.hasOwnProperty(field.code)) {
                                                            if(select[field.code][item.conditions[0].a.value].name !== item.conditions[0].b.value[0].name) {
                                                                emptyStatus = true;
                                                            }

                                                            if (select[field.code][item.conditions[1].a.value]) {
                                                                if(select[field.code][item.conditions[1].a.value].name !== item.conditions[1].b.value[0].name) {
                                                                    emptyActivate = true;
                                                                }
                                                            } else {
                                                                emptyActivate = true;
                                                            }
                                                        } else {
                                                            emptyStatus = true;
                                                            emptyActivate = true;
                                                        }
                                                    }

                                                    if(emptyStatus && emptyActivate) {
                                                        return (
                                                            <View key={item.code}>
                                                                <MaterialCommunityIcons name="camera-off-outline" size={fsz.i48} color={Colors.grey} />
                                                            </View>
                                                        );
                                                    } else {
                                                        return(
                                                            <View key={item.code}>
                                                                {select[field.code] && select[field.code][item.code]
                                                                    ?
                                                                    <>
                                                                        {select[field.code][item.code].map((image: any) => {
                                                                            const width = Math.ceil(image.width * (1 - 0.90));
                                                                            const height = Math.ceil(image.height * (1 - 0.90));
                                                                            return (
                                                                                <View key={image.id} style={{flexDirection: "column"}}>
                                                                                    <Image style={{borderRadius: 8, width: width, height: height}}
                                                                                           source={{uri: image.uri}} />
                                                                                    <TouchableOpacity style={rStyle.buttonRemoveImage} onPress={() => onRemoveImage(field.code, item.code)}>
                                                                                        <Entypo name="trash" size={fsz.i24} color={Colors.danger} />
                                                                                    </TouchableOpacity>
                                                                                </View>
                                                                            );
                                                                        })}
                                                                    </>
                                                                    :
                                                                    <>
                                                                        <TouchableOpacity style={{}} onPress={() => openBottomModalCamera(item.code, field.code)}>
                                                                            <MaterialCommunityIcons name="camera-plus" size={fsz.i48} color={Colors.danger} />
                                                                        </TouchableOpacity>
                                                                    </>
                                                                }
                                                            </View>
                                                        );
                                                    }
                                                })}
                                            </View>
                                            {/*SELECT*/}
                                            <View style={{flex: 1}}>
                                                {ItemsAkciya && ItemsAkciya.map((item) => {
                                                    if(item.code === "foto") return;

                                                    if(item.code === "aktivaciya" && item.conditions.length > 0) {
                                                        if(!select) return;
                                                        if(!select[field.code]) return;
                                                        if(!select[field.code][item.conditions[0].a.value]) return;

                                                        if(select[field.code] && select[field.code][item.conditions[0].a.value].name !== item.conditions[0].b.value[0].name) return;
                                                    }

                                                    if(item.code === "prichina") {
                                                        if(!select) return;
                                                        if(!select[field.code]) return;
                                                        if(!select[field.code][item.conditions[0].a.value]) return;
                                                        if(!select[field.code][item.conditions[1].a.value]) return;

                                                        if(select[field.code][item.conditions[0].a.value].name !== item.conditions[0].b.value[0].name &&
                                                            select[field.code][item.conditions[1].a.value].name !== item.conditions[1].b.value[0].name) {
                                                            return;
                                                        }
                                                    }

                                                    return(
                                                        <View key={item.code} style={{marginBottom: pos.mb16,
                                                            flexDirection: props.isTabled ? "row" : "column",
                                                            gap:  props.isTabled ? 16 : 0,
                                                        }}>
                                                            <View style={{ width: props.isTabled ? "24%" : "100%",  justifyContent: "center"}}>
                                                                {(() => {
                                                                    if(select && select[field.code] && select[field.code][item.code]) {
                                                                        return (
                                                                            <Text style={{fontSize: fsz.s18, color: Colors.black}}>{item.name}:</Text>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <Text style={{fontSize: fsz.s18, color: Colors.danger}}>{item.name}:</Text>
                                                                        );
                                                                    }
                                                                })()}
                                                            </View>
                                                            <View style={{flex: 1}}>
                                                                {(() => {
                                                                    if(item.variants) {
                                                                        return (
                                                                            <Menu>
                                                                                <MenuTrigger style={[MenuStyle.menuTrigger, {
                                                                                    borderBottomWidth: 1,paddingVertical: pos.pv16, borderColor: Colors.medium
                                                                                }]}>
                                                                                    {select && select[field.code] && select[field.code][item.code]
                                                                                        ?
                                                                                        <Text style={[MenuStyle.menuText, {color: Colors.main}]}>
                                                                                            {select[field.code][item.code].name}
                                                                                        </Text>
                                                                                        :
                                                                                        <Text style={[MenuStyle.menuText, {color: Colors.mediumDark}]}>
                                                                                            Выберите...
                                                                                        </Text>
                                                                                    }
                                                                                    <Ionicons name="chevron-down" size={fsz.i22} color={Colors.black} />
                                                                                </MenuTrigger>
                                                                                <MenuOptions customStyles={{ optionsContainer: {width: "auto"} }}>
                                                                                    <ScrollView style={{ maxHeight: 310, minWidth: 200 }}>
                                                                                        {item.variants.map((v: any) => {
                                                                                            return(
                                                                                                <MenuOption key={`v-${v.code}`} style={MenuStyle.menuOption} onSelect={() => {
                                                                                                    onSelect(field.code, item.code, v)
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
                                                                    return null
                                                                })()}
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    }
                    {!loading && select && (
                        <View style={[rStyle.cardContainer, {flex: 0, padding: 0}]}>
                            <ButtonPrimary title={"Сохранить акции"} onPress={() => onSave()} />
                        </View>
                    )}
                </View>
            </MenuProvider>

            {showCamera &&
                <ModalCamera visible={showCamera} setVisible={setShowCamera} onSelect={onSelect} item_code={itemCode} main_code={fieldCode}/>
            }
        </Modal>
    );
};


export default ModalAddAkciya;