import React, {Dispatch, FC, useEffect, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity, StyleSheet} from "react-native";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import {IAppVizity} from "@/types/Vizity";
import Loading from "@/components/Loading";
import {useAuth} from "@/context/AuthContext";
import {rStyle} from "@/constants/rStyle";
import {ErrorMessage} from "@/components/ErrorMessage";
import {Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger} from "react-native-popup-menu";
import {MenuStyle} from "@/constants/MenuStyle";
import DateTimePicker from "@react-native-community/datetimepicker";
import sqlVizity from "@/sql/user/sqlVizity";
import ButtonPrimary from "@/components/ButtonPrimary";
import {WarningMessage} from "@/components/WarningMessage";


interface PropsModal {
    vizit: IAppVizity;
    visible: boolean;
    setVisible: Dispatch<boolean>;
    onReload: () => void;
}

const ModalUpdateVizit: FC<PropsModal> = (props) => {
    const {isConnect, app_user} = useAuth();
    const {updateElmaVizity, updateAppVizit} = sqlVizity();

    const startAt = Number(props.vizit.elm_data_vremya);
    const create = new Date(startAt);
    const timeString = create.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute:'2-digit'
    })
    const [selectStartAtDate, setSelectStartAtDate] = useState<Date>(new Date(startAt));
    const [selectStartAtTime, setSelectStartAtTime] = useState<string>(timeString);
    const [showStartAt, setShowStartAt] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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


    const onChangeDate = (event: any, selectedDate: any) => {
        setShowStartAt(false);
        setSelectStartAtDate(selectedDate);
    };

    const onChangeTime = (selectedTime: any) => {
        setShowStartAt(false);
        setSelectStartAtTime(selectedTime);
    };

    const showDatepicker = () => {
        setShowStartAt(true);
    };

    const times = () => {
        const arr = [] as any;
        for (let i = 0; i < 24; i++) {
            let a = String(i)
            let b = '00'

            if (i < 10) {
                a = '0' + i;
            }
            arr.push(`${a}:${b}`)
            arr.push(`${a}:30`)
        }
        return arr
    }

    const onUpdateVizit = async () => {
        if(app_user) {
            setLoading(true);
            const timeSplit = selectStartAtTime.split(":");
            selectStartAtDate.setHours(Math.ceil(Number(timeSplit[0])), Math.ceil(Number(timeSplit[1])), 0, 0);

            const app_vizit = Object.assign(props.vizit, {
                elm_data_vremya: String(selectStartAtDate.getTime()),
            });

            const result = await new Promise(async (resolve) => {
                await updateElmaVizity(app_user.userId, app_vizit).then(async (result) => {
                   if (result) {
                       props.onReload();
                    } else {
                        setError('Визит не обновился! Попробуйте обновить ещё раз.');
                    }
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
    };


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
                <View style={[ModalStyle.modalView, {margin: 0, marginTop: "80%", backgroundColor: Colors.mainBG, borderRadius: 0 }]}>
                    <View style={[ModalStyle.modalHeader]}>
                        <Text style={ModalStyle.textHeader}>Редактирование визита</Text>
                        <Pressable style={[ModalStyle.buttonClose]} onPress={() => props.setVisible(false)}>
                            <AntDesign name="close" size={24} color={Colors.black} />
                        </Pressable>
                    </View>
                    <View style={[rStyle.cardContainer, rStyle.shadow]}>
                        {loading
                            ?
                            <Loading style={{backgroundColor: Colors.white}} />
                            :
                            <>
                                {error && (
                                    <View style={{marginBottom: 16}}>
                                        <ErrorMessage message={error} />
                                    </View>
                                )}
                                <View style={styles.dateGrid}>
                                    <Text style={styles.subHeader}>Дата начала:</Text>
                                    <View style={[styles.dateRow, {marginBottom: 32}]}>
                                        <TouchableOpacity onPress={() => showDatepicker()} style={styles.dateContainer}>
                                            <Text style={[styles.text]}>
                                                {selectStartAtDate.toLocaleString().split(',')[0]}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={22} color={Colors.mediumDark} />
                                        </TouchableOpacity>
                                        <View style={styles.timeContainer}>
                                            <Menu>
                                                <MenuTrigger style={MenuStyle.menuTrigger}>
                                                    <Text style={[MenuStyle.menuText, {color: Colors.info}]}>
                                                        {selectStartAtTime}
                                                    </Text>
                                                    <Ionicons name="chevron-down" size={22} color={Colors.black} />
                                                </MenuTrigger>
                                                <MenuOptions customStyles={{ optionsContainer: {width: "auto"} }}>
                                                    <ScrollView style={{ maxHeight: 310 }}>
                                                        {times() && times().map((v: any) => {
                                                            return(
                                                                <MenuOption key={`s-${v}`} onSelect={() => onChangeTime(v)}
                                                                            style={MenuStyle.menuOption}>
                                                                    <Text style={[MenuStyle.menuText, {
                                                                        color: selectStartAtTime === v ? Colors.info : Colors.mediumDark
                                                                    }]}>{v}</Text>
                                                                </MenuOption>
                                                            );
                                                        })}
                                                    </ScrollView>
                                                </MenuOptions>
                                            </Menu>
                                        </View>
                                    </View>

                                    {showStartAt && (
                                        <DateTimePicker
                                            id={"dp_start_at"}
                                            value={selectStartAtDate}
                                            mode={"date"}
                                            minimumDate={new Date()}
                                            onChange={(event, date) => onChangeDate(event,  date)}
                                        />
                                    )}
                                </View>
                            </>
                        }
                    </View>
                    {(() => {
                        let canUpdate = false;
                        const timeSplit = selectStartAtTime.split(":");
                        selectStartAtDate.setHours(Math.ceil(Number(timeSplit[0])), Math.ceil(Number(timeSplit[1])),0,0);

                        if (selectStartAtDate.getTime() !== startAt) {
                            canUpdate = true;
                        }

                        if(canUpdate) {
                            if(isConnect) {
                                return (
                                    <View style={{marginTop: "auto", marginHorizontal: 16, marginBottom: 16}}>
                                        <ButtonPrimary title={"Сохранить изменения"} onPress={() => onUpdateVizit()} />
                                    </View>
                                );
                            } else {
                                return (
                                    <View style={{ marginTop: "auto", marginHorizontal: 16, marginBottom: 16}}>
                                        <WarningMessage message={"Требуется подключение к интернету"} />
                                    </View>
                                );
                            }
                        }
                    })()}
                </View>
            </MenuProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    sheetModal: {
        backgroundColor: Colors.greyBg,
        borderRadius: 0,
    },
    container: {
        flex: 1,
    },
    buttonPrimary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.info,
        padding: 16,
        borderRadius: 4,
        paddingHorizontal: 16,
        gap: 12,
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "bold"
    },
    buttonWarning: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.warning,
        padding: 16,
        borderRadius: 4,
        paddingHorizontal: 16,
        gap: 12,
    },
    subHeader: {
        color: Colors.mediumDark,
        fontSize: 16,
        marginBottom: 8
    },
    text: {
        color: Colors.black,
        fontSize: 18,
    },
    dateContainer: {
        flexDirection: "row",
        borderColor: Colors.medium,
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 16,
        width: 164,
        alignItems: "center",
        gap: 16
    },
    dateGrid: {
        width: "50%",
        marginBottom: 32
    },
    dateRow: {
        flexDirection: "row",
        gap: 16
    },
    timeContainer: {
        borderColor: Colors.medium,
        borderWidth: 1,
        borderRadius: 4,
        height: 44,
        alignItems: "center",
        justifyContent: "center"
    },
});
export default ModalUpdateVizit;