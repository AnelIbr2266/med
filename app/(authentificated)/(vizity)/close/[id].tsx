import React, {useEffect, useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import Colors from "@/constants/Colors";
import {useAuth} from "@/context/AuthContext";
import {useLocation} from "@/hooks/useLocation";
import sqlVizity from "@/sql/user/sqlVizity";
import sqlAkciya from "@/sql/user/sqlAkciya";
import sqlOprosnik from "@/sql/user/sqlOprosnik";
import sqlDeteiling from "@/sql/user/sqlDeteiling";
import sqlPostponed from "@/sql/user/sqlPostponed";
import {useLocalSearchParams, useRouter} from "expo-router";
import {ItemsSaveVizit} from "@/components/items/ItemsSaveVizit";
import ButtonPrimary from "@/components/ButtonPrimary";
import {arrStatus} from "@/types/Status";
import {AntDesign} from "@expo/vector-icons";
import {fsz, rStyle} from "@/constants/rStyle";


const CloseVizitPage = () => {
    const {isConnect, app_user, getSetIsVizityAdd} = useAuth();
    const {getLocation} = useLocation();
    const {getVizityOne, updateElmaVizity, updateAppVizit} = sqlVizity();
    const {getAkciyaQuery}  = sqlAkciya();
    const {getOprosnikQuery}  = sqlOprosnik();
    const {getDeteilingQuery}  = sqlDeteiling();
    const {akciyaPostponed, oprosnikPostponed, deteilingPostponed, vizitPostponed,
        selectAkciyaPostponed, selectOprosnikPostponed, selectDeteilingPostponed,
    }  = sqlPostponed();

    const router = useRouter();
    const {id} = useLocalSearchParams<any>();

    const [loading, setLoading] = useState<boolean>(false);
    const [selectStatus, setSelectStatus] = useState<any | null>(null);
    const [comment, setComment] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const [showSave, setShowSave] = useState<boolean>(false);
    const [finalSave, setFinalSave] = useState<boolean>(false);

    const [loadingApp, setLoadingApp] = useState<boolean>(false);
    const [appFinal, setAppFinal] = useState<boolean>(false);

    const [loadingAkciya, setLoadingAkciya] = useState<boolean>(false);
    const [haveAkciya, setHaveAkciya] = useState<any>(null);
    const [akciyaFinal, setAkciyaFinal] = useState<boolean>(false);

    const [loadingOprosnik, setLoadingOprosnik] = useState<boolean>(false);
    const [haveOprosnik, setHaveOprosnik] = useState<any>(null);
    const [oprosnikFinal, setOprosnikFinal] = useState<boolean>(false);

    const [loadingDeteiling, setLoadingDeteiling] = useState<boolean>(false);
    const [haveDeteiling, setHaveDeteiling] = useState<any>(null);
    const [deteilingFinal, setDeteilingFinal] = useState<boolean>(false);

    useEffect(() => {
        setSelectStatus(null);
    }, []);

    const onSaveCloseVizit = async () => {
        if (app_user) {
            setLoading(true);
            const now = new Date();
            const {location} = await getLocation();
            const fields: any = {
                __status: selectStatus,
                data_zakrytiya: String(now.getTime()),
                koordinaty_zakrytiya_vizita: location ? `${location.lat}, ${location.lon}`: "",
                kommentarii: comment
            };

            const localResult = await updateAppVizit(fields, id);
            if (localResult) {
                setAppFinal(true);

                if (isConnect) {
                    const {app_vizit} = await getVizityOne('*', `AND id = ${id}`);
                    if (!app_vizit) return;

                    const sql = `AND elm_id_vizita = "${app_vizit.elm___id}"`;

                    const {app_akciya} = await getAkciyaQuery('*', sql);
                    if (app_akciya) await akciyaPostponed(app_user.userId, app_akciya, app_vizit); // здесь можно переименовать метод, если он больше не отложенный

                    const {app_oprosnik} = await getOprosnikQuery('*', sql);
                    if (app_oprosnik) await oprosnikPostponed(app_user.userId, app_oprosnik, app_vizit);

                    const {app_deteiling} = await getDeteilingQuery('*', sql);
                    if (app_deteiling) await deteilingPostponed(app_user.userId, app_deteiling);

                    await updateElmaVizity(app_user.userId, app_vizit);
                }

                getSetIsVizityAdd(Date.now());
                setFinalSave(true);
            } else {
                setAppFinal(true);
            }

            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={{flex: 1, backgroundColor: Colors.mainBG}}>
            <View style={{marginBottom: 36}}>
                <View style={{position: "relative", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 64, marginHorizontal: 32}}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: "center", gap: 16}} onPress={router.back}>
                        <AntDesign name="close" size={fsz.i24} color={Colors.black} style={{top: 1}} />
                        <Text style={{ fontSize: fsz.s22, fontWeight: "500", color: Colors.black }}>Закрытие визита</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[rStyle.cardContainer, {marginTop: 0}]}>
                {loading
                    ?
                    <View style={{flex: 1}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 22, fontWeight: "500", marginBottom: 0}}>Сохраняем данные</Text>
                            <View style={{marginBottom: 32}}>
                                {isConnect
                                    ?
                                    <Text style={{fontSize: 18, color: Colors.success}}>Интернет подключен</Text>
                                    :
                                    <Text style={{fontSize: 18, color: Colors.warningDark}}>Без подключения к интернету</Text>
                                }
                            </View>
                            <View style={{}}>
                                <ItemsSaveVizit title={"Визит"} loading={loadingApp} final={appFinal} have={true} />
                                {showSave &&
                                    <>
                                        <ItemsSaveVizit title={"Акции"} loading={loadingAkciya} final={akciyaFinal} have={haveAkciya} />
                                        <ItemsSaveVizit title={"Опросник"} loading={loadingOprosnik} final={oprosnikFinal} have={haveOprosnik} />
                                        <ItemsSaveVizit title={"Презентация"} loading={loadingDeteiling} final={deteilingFinal} have={haveDeteiling} />
                                    </>
                                }
                            </View>
                        </View>

                        <View>
                            {finalSave
                                ?
                                <>
                                    {isConnect
                                        ?
                                        <Text style={{fontSize: 18, color: Colors.success, marginBottom: 16}}>Данные успешно записаны!</Text>
                                        :
                                        <Text style={{fontSize: 18, color: Colors.warningDark, marginBottom: 16}}>Данные визита обновлены, но не записаны. Исправьте на "Главной", при подключении к интернету.</Text>
                                    }
                                    <ButtonPrimary title={"Завершить"} onPress={() => {
                                        router.replace("/visity");
                                        // router.replace("/(auth)/(user)/(tabs)/vizity");
                                    }} />
                                </>
                                :
                                <ButtonPrimary title={"Пожалуйста подождите..."} onPress={() => {}} />
                            }
                        </View>
                    </View>
                    :
                    <>
                        <View style={{flex: 1,}}>
                            <View style={styles.rowButtons}>
                                {arrStatus.map((status, index) => {
                                    if(status.code === "plan") return;

                                    if(status.code === "fakt") {
                                        return(
                                            <Pressable key={status.code} style={[styles.btn, selectStatus && selectStatus.code === status.code ? styles.buttonPrimary : styles.buttonPrimaryOutline, {}]} onPress={() => setSelectStatus(status)}>
                                                <Text style={[styles.btnText, selectStatus && selectStatus.code === status.code ? styles.buttonPrimaryText : styles.buttonPrimaryOutlineText, {
                                                    fontWeight: "400",
                                                }]}>Визит завершён</Text>
                                            </Pressable>
                                        );
                                    } else {
                                        return(
                                            <Pressable key={status.code} style={[styles.btn,
                                                selectStatus && selectStatus.code === status.code ? styles.buttonDanger : styles.buttonDangerOutline, {
                                                    borderBottomWidth: arrStatus.length - 1 === index ? 0 : 1
                                                }]} onPress={() => setSelectStatus(status)}>
                                                <Text style={[styles.btnText, selectStatus && selectStatus.code === status.code ? styles.buttonDangerText : styles.buttonDangerOutlineText, {
                                                    fontWeight: "400",
                                                }]}>{status.name}</Text>
                                            </Pressable>
                                        );
                                    }
                                })}
                            </View>
                        </View>
                        {selectStatus && (
                            <>
                                <View style={{flexDirection: "row", gap: 8, marginBottom: 16}}>
                                    <Text style={[styles.text]}>Подтвердите выбор:</Text>
                                    {selectStatus.name === "Факт"
                                        ?
                                        <Text style={[styles.text, {color: Colors.info}]}>Визит завершён</Text>
                                        :
                                        <Text style={[styles.text, {color: Colors.danger}]}>{selectStatus.name}</Text>
                                    }
                                </View>

                                <TextInput style={rStyle.input} placeholder="Комментарий" value={comment} onChangeText={setComment}/>
                                <View style={{marginTop: 16}}>
                                    <ButtonPrimary title={"Подтвердить"} onPress={() => onSaveCloseVizit()} />
                                </View>
                            </>
                        )}
                    </>
                }
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    text: {
        color: Colors.black,
        fontSize: 18,
    },
    rowButtons: {
        marginTop: 16,
        marginHorizontal: "20%",
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        overflow: "hidden",
    },
    btn: {
        justifyContent: "center",
        backgroundColor: Colors.info,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    btnText: {
        fontSize: 18,
        fontWeight: "bold"
    },
    buttonPrimary: {
        backgroundColor: Colors.info,
    },
    buttonPrimaryText: {
        color: Colors.white,
    },
    buttonPrimaryOutline: {
        backgroundColor: Colors.white,
    },
    buttonPrimaryOutlineText: {
        color: Colors.info,
    },
    buttonDangerOutline: {
        backgroundColor: Colors.white,
    },
    buttonDangerOutlineText: {
        color: Colors.danger,
    },
    buttonDangerText: {
        color: Colors.white,
    },
    buttonDanger: {
        backgroundColor: Colors.danger,
    },
});

export default CloseVizitPage;