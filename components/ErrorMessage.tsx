import {View, Text, StyleSheet} from "react-native";
import Colors from "@/constants/Colors";

type Props = {
    message?: string;
};

export const ErrorMessage = ({ message }: Props) => {
    if (!message) {
        return null;
    }
    return (
        <View>
            <Text style={styles.error}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    error: {
        color: Colors.danger,
        backgroundColor: Colors.dangerBg,
        padding: 16,
        borderRadius: 4,
        fontSize: 18
    },
});
