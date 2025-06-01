import {Text, TouchableOpacity} from "react-native";
import Colors from "@/constants/Colors";
import {rStyle} from "@/constants/rStyle";

interface Props {
    title: any;
    onPress(): void;
    icon?: any;
    style?: any;
    disabled?: any
}
const ButtonPrimary = (props: Props) => {

    return (
        <TouchableOpacity disabled={props.disabled} style={[rStyle.button, props.style, {backgroundColor: Colors.info}]} onPress={() => props.onPress()}>
            {props.icon}
            <Text style={[rStyle.btnText, {color: Colors.white}]}>{props.title}</Text>
        </TouchableOpacity>
    );
};

export default ButtonPrimary;