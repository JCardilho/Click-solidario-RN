import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarStyle: {
          backgroundColor: 'white',
          height: 70,
          marginLeft: 10,
          marginRight: 10,
          borderRadius: 10,
          marginBottom: 10,
          borderWidth: 2,
          borderTopWidth: 3,
          borderColor: '#839aff',
        },
        tabBarItemStyle: {
          borderRightWidth: 1,
          borderRightColor: '#8f8f8f50',
          borderLeftWidth: 1,
          borderLeftColor: '#8f8f8f50',
          borderRadius: 10,
          padding: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={35} name="home" color={color} />,
          tabBarLabel: () => <Text className="font-kanit text-xl">Inicio</Text>,
        }}
      />
      <Tabs.Screen
        name="donations-items"
        options={{
          title: 'Donations',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="dropbox" color={color} />,
          tabBarLabel: () => <Text className="font-kanit text-md">Reservar</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="request-donations"
        options={{
          title: 'Request-Donations',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="plus" color={color} className="overflow-visible" />
          ),
          tabBarLabel: () => (
            <Text className="font-kanit text-md text-center bg-transparent">Solicitar/Doar</Text>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
          tabBarLabel: () => <Text className="font-kanit text-xl">Perfil</Text>,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
