import React, {Dispatch, FC, useEffect, useState} from 'react';
import {Pressable, Text, View, Modal, ScrollView, TouchableOpacity} from "react-native";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {ModalStyle} from "@/constants/ModalStyle";
import {IAppVizityAdd} from "@/types/Vizity";
import Loading from "@/components/Loading";
import {useAuth} from "@/context/AuthContext";
import {rStyle} from "@/constants/rStyle";
import {ErrorMessage} from "@/components/ErrorMessage";
import {Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger} from "react-native-popup-menu";
import {MenuStyle} from "@/constants/MenuStyle";
import DateTimePicker from "@react-native-community/datetimepicker";
import {IAppTochki} from "@/types/Tochki";
import sqlVizity from "@/sql/user/sqlVizity";
import sqlTochki from "@/sql/user/sqlTochki";
import ButtonPrimary from "@/components/ButtonPrimary";
import {WarningMessage} from "@/components/WarningMessage";

interface PropsModal {
    tochka: IAppTochki;
    visible: boolean;
    setVisible: Dispatch<boolean>;
    onAddVizit: () => void;
    from_map: boolean;
    isTabled: boolean;
}


const ModalAddVizit: FC<PropsModal> = (props) => {
    const {isConnect, app_user} = useAuth();
    const {addElmaVizity} = sqlVizity();
    const {getTochkiOne} = sqlTochki();

    const [selectStartAtDate, setSelectStartAtDate] = useState<Date>(new Date());
    const [selectStartAtTime, setSelectStartAtTime] = useState<string>('00:00');
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

    const onAddVizit = async () => {
        if(app_user) {
            setLoading(true);
            const timeSplit = selectStartAtTime.split(":");
            selectStartAtDate.setHours(Math.ceil(Number(timeSplit[0])), Math.ceil(Number(timeSplit[1])), 0, 0);

            await getTochkiOne(`elm___id`, `AND id = "${props.tochka.id}"`).then(async ({app_tochka, error}) => {
                if (app_tochka) {
                    const fields: IAppVizityAdd = {
                        elm_tochka: app_tochka.elm___id,
                        elm_data_vremya: String(selectStartAtDate.getTime()),
                        elm_postponed: "1",
                    }
                    console.log(app_user.userId,app_tochka.elm___id,String(selectStartAtDate.getTime()))

                    await addElmaVizity(app_user.userId, fields).then((output) => {
                        if(output) {
                            setSelectStartAtDate(new Date());
                            setSelectStartAtTime("00:00");
                            props.setVisible(false);
                            props.onAddVizit()
                        } else {
                            setError('Визит не добавлен! Попробуйте добавить ещё раз.');
                        }
                    }).finally(() => {
                        setTimeout(() => {
                            setLoading(false);
                        }, 600);
                    });
                } else {
                    setError(error);
                }
            });
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
                <View style={[ModalStyle.modalView, {margin: 0, marginTop: "80%", backgroundColor: Colors.greyBg, borderRadius: 0}]}>
                    <View style={[ModalStyle.modalHeader, ]}>
                        <Text style={ModalStyle.textHeader}>Добавление визита</Text>
                        <Pressable style={[ModalStyle.buttonClose]} onPress={() => props.setVisible(false)}>
                            <AntDesign name="close" size={24} color={Colors.black} />
                        </Pressable>
                    </View>

                    {props.from_map && (
                        <View style={[rStyle.cardContainer, {flex: 0, marginBottom: 0}]}>
                            {props.tochka.elm_akciya.length > 0 && (
                                <View style={{flexDirection: 'row', alignItems: "center", marginBottom: 16, gap: 12}}>
                                    <Text style={[rStyle.dotLg,  {backgroundColor: Colors.info}]}></Text>
                                    <Text style={{fontSize: 18, fontWeight: "500", color: Colors.info}}>Проходит акция</Text>
                                </View>
                            )}
                            <Text style={{fontSize: 18}}>{props.tochka.elm___name}</Text>
                        </View>
                    )}
                    <View style={[rStyle.cardContainer]}>
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
                                <View style={rStyle.dateGrid}>
                                    <Text style={rStyle.subHeader}>Дата начала:</Text>
                                    <View style={[rStyle.dateRow, {marginBottom: 32}]}>
                                        <TouchableOpacity onPress={() => showDatepicker()} style={rStyle.dateContainer}>
                                            <Text style={{fontSize: 18}}>
                                                {selectStartAtDate.toLocaleString().split(',')[0]}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={22} color={Colors.mediumDark} />
                                        </TouchableOpacity>
                                        <View style={rStyle.timeContainer}>
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
                    {!loading && (
                        <View style={{ marginHorizontal: 16, marginBottom: 16}}>
                            {isConnect
                                ?
                                <ButtonPrimary title={"Добавить визит"} onPress={() => onAddVizit()} />
                                :
                                <WarningMessage message={"Требуется подключение к интернету"} />
                            }
                        </View>
                    )}
                </View>
            </MenuProvider>
        </Modal>
    );
};


export default ModalAddVizit;