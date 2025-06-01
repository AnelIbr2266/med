import { useState, useEffect, useRef } from "react";
import { Text, AppState } from "react-native";
import { Redirect, router, Stack, usePathname } from "expo-router";
import * as Location from "expo-location";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import YaMap from "react-native-yamap";
import { MAP_KEY } from "@/context/config";

YaMap.init(MAP_KEY).then();

export default function AppLayout() {
    const { session, isLoading, isUserMigration, isLocation, getSetIsLocation } = useAuth();
    const [loading, setLoading] = useState(true);
    const [locationDenied, setLocationDenied] = useState(false);
    const appState = useRef(AppState.currentState);
    const currentPath = usePathname();

    const checkLocationStatus = async () => {
        try {
            const isServiceEnabled = await Location.hasServicesEnabledAsync();
            const { status } = await Location.getForegroundPermissionsAsync();

            const updatedLocation = {
                android: isServiceEnabled && status === "granted",
                gps: await Location.isBackgroundLocationAvailableAsync(),
            };

            getSetIsLocation(updatedLocation);
            setLocationDenied(!updatedLocation.android || !updatedLocation.gps);
        } catch (error) {
            console.error("Ошибка проверки местоположения:", error);
            getSetIsLocation({ android: false, gps: false });
            setLocationDenied(true);
        } finally {
            setLoading(false);
        }
    };

    // Проверяем статус сессии при входе
    useEffect(() => {
        if (session === null) {
            setLoading(false);
            return;
        }

        if (session) {
            checkLocationStatus();
        }
    }, [session]);

    // Проверяем состояние приложения
    useEffect(() => {
        const subscription = AppState.addEventListener("change", async (nextAppState) => {
            if (appState.current.match(/active|inactive|background/) && nextAppState === "active") {
                await checkLocationStatus();
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, []);

    // Перенаправление при отсутствии локации
    useEffect(() => {
        if (!session || loading) return;

        if (locationDenied && currentPath !== "/(authentificated)/location") {
            router.replace("/(authentificated)/location");
        }
    }, [session, locationDenied, loading, currentPath]);


    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!session) {
                setLoading(false);
            }
        }, 5000); // Через 5 секунд снимаем флаг загрузки

        return () => clearTimeout(timeout);
    }, [session]);

    if (isLoading || loading) {
        return <Text>Loading...</Text>;
    }

    if (!session) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "", headerShown: false }} />
            <Stack.Screen name="location" options={{ title: "", headerShown: false }} />
            <Stack.Screen name="migration" options={{ title: "", headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ title: "", headerShown: false }} />
            <Stack.Screen name="vizity/[id]" options={{ headerShown: false, title: "" }} />
            <Stack.Screen name="apteki/[id]" options={{ headerShown: false, title: "" }} />
            <Stack.Screen name="(vizity)/completed/[id]" options={{ headerShown: false, title: "" }} />
            <Stack.Screen name="(vizity)/not_completed/[id]" options={{ headerShown: false, title: "" }} />
            <Stack.Screen name="(vizity)/close/[id]" options={{ headerShown: false, title: "" }} />
        </Stack>
    );
}
