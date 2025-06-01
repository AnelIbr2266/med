import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { db } from "@/sql/db";
import { IAppVizity } from "@/types/Vizity";
import { router } from "expo-router";
import sqlVizity from "@/sql/user/sqlVizity";
import dayjs from "dayjs";
import {useAuth} from "@/context/AuthContext";
import {Ionicons} from "@expo/vector-icons";
import sqlSettings from "@/sql/user/sqlSettings";

const useVizityToday = () => {
    const { getVizityQuery } = sqlVizity();
    const [vizityToday, setVizityToday] = useState<IAppVizity[]>([]);
    const [errorVizity, setError] = useState<string | null>(null);
    const [refresh, setRefresh] = useState<boolean>(false);
    const size = 15;
    const select = "id, elm___name, elm___status, elm_data_vremya";
    const today = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        fetchVizityToday();
    }, []);

    const fetchVizityToday = async () => {
        try {
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime(); // Начало дня в миллисекундах
            const endOfDay = new Date(now.setHours(23, 59, 59, 999)).getTime(); // Конец дня в миллисекундах

            const sql = `SELECT * FROM vizity WHERE elm_data_vremya >= ${startOfDay} AND elm_data_vremya <= ${endOfDay}`;
            const result = await (await db).getAllAsync(sql);

            setVizityToday(result as IAppVizity[]); // Приводим к IAppVizity[]
            setError(null);
            const result2 = await (await db).getAllAsync(`PRAGMA table_info(vizity);`);
            console.log(result2)

        } catch (error) {
            console.error("Ошибка при загрузке визитов на сегодня:", error);
            setError("Ошибка загрузки данных");
        }
    };

    const onRefresh = () => {
        setRefresh(true);
        fetchVizityToday();
        setRefresh(false);
    };

    return { vizityToday, errorVizity, refresh, onRefresh };
};

const VizityToday = () => {
    const {logOut} = useAuth();
    const { vizityToday, errorVizity, refresh, onRefresh } = useVizityToday();

    const handleVisitPress = (id: number) => {
        router.push(`/vizity/${id}`);
    };
    const handleSignOut = () => {
        logOut();
    };

    const renderItem = ({ item }: { item: IAppVizity }) => (
        <TouchableOpacity onPress={() => handleVisitPress(item.id)}>
            <View style={styles.visitCard}>
                <Text style={styles.visitName}>{item.elm___name}</Text>
                <Text style={styles.visitStatus}>{item.elm___status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.listContainer}>
                <Text style={styles.title}>Визиты на сегодня</Text>
                {errorVizity ? (
                    <Text style={styles.errorText}>{errorVizity}</Text>
                ) : vizityToday.length === 0 ? (
                    <Text style={styles.noVisitsText}>Нет визитов на сегодня</Text>
                ) : (
                    <FlatList
                        data={vizityToday}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        refreshing={refresh}
                        onRefresh={onRefresh}
                    />
                )}
            </SafeAreaView>
            <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
                <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default VizityToday;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F8FF",
        padding: 16,
        paddingTop: 80,
        justifyContent: "space-between",
    },
    listContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "#4B0082",
    },
    list: {
        paddingBottom: 20,
    },
    visitCard: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#E6E6FA",
        marginBottom: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    visitName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B0082",
    },
    visitStatus: {
        fontSize: 14,
        color: "#333",
        marginTop: 4,
    },
    errorText: {
        textAlign: "center",
        fontSize: 18,
        color: "red",
        marginTop: 20,
    },
    noVisitsText: {
        textAlign: "center",
        fontSize: 18,
        marginTop: 20,
    },
    button: {
        backgroundColor: '#6044e4',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '400',
    },
    iconButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#6e5fb6',
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
