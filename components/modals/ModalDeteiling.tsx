import React, {Dispatch, FC, useEffect, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import {IAppVizity} from "@/types/Vizity";
import {fsz, rStyle} from "@/constants/rStyle";
import Loading from "@/components/Loading";

interface PropsModal {
    visible: boolean;
    setVisible: Dispatch<boolean>;
    vizit: IAppVizity;
    deteiling: any;
    deteilingItems: any;
    isTabled: boolean;
}

const ModalDeteiling: FC<PropsModal> = (props) => {
    const [loading, setLoading] = useState<boolean>(false);

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

    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => {
                props.setVisible(false);
            }}
        >
            <Pressable style={ModalStyle.modalContainer} onPress={() => props.setVisible(false)}></Pressable>
            <View style={[ModalStyle.modalView, {margin: props.isTabled ? "5%" : "2%", backgroundColor: Colors.greyBg }]}>
                <View style={[ModalStyle.modalHeader, {borderTopLeftRadius: 20, borderTopRightRadius: 20}]}>
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
                    <ScrollView style={{ flex: 1, marginTop: 16}}>
                        <View>
                            {props.deteiling ?
                                props.deteiling.elm_prichina
                                    ?
                                    <>
                                        {(() => {
                                            const elm_prichina = JSON.parse(props.deteiling.elm_prichina);
                                            return (
                                                <View style={[rStyle.cardContainer, {marginTop: 0}]}>
                                                    <Text style={{fontSize: fsz.s16}}>Причина</Text>
                                                    <Text style={{fontSize: fsz.s18, color: Colors.info}}>{elm_prichina.name}</Text>
                                                </View>
                                            );
                                        })()}
                                    </>
                                    :
                                    props.deteilingItems.map((item: any) => {
                                        const code = "elm_" + item.code;
                                        if(props.deteiling[code]) {
                                            return (
                                                <View key={item.code} style={[rStyle.cardContainer, {
                                                     marginTop: 0
                                                }]}>
                                                    <Text style={{fontSize: fsz.s22, fontWeight: "500", color: Colors.black}}>{item.name}</Text>
                                                    <Text style={{fontSize: fsz.s18, color: Colors.info}}>{props.deteiling[code]}</Text>
                                                </View>
                                            )
                                        }
                                    })
                                :
                                null
                            }
                        </View>
                    </ScrollView>
                }

            </View>
        </Modal>
    );
};


export default ModalDeteiling;