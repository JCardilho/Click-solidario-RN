import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#023E8A',
        tabBarStyle: {
          backgroundColor: 'white',
          height: 70,
          marginLeft: 10,
          marginRight: 10,
          borderRadius: 10,
          marginBottom: 10,
        },
        tabBarItemStyle: {
         
          borderRadius: 10,
          padding: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={35} name="home" color={color} />,
          tabBarLabel: () => <Text className="font-kanit text-md text-center">Inicio</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reserve-donations"
        options={{
          title: 'Donations',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="dropbox" color={color} />,
          tabBarLabel: () => (
            <View className="w-auto flex flex-col items-center justify-center">
              <Text className="font-kanit text-xs text-center">Reservar ou</Text>
              <Text className="font-kanit text-xs text-center">Disponibilizar</Text>
            </View>
          ),
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
            <View className="w-auto flex flex-col items-center justify-center">
              <Text className="font-kanit text-xs text-center">Solicitar ou</Text>
              <Text className="font-kanit text-xs text-center">Doar</Text>
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
          tabBarLabel: () => <Text className="font-kanit text-md text-center">Perfil</Text>,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
