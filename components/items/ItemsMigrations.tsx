import React, {FC} from "react";
import {Text, View} from "react-native";
import LoadingInner from "@/components/LoadingInner";
import {Entypo, Feather} from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface PropsItemsMigrations {
    title: string;
    loading: boolean;
    final: boolean;
    isTabled: boolean;
}

export const ItemsMigrations: FC<PropsItemsMigrations> = (props) => {
    return (
        <View style={{height: 24, flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 16}}>
            {props.loading
                ?
                <View style={{marginLeft: props.isTabled ? 4 : 0}}><LoadingInner /></View>
                :
                <>
                    {props.final
                        ?
                        <Feather name="check-circle" size={props.isTabled ? 24 : 20} color={Colors.info} style={{top: 1, left: 2}} />
                        :
                        <Entypo name="time-slot" size={props.isTabled ? 24 : 20} color={Colors.mediumDark} style={{top: 1}}/>
                    }
                </>
            }
            <Text style={{fontSize: props.isTabled ? 18 : 16, color: props.final ? Colors.info : Colors.mediumDark}}>{props.title}</Text>
        </View>
    );
}