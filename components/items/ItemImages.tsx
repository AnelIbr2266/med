import {Image, Pressable, View} from "react-native";
import React, {FC, useState} from "react";
import {ModalImage} from "@/components/modals/ModalImage";

interface PropsModal {
    images: any;
    title: any;
    isTabled: boolean;
}

export const ItemImages: FC<PropsModal> = (props) => {
    const [showImage, setShowImage] = useState<boolean>(false);
    const [image, setImage] = useState<any>(null);

    const openModalImage = (image: any, name: string) => {
        setShowImage(true);
        setImage(Object.assign(image, {title: name}));
    };

    const arrImages = [] as any;
    props.images.map((image: any) => {
        const width = Math.ceil(image.width * (1 - 0.90));
        const height = Math.ceil(image.height * (1 - 0.90));
        arrImages.push(
            <Pressable key={image.id} onPress={() => {
                openModalImage(image, props.title);
            }}>
                <View key={image.id} style={{flexDirection: "row", marginVertical: 16}}>
                    <Image style={{borderRadius: 8, width: width, height: height}} source={{uri: image.uri}} />
                </View>
            </Pressable>
        );
    })

    return(
        <>
            {arrImages}
            {image && <ModalImage visible={showImage} setVisible={setShowImage} image={image} isTabled={props.isTabled}/>}
        </>
    );
}