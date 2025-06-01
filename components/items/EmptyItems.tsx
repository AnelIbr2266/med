import React from "react";
import {Text, View} from "react-native";
import {fsz, rStyle} from "@/constants/rStyle";
import Colors from "@/constants/Colors";

export const EmptyItems = React.memo(({title}: any) => {
    return (
        <View style={[rStyle.cardContainer, { margin: 0, borderWidth: 0}]}>
            <Text style={{fontSize: fsz.s18, fontStyle: "italic", color: Colors.medium,}}>{title}</Text>
        </View>
    );
});