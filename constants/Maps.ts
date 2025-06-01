import {StyleSheet} from "react-native";
import Colors from "@/constants/Colors";

export const Maps = StyleSheet.create({
    buttonsBlock: {
        position: 'absolute',
        left: 16,
        top: 8,
    },
    buttonWrapper: {
        marginTop: 8,
    },
    icon: {
        width: 24,
        height: 24,
    },
    button: {
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});