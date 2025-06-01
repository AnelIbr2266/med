import React, {FC} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from "react-native";
import Colors from "@/constants/Colors";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";


interface PropsViewButtons {
    item: any;
    name: string;
    onPress: () => void;
    isTabled: boolean;
    status: string;
    textSize?: number;
}
const Buttons: FC<PropsViewButtons> = (props) => {
    const { textSize = 13 } = props; // Значение по умолчанию для textSize — 18

    if (props.item.length) {
        if (props.item[0] === "checkmark-circle") {
            return (
                <TouchableOpacity
                    style={[styles.button, styles.shadow, { backgroundColor: Colors.white, padding: 8 }]}
                    onPress={() => props.status === "completed" ? props.onPress() : false}
                >
                    <MaterialCommunityIcons
                        name="clipboard-check"
                        size={15}
                        color={props.status === "completed" ? Colors.info : Colors.success}
                        style={{ top: 1 }}
                    />
                    <Text
                        style={{
                            fontSize: textSize, // Используем textSize
                            color: props.status === "completed" ? Colors.info : Colors.success,
                        }}
                    >
                        {props.name}
                    </Text>
                </TouchableOpacity>
            );
        }
        if (props.item[0] === "close-outline") {
            return (
                <View style={[styles.button, styles.shadow, { padding: 8 }]}>
                    <Ionicons name={props.item[0]} size={15} color={Colors.mediumDark} style={{ top: 1 }} />
                    <Text style={{ fontSize: textSize, color: Colors.mediumDark }}>
                        {props.name}
                    </Text>
                </View>
            );
        }
        if (props.item[0] === "plus") {
            return (
                <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary, styles.shadow, { padding: 8 }]}
                    onPress={() => props.onPress()}
                >
                    <MaterialCommunityIcons
                        name="clipboard-edit-outline"
                        size={15}
                        color={Colors.white}
                        style={{ top: 1 }}
                    />
                    <Text style={{ fontSize: textSize, color: Colors.white }}>
                        {props.name}
                    </Text>
                </TouchableOpacity>
            );
        }
        if (props.item[0] === "time-slot") {
            return (
                <View style={[styles.button, styles.buttonDisabled, styles.shadow, { padding: 8 }]}>
                    <MaterialCommunityIcons
                        name="clipboard-clock-outline"
                        size={15}
                        color={Colors.info}
                        style={{ top: 1 }}
                    />
                    <Text style={{ fontSize: textSize, color: Colors.info }}>
                        {props.name}
                    </Text>
                </View>
            );
        }
    }
    return null;
};



interface Props  {
    viewButtons: any;
    isTabled: boolean;
    status: string;
    openAkciya: () => void;
    openOprosnik: () => void;
    openDeteiling: () => void;
}

export const VizityViewButtons: FC<Props> = React.memo((props) => {
    return (
        <>
            <View style={{ flexDirection: "row"}}>
                <View style={{flex: 1}}>
                    <Buttons item={props.viewButtons.akciya} name={"Акции"} onPress={props.openAkciya} isTabled={props.isTabled} status={props.status} />
                </View>
                <View style={{flex: 1}}>
                    <Buttons item={props.viewButtons.oprosnik} name={props.status === "completed" ? "Опросник" : "Пройти опросник"} onPress={props.openOprosnik} isTabled={props.isTabled} status={props.status} />
                </View>
                <View style={{flex: 1}}>
                    <Buttons item={props.viewButtons.deteiling} name={"Презентация"} onPress={props.openDeteiling} isTabled={props.isTabled} status={props.status} />
                </View>
            </View>
        </>
    );
});

const styles = StyleSheet.create({
    shadow: {
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        gap: 12,
        backgroundColor: Colors.mainBG
    },
    buttonM: {
        padding: 8,
        paddingHorizontal: 6,
        paddingVertical: 12,
    },
    buttonPrimary: {
        backgroundColor: Colors.info,
    },
    buttonDisabled: {
        backgroundColor: Colors.bgInfo,
    }
});
