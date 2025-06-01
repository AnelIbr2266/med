import {View, Image, StyleSheet} from "react-native";
import Colors from "@/constants/Colors";


const Loading = (props: any) => {
    return (
        <View {...props} style={[styles.overlay, props.style]}>
            <Image style={styles.overlayImage} source={require('../assets/images/loading.gif')} />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        position: "absolute",
        left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    overlayImage: {
        width: 28,
        height: 28
    }
});

export default Loading;