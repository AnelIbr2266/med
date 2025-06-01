import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const LocalPage = () => {
    const { session } = useAuth();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLocationPermissions = async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status === 'granted') {
                    try {
                        const loc = await Location.getCurrentPositionAsync({});
                        setLocation(loc);
                    } catch (error) {
                        setErrorMsg('Не удалось получить местоположение.');
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки разрешений:', error);
            } finally {
                setLoading(false);
            }
        };

        checkLocationPermissions();
    }, []);

    const onEnableLocation = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                try {
                    const loc = await Location.getCurrentPositionAsync({});
                    setLocation(loc);
                } catch (error) {
                    setErrorMsg('Не удалось получить местоположение.');
                }
            } else {
                Alert.alert(
                    'Доступ запрещён',
                    'Пожалуйста, включите службу местоположения в настройках устройства.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Ошибка включения местоположения:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#6A0DAD" style={styles.loader} />;
    }

    if (session && location) {
        return <Redirect href="/(tabs)/main" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.paragraph}>Пожалуйста, включите местоположение в настройках вашего устройства.</Text>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            <TouchableOpacity style={styles.button} onPress={onEnableLocation}>
                <Text style={styles.buttonText}>Включить местоположение</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F8F8FF',
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
        color: '#340082',
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#8871ef',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LocalPage;