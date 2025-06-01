import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Tabs} from "expo-router";
import {FontAwesome} from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabLayout: React.FC = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#ffffff' },
                tabBarActiveTintColor: '#6044e4',
                tabBarInactiveTintColor: '#808080',
                }}
        >

            <Tabs.Screen name="main" options={{
                title: 'Главная',
                tabBarIcon: ({ size, color }) => <FontAwesome name="home" size={size} color={color} />,
            }} />
            <Tabs.Screen name="visity" options={{
                title: 'Визиты',
                tabBarIcon: ({ size, color }) => <FontAwesome name="ambulance" size={size} color={color} />,
            }} />
            <Tabs.Screen name="apteki" options={{
                title: 'Аптеки',
                tabBarIcon: ({ size, color }) => <FontAwesome name="hospital-o" size={size} color={color} />,
            }} />
            <Tabs.Screen name="user_info" options={{
                title: 'Профиль',
                tabBarIcon: ({ size, color }) => <FontAwesome name="user-circle" size={size} color={color} />,
            }} />
            <Tabs.Screen name="karta" options={{
                title: 'Карта',
                tabBarIcon: ({ size, color }) => <FontAwesome name="map-marker" size={size} color={color} />,
            }} />

        </Tabs>
    );
};

export default TabLayout;
