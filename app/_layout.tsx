import {Slot} from "expo-router";
import {AuthProvider} from "@/context/AuthContext";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import React from "react";
import {InactivityContext} from "@/context/InactivityContext";
import Colors from "@/constants/Colors";

export default function Root() {
    return (
        <GestureHandlerRootView style={{flex: 1, backgroundColor: Colors.mainBG}}>
            <AuthProvider>
                <InactivityContext>
                    <Slot />
                </InactivityContext>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}