import {Text} from "react-native";
import {fsz} from "@/constants/rStyle";

export const LocaleDateString = ({date, options}: any) => {
    const create = new Date(date.length > 11 ? Number(date) : Number(date) * 1000);
    const dateString = create.toLocaleDateString('ru-RU', options)

    return <><Text style={{ fontSize: fsz.s18 }}>{dateString}</Text></>
}
