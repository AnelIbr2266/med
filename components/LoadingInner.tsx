import {View, Image} from "react-native";
const LoadingInner = (props: any) => {
    return (
        <View {...props} style={{alignItems: "center", justifyContent: "center"}}>
            <Image style={{width: 20, height: 20}} source={require('../assets/images/loading.gif')} />
        </View>
    );
};

export default LoadingInner;