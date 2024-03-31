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
          /*   marginLeft: 10,
          marginRight: 10,
          borderRadius: 10,
          marginBottom: 10, */
        },
        tabBarItemStyle: {
          borderRadius: 10,
          padding: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 35 : 30} name="home" color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              className={`font-kanit text-sm text-center ${focused ? 'text-primary font-bold text-lg' : 'text-gray-400'}`}>
              Inicio
            </Text>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reserve-donations"
        options={{
          title: 'Donations',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 35 : 30} name="dropbox" color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <View className="w-auto flex flex-col items-center justify-center">
              <Text
                className={`font-kanit text-xs text-center ${focused ? 'text-primary font-bold text-sm' : 'text-gray-400'}`}>
                Reservar ou
              </Text>
              <Text
                className={`font-kanit text-xs text-center ${focused ? 'text-primary font-bold text-sm' : 'text-gray-400'}`}>
                Disponibilizar
              </Text>
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="request-donations"
        options={{
          title: 'Request-Donations',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 35 : 30} name="plus" color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <View className="w-auto flex flex-col items-center justify-center">
              <Text
                className={`font-kanit text-xs text-center ${focused ? 'text-primary font-bold text-sm' : 'text-gray-400'}`}>
                Solicitar ou
              </Text>
              <Text
                className={`font-kanit text-xs text-center ${focused ? 'text-primary font-bold text-sm' : 'text-gray-400'}`}>
                Doar
              </Text>
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome size={focused ? 35 : 30} name="user" color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              className={`font-kanit text-sm text-center ${focused ? 'text-primary font-bold text-lg' : 'text-gray-400'}`}>
              Perfil
            </Text>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
