import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const UserScreen = () => {
    const { app_user , logOutClear} = useAuth();

    const handleSignOut = () => {
        logOutClear();
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Профиль</Text>
                <View>
                    <Text style={styles.text}><Text style={styles.label}>Name:</Text> {app_user?.name}</Text>
                    <Text style={styles.text}><Text style={styles.label}>Email:</Text> {app_user?.sub}</Text>
                    <Text style={styles.text}><Text style={styles.label}>Role:</Text> {app_user?.role}</Text>
                    <Text style={styles.text}><Text style={styles.label}>User ID:</Text> {app_user?.userId}</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                    <Text style={styles.buttonText}>Очистить кэш</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F8F8FF",
    },
    card: {
        backgroundColor: 'rgb(201,201,234)',
        padding: 20,
        borderRadius: 15,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#584a91',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        color: '#5340a8',
        marginVertical: 5,
    },
    label: {
        fontWeight: 'bold',
        color: '#5a4a9f',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#664b91',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default UserScreen;