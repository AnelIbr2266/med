import { View, StyleSheet, KeyboardAvoidingView, TextInput, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import {useEffect, useState} from "react";
import { useRouter } from "expo-router";
import {useAuth} from "@/context/AuthContext";
import {ErrorMessage} from "@/components/ErrorMessage";

const Login = () => {
    const { logIn, session, error, app_user, logInApp, isLoading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {
        setLoading(true);
        try {
            if (app_user) {
                await logInApp(email, password);
            } else {
                await logIn(email, password);
            }
        } catch (error) {
            console.error("Ошибка входа:", error);
        } finally {
            setLoading(false);
        }
    };

    // Автоматический редирект при успешном входе
    useEffect(() => {
        if (session) {
            router.replace("/(authentificated)");
        }
    }, [session]);


    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior="padding">
                {error && (
                    <View style={{marginBottom: 16}}>
                        <ErrorMessage message={error} />
                    </View>
                )}
                <TextInput
                    value={email}
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                    secureTextEntry={true}
                    value={password}
                    style={styles.input}
                    placeholder="Password"
                    autoCapitalize="none"
                    onChangeText={(text) => setPassword(text)}
                />
                {isLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={() => onLogin()}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: "#6044e4",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: '400',
    },
});

export default Login;