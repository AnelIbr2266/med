import {FC} from "react";
import {StyleSheet, Text, View} from "react-native";
import LoadingInner from "@/components/LoadingInner";
import {Entypo, Feather} from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface PropsItemsSaveVizit {
    title: string;
    loading: boolean;
    final: boolean;
    have: boolean;
}

export const ItemsSaveVizit: FC<PropsItemsSaveVizit> = (props) => {
    return (
        <View style={styles.rowMigration}>
            <>
                {(() => {
                    if(props.have === null) {
                        return (
                            <Text style={[styles.text, {color: Colors.mediumDark, marginLeft: 30}]}>{props.title}</Text>
                        );
                    } else {
                        if(props.have) {
                            return (
                                <>
                                    {props.loading
                                        ?
                                        <View style={{marginLeft: 4}}><LoadingInner /></View>
                                        :
                                        <>
                                            {props.final
                                                ?
                                                <Feather name="check-circle" size={24} color={Colors.info} style={styles.checkmark} />
                                                :
                                                <Entypo name="time-slot" size={24} color={Colors.mediumDark} style={{top: 1}}/>
                                            }
                                        </>
                                    }
                                    <Text style={[styles.text, {color: props.final ? Colors.info : Colors.mediumDark}]}>{props.title}</Text>
                                </>
                            );
                        } else {
                            return (
                                <Text style={[styles.text, {color: Colors.medium, textDecorationLine: "line-through", marginLeft: 40}]}>{props.title}</Text>
                            );
                        }
                    }
                })()}
            </>
        </View>
    );
}

const styles = StyleSheet.create({
    rowMigration: {
        height: 24,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 16
    },
    text: {
        fontSize: 18,
    },
    checkmark: {
        top: 1,
        left: 2
    },
});