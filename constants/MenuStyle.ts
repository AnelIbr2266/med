import {StyleSheet} from "react-native";
import Colors from "@/constants/Colors";
import * as Device from "expo-device";

const TABLE = Device.deviceType === 2;

export const MenuStyle = StyleSheet.create({
    menu: {
    },
    menuTrigger: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor:  Colors.white,
        paddingHorizontal: TABLE ? 16 : 8,
        borderRadius: TABLE ? 8 : 4,
        gap: TABLE ? 16 : 8,
    },
    menuInput: {
        borderBottomWidth: 1,
        paddingVertical: TABLE ? 16 : 8,
        borderColor: Colors.medium,
        fontSize: TABLE ? 18 : 16
    },
    menuOption: {
        paddingVertical: TABLE ? 8 : 4,
        paddingHorizontal:TABLE ? 16 : 8,
    },
    menuText: {
        fontSize: TABLE ? 18 : 16
    },
});