import {Dispatch, FC, useEffect, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import {IAppOprosnik} from "@/types/Oprosnik";
import sqlSettings from "@/sql/user/sqlSettings";
import sqlAkciya from "@/sql/user/sqlAkciya";
import {IAppVizity} from "@/types/Vizity";
import {IAppAkciya} from "@/types/Akciya";
import {ItemImages} from "@/components/items/ItemImages";
import Loading from "@/components/Loading";
import {useAuth} from "@/context/AuthContext";
import {WarningMessage} from "@/components/WarningMessage";
import {fsz, pos, rStyle} from "@/constants/rStyle";

interface PropsModal {
    visible: boolean;
    setVisible: Dispatch<boolean>;
    vizit: IAppVizity;
    isTabled: boolean;
}

const ModalAkciya: FC<PropsModal> = (props) => {
    const {app_user, isConnect} = useAuth();
    const {getAkciyaQuery, getElmaKartinkiAkciya} = sqlAkciya();
    const {getSettings} = sqlSettings();

    const [error, setError] = useState<string>("");
    const [akciya, setAkciya] = useState<IAppOprosnik[] | any>(null);
    const [fields, setFields] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [reload, setReload] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if(props.visible) {
                setLoading(true);
                const result = await new Promise(async (resolve) => {
                    if(!akciya || reload) {
                        setReload(false);

                        const sql = `AND elm_id_vizita = "${props.vizit.elm___id}"`;
                        getAkciyaQuery('*', sql).then(({app_akciya}) => {
                            setAkciya(app_akciya)
                        });
                    }

                    if(!fields) {
                        getSettings('*', `AND elm_table = "akciya"`).then(({app_settings}) => {
                            if(app_settings) {
                                const arrFields = [] as any;
                                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                                const elm_conditions = JSON.parse(app_settings[0].elm_conditions);
                                Object.keys(elm_fields).forEach((key) => {
                                    const code = elm_fields[key].code;
                                    if(elm_conditions[code]) {
                                        arrFields.push({
                                            name: elm_fields[key].name,
                                            code: elm_fields[key].code,
                                        })
                                    }
                                });
                                setFields(arrFields);
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
    }, [props.visible, reload]);

    const onLoadImages = async () => {
        setLoading(true);
        const result = await new Promise(async (resolve) => {
            if (isConnect) {
                await getElmaKartinkiAkciya(app_user!.userId, props.vizit.elm___id).finally(() => {
                    setReload(true);
                });
            } else {
                setError("Требуется подключение к интернету.");
            }
            resolve(true);
        });

        if(result) {
            setTimeout(() => {
                setLoading(false);
            }, 300)
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
            <Pressable style={ModalStyle.modalContainer} onPress={() => props.setVisible(false)}></Pressable>
            <View style={[ModalStyle.modalView, {margin: props.isTabled ? "5%" : "2%", backgroundColor: Colors.greyBg }]}>
                <View style={[ModalStyle.modalHeader, {borderTopLeftRadius: 20, borderTopRightRadius: 20}]}>
                    <Text style={ModalStyle.textHeader}>Акция на покупателя</Text>
                    <Pressable style={[ModalStyle.buttonClose]} onPress={() => props.setVisible(false)}>
                        <AntDesign name="close" size={24} color={Colors.black} />
                    </Pressable>
                </View>
                {loading
                    ?
                    <View style={{flex: 1}}>
                        <Loading />
                    </View>
                    :
                    <ScrollView style={{ flex: 1, marginTop: pos.mt16}}>
                        {error && !isConnect &&
                            <View style={{marginHorizontal: pos.h16, marginBottom: pos.mb16}}>
                                <WarningMessage message={error}/>
                            </View>
                        }
                        {akciya && akciya.map((item: IAppAkciya | any) => {
                            return (
                                <View key={item.id} style={[rStyle.cardContainer, { marginTop: 0, marginBottom: pos.mb16}]}>
                                    <View style={{ marginBottom: props.isTabled ? 48 : 24}}>
                                        <Text style={{fontSize: fsz.s22, fontWeight: "500", color: Colors.black}}>
                                            {item.elm_brend}
                                        </Text>
                                        <Text style={{fontSize: fsz.s18, color: Colors.medium, fontStyle: "italic"}}>{item.elm_akciya_mekhanizm}</Text>
                                    </View>
                                    {fields && fields.map((field: any) => {
                                        if(!["status", "aktivaciya", "foto", "prichina"].includes(field.code)) return;

                                        const code = "elm_" + field.code;
                                        if(!item[code]) {
                                            return;
                                        }
                                        return(
                                            <View key={field.code} style={{marginBottom: pos.mb16,
                                                flexDirection: props.isTabled ? "row" : "column",
                                                gap:  props.isTabled ? 16 : 0,
                                            }}>
                                                <View style={{ width: props.isTabled ? "33%" : "100%",  justifyContent: "flex-start"}}>
                                                    <Text style={{fontSize: fsz.s18,
                                                        color: props.isTabled ? Colors.black : Colors.mediumDark
                                                    }}>{field.name}:</Text>
                                                </View>
                                                {(() => {
                                                    if(code === "elm_foto") {
                                                        if(item[code] === "have") {
                                                            return (
                                                                <TouchableOpacity onPress={() => onLoadImages()}>
                                                                    <Text style={{fontSize: fsz.s18, color: Colors.info }}>Загрузить фото</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        } else {
                                                            const image = JSON.parse(item[code]);
                                                            return <ItemImages images={image} title={item.elm_brend} isTabled={props.isTabled}/>;
                                                        }
                                                    } else {
                                                        const value = JSON.parse(item[code]);
                                                        return <Text style={{fontSize: fsz.s18, color: Colors.info }}>{value.name}</Text>
                                                    }
                                                })()}
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </ScrollView>
                }
            </View>
        </Modal>
    );
};


export default ModalAkciya;