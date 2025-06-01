import React, {FC} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from "react-native";
import Colors from "@/constants/Colors";
import {IAppVizity} from "@/types/Vizity";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {fsz, rStyle} from "@/constants/rStyle";
import {convertDate, convertTime} from "@/utils/DateUtils";

interface Props  {
    app_vizity: IAppVizity[];
    tochka_id?: string;
}
const VizityItems: FC<Props> = React.memo((props) => {
    const router = useRouter();

    const arrItems = [] as any
    props.app_vizity.map((item) => {
        const name = item.elm___name.split(',').slice(1).join().trim();
        const pathname = item.elm___status === "План"
            ? "/(auth)/(user)/(vizity)/not_completed/[id]"
            : "/(auth)/(user)/(vizity)/completed/[id]";

        arrItems.push(
            <TouchableOpacity key={item.id} style={[styles.item]} onPress={() => {
                router.push({
                    pathname: pathname,
                    params: {
                        id: item.id,
                    },
                });
            }}>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 6}}>

                        <View style={{flexDirection: "row", gap: 4}}>
                            <Text>{convertDate(item.elm_data_vremya)}</Text>
                            <Text>{convertTime(item.elm_data_vremya)}</Text>
                        </View>
                        <View style={{flexDirection: "row", gap: 16}}>
                            {item.elm___status === "План"
                                ?
                                <Text style={{color: Colors.danger}}>Незавершён</Text>
                                :
                                <Text style={{color: Colors.success}}>Завершён</Text>
                            }
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12}}>
                        <View style={{top: 8}}>
                            {item.elm___status === "План"
                                ?
                                <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                :
                                <>
                                    {item.elm_postponed
                                        ?
                                        <Text style={[rStyle.dotSm, {backgroundColor: Colors.warningDark, marginLeft: 0}]}></Text>
                                        :
                                        <Text style={[rStyle.dotSm, {backgroundColor: Colors.success, marginLeft: 0}]}></Text>
                                    }
                                </>
                            }
                        </View>
                        <Text style={{fontSize: fsz.s18, color: Colors.black}}>{name}</Text>
                    </View>
                </View>
                <Ionicons style={{alignSelf: "center", top: 3}} name="chevron-forward" size={22} color={Colors.info} />
            </TouchableOpacity>
        );
    });

    return <>{arrItems}</>;
});

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 36,
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

export default VizityItems;