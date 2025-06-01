import {Text, TouchableOpacity} from "react-native";
import {rStyle} from "@/constants/rStyle";

interface Props {
    title: any;
    onPress(): void;
    icon?: any;
    style?: any;
    disabled?: any
}
const ButtonPrimaryOutline = (props: Props) => {
    return (
        <TouchableOpacity disabled={props.disabled} style={[rStyle.button, props.style]} onPress={() => props.onPress()}>
            {props.icon}
            <Text style={[rStyle.btnText, rStyle.textPrimary]}>{props.title}</Text>
        </TouchableOpacity>
    );
};


export default ButtonPrimaryOutline;