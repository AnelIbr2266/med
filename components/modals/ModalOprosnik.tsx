import React, {Dispatch, FC, useEffect, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import {IAppVizity} from "@/types/Vizity";
import sqlOprosnik from "@/sql/user/sqlOprosnik";
import sqlSettings from "@/sql/user/sqlSettings";
import {IAppOprosnik} from "@/types/Oprosnik";
import {IAppTochki} from "@/types/Tochki";
import {ItemImages} from "@/components/items/ItemImages";
import Loading from "@/components/Loading";
import {useAuth} from "@/context/AuthContext";
import {WarningMessage} from "@/components/WarningMessage";
import {fsz, pos, rStyle} from "@/constants/rStyle";


interface PropsModal {
    visible: boolean;
    setVisible: Dispatch<boolean>;
    vizit: IAppVizity;
    tochka: IAppTochki | any;
    isTabled: boolean;
}

const ModalOprosnik: FC<PropsModal> = (props) => {
    const {app_user, isConnect} = useAuth();
    const {getOprosnikQuery, getElmaKartinkiOprosnika} = sqlOprosnik();
    const {getSettings} = sqlSettings();

    const [error, setError] = useState<string>("");
    const [fields, setFields] = useState<any | null>(null);
    const [matrix, setMatrix] = useState<any | null>(null);
    const [oprosnik, setOprosnik] = useState<IAppOprosnik[] | any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [reload, setReload] = useState<boolean>(false);

    useEffect(() => {
        if(props.visible) {
            setLoading(true);
            if(!oprosnik || reload) {
                setReload(false);

                const sql = `AND elm_id_vizita = "${props.vizit.elm___id}"`;
                getOprosnikQuery('*', sql).then(({app_oprosnik}) => {
                    setOprosnik(app_oprosnik)
                });
            }

            if(!matrix) {
                getSettings('*', `AND elm_table = "tochki"`).then(({app_settings}) => {
                    if(app_settings) {
                        const fields = JSON.parse(app_settings[0].elm_fields);
                        const obj = {} as any
                        Object.keys(fields).forEach((key) => {
                            if (String(fields[key].tooltip).trim() === "тип матрицы") {
                                const code = "elm_" + fields[key].code;
                                if(props.tochka[code]) {
                                    Object.assign(obj, {[fields[key].name]: props.tochka[code]})
                                }
                            }
                        });
                        setMatrix(obj);
                    }
                });
            }

            if(!fields) {
                getSettings('*', `AND elm_table = "oprosnik"`).then(({app_settings}) => {
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
            setTimeout(() => {
                setLoading(false);
            }, 200);
        }
    }, [props.visible, reload]);


    const onLoadImages = async () => {
        setLoading(true);
        const result = await new Promise(async (resolve) => {
            if (isConnect) {
                await getElmaKartinkiOprosnika(app_user!.userId, props.vizit.elm___id).finally(() => {
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
                    <Text style={ModalStyle.textHeader}>Опросник</Text>
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
                    <ScrollView style={{ flex: 1, marginTop: 16}}>
                        {error && !isConnect &&
                            <View style={{marginHorizontal: 16, marginBottom: 16}}>
                                <WarningMessage message={error}/>
                            </View>
                        }
                        {oprosnik && oprosnik.map((item: IAppOprosnik | any) => {
                            return (
                                <View key={item.id} style={[rStyle.cardContainer, { marginTop: 0, marginBottom: 16}]}>
                                    <View style={{ marginBottom: 24}}>
                                        <Text style={{fontSize: fsz.s22, fontWeight: "500", color: Colors.black}}>
                                            {item.elm_brand_sku}
                                        </Text>
                                        <Text style={{fontSize: fsz.s18, color: Colors.medium, fontStyle: "italic"}}>{matrix && matrix[item.elm_brand_sku] ? matrix[item.elm_brand_sku]: null}</Text>
                                    </View>
                                    {fields && fields.map((field: any) => {
                                        if(!["tovarnyi_zapas_v_apteke_po_preparatu", "propustit_snyatie_ostatkov_i_formirovanie_zakaza", "zakaz", "prichina_otsutstviya_preparata", "prikrepit_foto_vykladki", "propustit_fotofiksaciyu"].includes(field.code)) return;

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
                                                        color: props.isTabled ? Colors.black : Colors.mediumDark,
                                                    }}>{field.name}:</Text>
                                                </View>
                                                {(() => {
                                                    if(code === "elm_prikrepit_foto_vykladki") {
                                                        if(item[code] === "have") {
                                                            return (
                                                                <TouchableOpacity onPress={() => onLoadImages()}>
                                                                    <Text style={{fontSize: 18, color: Colors.info }}>Загрузить фото</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        } else {
                                                            const images = JSON.parse(item[code]);
                                                            return <ItemImages images={images} title={item.elm_brand_sku} isTabled={props.isTabled}/>
                                                        }

                                                    } else if(code === "elm_tovarnyi_zapas_v_apteke_po_preparatu") {
                                                        return <Text style={{fontSize: 18, color: Colors.info }}>{item[code]}</Text>
                                                    } else {
                                                        const value = JSON.parse(item[code]);
                                                        return <Text style={{fontSize: 18, color: Colors.info }}>{value.name}</Text>
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

export default ModalOprosnik;