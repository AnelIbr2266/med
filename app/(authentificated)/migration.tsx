import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import useMigrations from "@/sql/user/sqlUserMigrations";
import {router} from "expo-router";
import {useAuth} from "@/context/AuthContext";

const MigrationScreen = () => {
    const { session, app_user } = useAuth();
    const { settingsMigrations, userMigrations, tochkiMigrations, akciyaMigrations, vizityMigrations, oprosnikMigrations, deteilingMigrations, deteilingKartinkiMigrations} = useMigrations();

    useEffect(() => {
        const migrateData = async () => {
            if (app_user) {
                try {
                    // Миграция настроек
                    const settingsResult = await settingsMigrations(app_user);
                    console.log("Настройки мигрированы:", settingsResult);

                    // Миграция пользователя
                    const userResult = await userMigrations(app_user);
                    console.log("Данные пользователя мигрированы:", userResult);

                    // Миграция точек
                    const tochkiResult = await tochkiMigrations(app_user.userId);
                    console.log("Данные точек мигрированы:", tochkiResult);

                    const akciyaResult = await akciyaMigrations(app_user.userId);
                    console.log("Данные акций мигрированы:", akciyaResult);

                    const visityResult = await vizityMigrations(app_user.userId);
                    console.log("Данные визитов мигрированы:", visityResult);
                    const oprResult = await oprosnikMigrations(app_user.userId);
                    console.log("Данные опросников мигрированы:", oprResult);
                    const datResult = await deteilingMigrations(app_user.userId);
                    console.log("Данные опросников мигрированы:", datResult);
                    const datkResult = await deteilingKartinkiMigrations(app_user.userId);
                    console.log("Данные опросников мигрированы:", datkResult);
                    router.push('/(tabs)/main');
                } catch (error) {
                    console.error("Ошибка миграции данных:", error);
                }
            }
        };

        migrateData();
    }, [app_user, settingsMigrations, userMigrations, tochkiMigrations, akciyaMigrations, vizityMigrations]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Идет миграция данных...</Text>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

export default MigrationScreen;
