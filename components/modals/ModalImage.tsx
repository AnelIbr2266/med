import {Dispatch, FC} from "react";
import {Image, Modal, Pressable, Text, View} from "react-native";
import {ModalStyle} from "@/constants/ModalStyle";
import Colors from "@/constants/Colors";
import {AntDesign} from "@expo/vector-icons";
import {ReactNativeZoomableView} from "@openspacelabs/react-native-zoomable-view";

interface IImage {
    id: string;
    uri: string;
    width: string;
    height: string;
    title: string;
}
interface PropsImage {
    visible: boolean;
    setVisible: Dispatch<boolean>;
    image: IImage;
    isTabled: boolean;
}

export const ModalImage: FC<PropsImage> = (props) => {
    return(
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => {
                props.setVisible(false);
            }}
        >
            <Pressable style={ModalStyle.modalContainer} onPress={() => props.setVisible(false)}></Pressable>
            <View style={[ModalStyle.modalView, {margin: "2%", backgroundColor: Colors.black }]}>
                <View style={[ModalStyle.modalHeader, {borderTopLeftRadius: 20, borderTopRightRadius: 20}]}>
                    <Text style={ModalStyle.textHeader}>{props.image.title}</Text>
                    <Pressable style={[ModalStyle.buttonClose]} onPress={() => props.setVisible(false)}>
                        <AntDesign name="close" size={24} color={Colors.black} />
                    </Pressable>
                </View>
                <ReactNativeZoomableView maxZoom={30}>
                    <Image style={{ width: "100%", height: "100%", resizeMode: 'contain' }} source={{ uri: props.image.uri }}/>
                </ReactNativeZoomableView>
            </View>
        </Modal>
    );
}