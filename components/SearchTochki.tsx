import React, {Dispatch, FC} from 'react';
import {rStyle} from "@/constants/rStyle";
import {ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import Colors from "@/constants/Colors";
import {Menu, MenuOption, MenuOptions, MenuTrigger} from "react-native-popup-menu";
import {MenuStyle} from "@/constants/MenuStyle";
import {Ionicons} from "@expo/vector-icons";


interface Props {
    kategoriya: any;
    selectAkciya: boolean;
    setSelectAkciya: Dispatch<boolean>;
    selectKategoriya: string | null;
    setSelectKategoriya: Dispatch<string | null>;
    selectText: string;
    setSelectText: Dispatch<string>;
}

export const SearchTochki: FC<Props> = (props) => {
    return (
        <View style={rStyle.searchContainer}>
            <View style={[rStyle.searchSection, { flexDirection: "row"}]}>
                <TouchableOpacity style={[rStyle.searchBtn, rStyle.shadow, {
                    backgroundColor: props.selectAkciya ? Colors.info : Colors.white,
                }]} onPress={() => props.setSelectAkciya(!props.selectAkciya)}>
                    <Text style={{fontSize: 18,
                        color: props.selectAkciya ? Colors.white : Colors.black,
                    }}>Акции</Text>
                </TouchableOpacity>
                <Menu>
                    <MenuTrigger style={[rStyle.searchBtn, rStyle.shadow]}>
                        {props.selectKategoriya
                            ?
                            <View style={{flexDirection: "row", gap: 16}}>
                                <Text style={[MenuStyle.menuText, {color: Colors.black}]}>Категория</Text>
                                <Text style={[MenuStyle.menuText, {color: Colors.info, width: 12, fontWeight: "bold"}]}>{props.selectKategoriya}</Text>
                            </View>
                            :
                            <View style={{flexDirection: "row", gap: 16}}>
                                <Text style={[MenuStyle.menuText, {color: Colors.black}]}>Категория</Text>
                                <Text style={[MenuStyle.menuText, {color: Colors.info, width: 12}]}></Text>
                            </View>
                        }
                        <Ionicons name="chevron-down" size={22} color={Colors.black} style={{top: 2}} />
                    </MenuTrigger>
                    <MenuOptions customStyles={{ optionsContainer: {width: "auto"} }}>
                        <ScrollView style={{ maxHeight: 310, minWidth: 200 }}>
                            <MenuOption style={MenuStyle.menuOption} onSelect={() => props.setSelectKategoriya(null)}>
                                <Text style={[MenuStyle.menuText, {paddingVertical: 8, fontStyle: "italic", color: Colors.medium}]}>Пустое значение</Text>
                            </MenuOption>
                            {props.kategoriya && props.kategoriya.map((kat_name: any) => {
                                return(
                                    <MenuOption key={kat_name} style={MenuStyle.menuOption} onSelect={() => props.setSelectKategoriya(kat_name)}>
                                        <Text style={[MenuStyle.menuText, {paddingVertical: 8}]}>{kat_name}</Text>
                                    </MenuOption>
                                );
                            })}
                        </ScrollView>
                    </MenuOptions>
                </Menu>
                <View style={[rStyle.searchField, rStyle.shadow]}>
                    <Ionicons style={rStyle.searchIcon} name="search" size={26} color={Colors.black} />
                    <TextInput
                        style={rStyle.searchInput}
                        value={props.selectText}
                        placeholder={"Адрес аптеки..."}
                        placeholderTextColor={Colors.medium}
                        onChangeText={(value) => props.setSelectText(value)}
                        onFocus={() => {}}
                    />
                </View>
            </View>
        </View>
    );
};

export default SearchTochki;