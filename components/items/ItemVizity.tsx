import {IAppVizity} from "@/types/Vizity";
import React, {FC} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {convertDate, convertTime} from "@/utils/DateUtils";
import {fsz, rStyle} from "@/constants/rStyle";
import Colors from "@/constants/Colors";
import {Ionicons} from "@expo/vector-icons";

interface PropsItem {
    item: IAppVizity;
    router: any;
    isTabled: boolean;
}

export const ItemVizitAll: FC<PropsItem> = React.memo((props) => {
    const name = props.item.elm___name.split(',').slice(1).join().trim();
    const pathname = props.item.elm___status === "План"
        ? "/(auth)/(user)/(vizity)/not_completed/[id]"
        : "/(auth)/(user)/(vizity)/completed/[id]";

    if(props.isTabled) {
        return(
            <TouchableOpacity style={[styles.item]} onPress={() => {
                props.router.push({
                    pathname: pathname,
                    params: {
                        id: props.item.id,
                    },
                });
            }}>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 6}}>
                        <View style={{flexDirection: "row", gap: 8}}>
                            <View style={{top: 4}}>
                                {props.item.elm___status === "План"
                                    ?
                                    <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                    :
                                    <>
                                        {props.item.elm_postponed
                                            ?
                                            <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                            :
                                            <Text style={[rStyle.dotSm, {backgroundColor: Colors.success, marginLeft: 0}]}></Text>
                                        }
                                    </>
                                }
                            </View>
                            <View style={{flexDirection: "row", gap: 8}}>
                                <Text>{convertDate(props.item.elm_data_vremya)}</Text>
                                <Text>{convertTime(props.item.elm_data_vremya)}</Text>
                            </View>
                        </View>
                        {props.item.elm___status === "План"
                            ?
                            <Text style={{color: Colors.danger}}>Незавершён</Text>
                            :
                            <Text style={{color: Colors.success}}>Завершён</Text>
                        }
                    </View>
                    <Text style={{fontSize: fsz.s18, color: Colors.black}}>{name}</Text>
                </View>
                <Ionicons style={{alignSelf: "center"}} name="chevron-forward" size={22} color={Colors.info} />
            </TouchableOpacity>
        );
    } else {
        return null;
    }


});

export const ItemVizitCompleted: FC<PropsItem> = React.memo((props) => {
    const name = props.item.elm___name.split(',').slice(1).join().trim();

    if(props.isTabled) {
        return(
            <TouchableOpacity style={[styles.item]} onPress={() => {
                props.router.push({
                    pathname: "/(auth)/(user)/(vizity)/completed/[id]",
                    params: {
                        id: props.item.id,
                    },
                });
            }}>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 6}}>
                        <View style={{flexDirection: "row", gap: 8}}>
                            <View style={{top: 4}}>
                                {props.item.elm___status === "План"
                                    ?
                                    <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                    :
                                    <>
                                        {props.item.elm_postponed
                                            ?
                                            <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                            :
                                            <Text style={[rStyle.dotSm, {backgroundColor: Colors.success, marginLeft: 0}]}></Text>
                                        }
                                    </>
                                }
                            </View>
                            <View style={{flexDirection: "row", gap: 8}}>
                                <Text>{convertDate(props.item.elm_data_vremya)}</Text>
                                <Text>{convertTime(props.item.elm_data_vremya)}</Text>
                            </View>
                        </View>
                        {props.item.elm___status === "План"
                            ?
                            <Text style={{color: Colors.danger}}>Незавершён</Text>
                            :
                            <Text style={{color: Colors.success}}>Завершён</Text>
                        }
                    </View>
                    <Text style={{fontSize: fsz.s18, color: Colors.black}}>{name}</Text>
                </View>
                <Ionicons style={{alignSelf: "center"}} name="chevron-forward" size={22} color={Colors.info} />
            </TouchableOpacity>
        );
    } else {
        return null;
    }

});

export const ItemVizitNotCompleted: FC<PropsItem> = React.memo((props) => {
    const name = props.item.elm___name.split(',').slice(1).join().trim();

    if(props.isTabled) {
        return(
            <TouchableOpacity style={[styles.item]} onPress={() => {
                props.router.push({
                    pathname: "/(auth)/(user)/(vizity)/not_completed/[id]",
                    params: {
                        id: props.item.id,
                    },
                });
            }}>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 6}}>
                        <View style={{flexDirection: "row", gap: 8}}>
                            <View style={{top: 4}}>
                                {props.item.elm___status === "План"
                                    ?
                                    <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                    :
                                    <>
                                        {props.item.elm_postponed
                                            ?
                                            <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                            :
                                            <Text style={[rStyle.dotSm, {backgroundColor: Colors.success, marginLeft: 0}]}></Text>
                                        }
                                    </>
                                }
                            </View>
                            <View style={{flexDirection: "row", gap: 8}}>
                                <Text>{convertDate(props.item.elm_data_vremya)}</Text>
                                <Text>{convertTime(props.item.elm_data_vremya)}</Text>
                            </View>
                        </View>
                        {props.item.elm___status === "План"
                            ?
                            <Text style={{color: Colors.danger}}>Незавершён</Text>
                            :
                            <Text style={{color: Colors.success}}>Завершён</Text>
                        }
                    </View>
                    <Text style={{fontSize: fsz.s18, color: Colors.black}}>{name}</Text>
                </View>
                <Ionicons style={{alignSelf: "center"}} name="chevron-forward" size={22} color={Colors.info} />
            </TouchableOpacity>
        );
    } else {
        return null;
    }

});

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 16,
    },
    itemHeader: {
        color: Colors.info,
        fontSize: 18,
        marginBottom: 8,
        marginHorizontal: 16,
        fontWeight: "500",
    },
    itemTime: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    itemName: {
        fontSize: 18
    },
    subName: {
        fontSize: 16,
        marginBottom: 4,
        color: Colors.mediumDark
    },
});