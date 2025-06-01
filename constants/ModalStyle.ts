import {StyleSheet} from "react-native";
import Colors from "@/constants/Colors";
import {fsz} from "@/constants/rStyle";
import * as Device from "expo-device";
const TABLE = Device.deviceType === 2;
export const ModalStyle = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.black,
        opacity: 0.5
    },
    modalView: {
        position: "absolute",
        left: 0, right: 0,
        top: 0, bottom: 0,
        backgroundColor: Colors.white,
        borderRadius: TABLE ? 20 : 10,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: TABLE ? 16 : 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    textHeader: {
        fontSize: fsz.s24,
        fontWeight: "500",
        color: Colors.black
    },
    buttonClose: {
        position: "absolute",
        right: TABLE ? 0 : 12,
        top: TABLE ? 0 : 11,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: TABLE ? 64 : 32,
        backgroundColor: Colors.white,
        width: TABLE ? 64 : 32,
        height: TABLE ? 64 : 32,
    },
});