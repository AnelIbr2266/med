import {View, Image, StyleSheet} from "react-native";
import React, {FC} from "react";
import Colors from "@/constants/Colors";


export const LoadingStart: FC<any> = React.memo((props: any) => {
    return (
        <View style={{flex: 1, backgroundColor: Colors.mainBG }}>
            <View {...props} style={[styles.overlay, props.style]}>
                <Image style={styles.overlayImage} source={require('../assets/images/loading.gif')} />
            </View>
        </View>
    );
});


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        position: "absolute",
        left: 0, right: 0, top: 0, bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    overlayImage: {
        width: 28,
        height: 28
    }
});

export default LoadingStart;