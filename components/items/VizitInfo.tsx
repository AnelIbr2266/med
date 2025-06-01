import React, {FC} from 'react';
import {Text, View} from "react-native";
import Colors from "@/constants/Colors";
import {IAppVizity} from "@/types/Vizity";
import {LocaleTimeString} from "@/components/LocaleTimeString";
import {fsz, rStyle} from "@/constants/rStyle";
import {ErrorMessage} from "@/components/ErrorMessage";
import {LocaleDateString} from "@/components/LocaleDateString";
import {isJson} from "@/utils/FunctionsUtils";

interface Props  {
    error: string | null;
    vizit: IAppVizity;
    status: string;
    isTabled: boolean;
}
export const VizitInfo: FC<Props> = React.memo((props) => {
    return (
        <>
            {props.error && <ErrorMessage message={props.error} /> }
            {props.isTabled
                ?
                <>
                    <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
                        <View style={[rStyle.cardContainer, rStyle.shadow, {margin: 0}]}>
                            <Text style={rStyle.subHeader}>Запланированная дата</Text>
                            <View style={{flexDirection: "row", gap: 8}}>
                                <LocaleDateString date={props.vizit.elm_data_vremya} options={{
                                    day: 'numeric',
                                    year: 'numeric',
                                    month: 'long'
                                }} />
                                <LocaleTimeString date={props.vizit.elm_data_vremya} options={{
                                    hour: '2-digit',
                                    minute:'2-digit'
                                }} />
                            </View>
                        </View>

                        <View style={[rStyle.cardContainer, rStyle.shadow, {margin: 0}]}>
                            <Text style={rStyle.subHeader}>Статус визита</Text>
                            <Text style={{fontSize: fsz.s18}}>
                                {(() => {
                                    const status = isJson(props.vizit.elm___status);
                                    if (status === "Факт") {
                                        return (
                                            <Text style={{fontSize: fsz.s18, color: Colors.success}}>Завершён</Text>
                                        )
                                    } else {
                                        return (
                                            <Text style={{fontSize: fsz.s18, color: Colors.danger, flexWrap: "wrap"}}>{status === "План" ? "Незавершён" : status}</Text>
                                        )
                                    }
                                })()}
                            </Text>
                        </View>

                        {props.status === "completed" &&
                            <View style={[rStyle.cardContainer, rStyle.shadow, {margin: 0}]}>
                                <Text style={rStyle.subHeader}>Дата закрытия</Text>
                                <View style={{flexDirection: "row", gap: 8}}>
                                    <LocaleDateString date={props.vizit.elm_data_zakrytiya} options={{
                                        day: 'numeric',
                                        year: 'numeric',
                                        month: 'long'
                                    }} />
                                    <LocaleTimeString date={props.vizit.elm_data_zakrytiya} options={{
                                        hour: '2-digit',
                                        minute:'2-digit'
                                    }} />
                                </View>
                            </View>
                        }
                    </View>
                    {props.status === "completed" &&
                        <View style={[rStyle.cardContainer, rStyle.shadow, {flex: 0, margin: 0, marginBottom: 16}]}>
                            <Text style={rStyle.subHeader}>Комментарий</Text>
                            <Text style={{fontSize: fsz.s18}}>{props.vizit.elm_kommentarii ? props. vizit.elm_kommentarii : 'нет'}</Text>
                        </View>
                    }
                </>
                :
                <></>
            }
        </>
    );
});


export default VizitInfo;