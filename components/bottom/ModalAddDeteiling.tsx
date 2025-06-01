import React, {Dispatch, FC, useEffect, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import {IAppVizity} from "@/types/Vizity";
import Loading from "@/components/Loading";
import {rStyle} from "@/constants/rStyle";
import {MenuProvider} from "react-native-popup-menu";
import ButtonPrimary from "@/components/ButtonPrimary";
import {IDeteilingFields, ItemsDeteiling} from "@/types/Deteiling";
import sqlDeteiling from "@/sql/user/sqlDeteiling";
import {ModalImage} from "@/components/modals/ModalImage";


interface PropsModal {
    vizit: IAppVizity;
    visible: boolean;
    setVisible: Dispatch<boolean>;
    fields: IDeteilingFields[];
    onReload: () => void;
    isTabled: boolean;
}

const ModalAddDeteiling: FC<PropsModal> = (props) => {
    const {addAppDeteiling} = sqlDeteiling();
    const [blockWidth, setBlockWidth] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [showImage, setShowImage] = useState<boolean>(false);
    const [image, setImage] = useState<any>(null);

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

    const onMapLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if(blockWidth !== width) {
            setBlockWidth(Math.ceil(width) - 24);
        }
    }

    const openModalImage = (image: any, name: string) => {
        setShowImage(true);
        setImage(Object.assign(image, {title: name}));
    };


    const onSave = async () => {
        setLoading(true);

        const obj = {} as any;
        props.fields.find((field: any) => {
            const code = field.code.split('_').slice(1).join('_');
            obj[code] = "Да"
        });
        Object.assign(obj, {deteiling: "Да"})

        const result = await new Promise(async (resolve) => {
            await addAppDeteiling(obj, props.vizit).then(() => {
                props.onReload();
            });
            resolve(true);
        });

        if(result) {
            setTimeout(() => {
                props.setVisible(false);
                setLoading(false);
            }, 300);
        }
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
                <View style={[ModalStyle.modalView, {margin: 0, marginTop: "10%", backgroundColor: Colors.greyBg, borderRadius: 0}]}>
                    <View style={[ModalStyle.modalHeader, {marginBottom: 0}]}>
                        <Text style={ModalStyle.textHeader}>Презентация</Text>
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
                            <ScrollView style={[rStyle.cardContainer]}  onLayout={(event) => onMapLayout(event)}>
                                {ItemsDeteiling && ItemsDeteiling.map((item) => {
                                    return (
                                        <View key={item.code}>
                                            {props.fields && props.fields.map((field) => {

                                                let manyImages = false;
                                                if(field.images.length > 1) {
                                                    manyImages = true;
                                                }

                                                return (
                                                    <View key={field.name} style={{ marginBottom: 48}}>
                                                        <Text style={{fontSize: 22, fontWeight: "500", color: Colors.black, marginBottom: 16}}>
                                                            {field.name}
                                                        </Text>
                                                        <View style={{flexDirection: "row", gap: 16}}>

                                                            {field.images.map((image: any) => {
                                                                let width = image.width;
                                                                let height = image.height;

                                                                if(image.width > blockWidth) {
                                                                    const diff= Math.ceil((image.width-blockWidth) / image.width * 100) / 100;
                                                                    width = image.width - (image.width - blockWidth);
                                                                    height = Math.ceil(image.height * (1 - diff));
                                                                }
                                                                return (
                                                                    <View key={image.id} style={{
                                                                        flex: 1,
                                                                        width: manyImages ? "50%" : "100%"}}>
                                                                        <TouchableOpacity  onPress={() => {
                                                                            openModalImage(image, field.name);
                                                                        }}>
                                                                            <Image source={{uri: image.uri}} style={{
                                                                                width: manyImages ? (width/2 - 8) : width,
                                                                                height: manyImages ? (height/2 - 8) : height,
                                                                            }} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            <View style={[rStyle.cardContainer, {flex: 0, padding: 0, marginTop: 0}]}>
                                <ButtonPrimary title={"Завершить презентацию"} onPress={() => onSave()} />
                            </View>

                            {image && <ModalImage visible={showImage} setVisible={setShowImage} image={image} isTabled={props.isTabled}/>}
                        </>
                    }
                </View>
            </MenuProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.info,
        fontSize: 18,
        fontWeight: "500"
    },
});
export default ModalAddDeteiling;