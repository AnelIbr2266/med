import React, {Dispatch, FC} from 'react';
import {Text, TouchableOpacity, View} from "react-native";
import {pos, rStyle} from "@/constants/rStyle";
import Colors from "@/constants/Colors";

interface Props {
    switch: string;
    setSwitch: Dispatch<string>;
    md: boolean;
    isTabled: boolean;
}

export const TabsVizity: FC<Props> = (props) => {
    return (
        <>
            {props.isTabled
                ?
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16, gap: pos.g16, marginHorizontal: 16}}>
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={[rStyle.button, rStyle.shadow,
                            props.switch === "all" ? rStyle.buttonSelect : rStyle.buttonEmpty,
                            props.md ? rStyle.buttonSm : false,
                         ]} onPress={() => props.setSwitch("all")}>
                            <Text style={[rStyle.btnText, {
                                color: props.switch === "all" ? Colors.white : Colors.mediumDark
                            }]}>Все визиты</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={[rStyle.button, rStyle.shadow,
                            props.switch === "not_completed" ? rStyle.buttonSelect : rStyle.buttonEmpty,
                            props.md ? rStyle.buttonSm : false,
                          ]} onPress={() => props.setSwitch("not_completed")}>
                            <Text style={[rStyle.btnText, {
                                color: props.switch === "not_completed"  ? Colors.white : Colors.mediumDark
                            }]}>Незавершённые</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={[rStyle.button, rStyle.shadow,
                            props.switch === "completed" ? rStyle.buttonSelect : rStyle.buttonEmpty,
                            props.md ? rStyle.buttonSm : false,
                        ]} onPress={() => props.setSwitch("completed")}>
                            <Text style={[rStyle.btnText, {
                                color: props.switch === "completed"  ? Colors.white : Colors.mediumDark
                            }]}>Завершённые</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                :
                null
            }
        </>
    );
};

export default TabsVizity;