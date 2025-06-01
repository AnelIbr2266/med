import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text, View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { db } from "@/sql/db";
import { IAppVizity} from "@/types/Vizity";
import YaMap, { Marker } from "react-native-yamap";
import {IAppTochki} from "@/types/Tochki";

const fetchVisitById = async (id: string): Promise<IAppVizity | null> => {
    try {
        const sql = "SELECT id, elm___name, elm___status, elm_tochka FROM vizity WHERE id = ?";
        const result = await (await db).getFirstAsync(sql, [id]);
        return result as IAppVizity | null;
    } catch (error) {
        console.error("Ошибка при загрузке визита:", error);
        return null;
    }
};

const fetchTochkaById = async (id: string): Promise<IAppTochki | null> => {
    try {
        const sql = "SELECT elm_geokoordinaty FROM tochki WHERE elm___id = ?";
        const result = await (await db).getFirstAsync(sql, [id]);
        return result as IAppTochki | null;
    } catch (error) {
        console.error("Ошибка при загрузке точки:", error);
        return null;
    }
};

const VizitDetail = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [visit, setVisit] = useState<IAppVizity | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVisit = async () => {
            if (!id) {
                setError("Некорректный ID визита");
                setLoading(false);
                return;
            }
            const data = await fetchVisitById(id);
            if (data) {
                setVisit(data);
                const tochkaData = await fetchTochkaById(data.elm_tochka);
                if (tochkaData?.elm_geokoordinaty) {
                    const [lat, lon] = tochkaData.elm_geokoordinaty.split(",").map(Number);
                    if (!isNaN(lat) && !isNaN(lon)) {
                        setCoords({ lat, lon });
                    }
                }
            } else {
                setError("Визит не найден");
            }
            setLoading(false);
        };

        loadVisit();
    }, [id]);

    if (loading) {
        return <ActivityIndicator size="large" color="#6A5ACD" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!visit) {
        return <Text style={styles.errorText}>Данные не найдены</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Детали визита</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Название:</Text>
                <Text style={styles.value}>{visit.elm___name}</Text>
                <Text style={styles.label}>Статус:</Text>
                <Text style={styles.value}>{visit.elm___status}</Text>
            </View>
            <View style={styles.mapContainer}>
                {coords ? (
                    <YaMap style={styles.map} initialRegion={{
                        lat: coords.lat,
                        lon: coords.lon,
                        zoom: 14
                    }}>
                        <Marker point={{ lat: coords.lat, lon: coords.lon }} />
                    </YaMap>
                ) : (
                    <Text style={styles.errorText}>Координаты недоступны</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

export default VizitDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F8FF",
        padding: 16,
        paddingTop: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#4B0082",
    },
    card: {
        backgroundColor: "#E6E6FA",
        padding: 16,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B0082",
    },
    value: {
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
    },
    errorText: {
        textAlign: "center",
        fontSize: 18,
        color: "red",
        marginTop: 20,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    mapContainer: {
        height: 300,
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 20,
    },
    map: {
        width: Dimensions.get("window").width - 32,
        height: 300,
    },
});
