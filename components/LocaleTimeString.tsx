import {Text} from "react-native";
import {fsz} from "@/constants/rStyle";

export const LocaleTimeString = ({date, options}: any) => {
    const create = new Date(date.length > 11 ? Number(date) : Number(date) * 1000);
    const timeString = create.toLocaleTimeString('ru-RU', options)

    return <><Text style={{ fontSize: fsz.s18 }}>{timeString}</Text></>
}
