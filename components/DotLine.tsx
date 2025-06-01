import React from 'react';
import {StyleSheet, Text, View} from "react-native";
import Colors from "@/constants/Colors";

const DotLine = () => {
    return (
        <View style={styles.dotContainer}>
            <Text style={styles.dotLeft}></Text>
            <Text style={styles.dotRight}></Text>
        </View>
    );
};
const styles = StyleSheet.create({
    dotContainer: {
        width: 10,
        height: 10,
        borderRadius: 10,
        marginLeft: 8,
        flexDirection: "row",
        overflow: "hidden"
    },
    dotLeft: {
        width: 5,
        height: 10,
        backgroundColor: Colors.success
    },
    dotRight: {
        width: 5,
        height: 10,
        backgroundColor: Colors.warning
    },
});

export default DotLine;