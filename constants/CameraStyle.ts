import {StyleSheet} from "react-native";
import Colors from "@/constants/Colors";
import * as Device from "expo-device";

const TABLE = Device.deviceType === 2;
export const CameraStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        padding: 16,
        justifyContent: 'space-between'
    },
    buttonClose: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.mediumDark,
        borderRadius:TABLE ? 64 : 40,
        backgroundColor: Colors.white,
        width: TABLE ? 64 : 40,
        height:TABLE ? 64 : 40,
    },
    buttonTakePicture: {
        alignItems: "center", justifyContent: "center",
        backgroundColor: Colors.white,
        width: 64,
        height: 64,
        bottom: 32,
        overflow: "hidden",
        borderRadius: 50,
    },
});