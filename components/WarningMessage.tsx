import {Text, StyleSheet} from "react-native";
import Colors from "@/constants/Colors";
import {fsz, pos} from "@/constants/rStyle";

type Props = {
    message?: string;
    style?: any;
};

export const WarningMessage = (props: Props) => {
    return (
        <><Text style={[styles.warning, props.style]}>{props.message}</Text></>
    );
};

const styles = StyleSheet.create({
    warning: {
        color: Colors.mediumDark,
        backgroundColor: Colors.warning,
        padding: pos.p16,
        borderWidth: 1,
        borderColor: Colors.warning,
        borderRadius: 4,
        fontSize: fsz.s18
    },
});
