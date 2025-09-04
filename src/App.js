import 'react-native-gesture-handler';
import "../global.css"

import React, { useState, useEffect } from 'react';
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, MD2DarkTheme, MD3LightTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useTheme } from 'react-native-paper';

import ProfileScreen from './screens/ProfileScreen';
import FastingScreen from './screens/FastingScreen';
import DietScreen from './screens/DietScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import LogoutScreen from './screens/LogoutScreen';

import { paperTheme } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Fast') {
            iconName = 'clock-alert'; // Ícone padrão do Paper
          } else if (route.name === 'Diet') {
            iconName = 'food'; // Ícone padrão do Paper
          } else if (route.name === 'Logout') {
            iconName = 'logout'; // Este funciona no Paper também
          } else if (route.name === 'InternalProfile') {
            iconName = 'account'; // Este funciona no Paper também
          }else if (route.name === 'Exercises') {
            iconName = 'run-fast'; // Este funciona no Paper também
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Fast" options={{ tabBarLabel: 'Jejum' }} component={FastingScreen} />
      <Tab.Screen name="Diet" options={{ tabBarLabel: 'Dieta' }} component={DietScreen} />
      <Tab.Screen name="Exercises" options={{ tabBarLabel: 'Exercícios' }} component={ExerciseScreen} />
      <Tab.Screen name="InternalProfile" options={{ tabBarLabel: 'Dados' }} component={ProfileScreen} />
      <Tab.Screen name="Logout" options={{ tabBarLabel: 'Sair' }} component={LogoutScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [userId, setUserId] = useState(null);

  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD2DarkTheme.colors,
      primary: '#7c4d2b',
      secondary: '#4f311a',
      background: '#F5F5F5', // <- cor base do fundo
      surface: '#FFFFFF',
      text: '#212121',
    },
  };

  useEffect(() => {
    configureNotifications();
    loadUserId();
  }, []);

  const configureNotifications = async () => {
    try {
      // iOS: pede permissão
      await notifee.requestPermission();

      // Cria canal no Android
      await notifee.createChannel({
        id: 'default_channel',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    } catch (error) {
      console.log('Erro ao configurar notificações:', error);
    }
  };

  const loadUserId = async () => {
    let id = await AsyncStorage.getItem('userId');
    if (!id) {
      try {
        id = await DeviceInfo.getUniqueId(); // mais confiável que getPhoneNumber
      } catch (e) {
        id = null; // Fallback para input manual na tela de Profile
      }
    }
    setUserId(id);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
        <SafeAreaProvider>
        <StatusBar translucent backgroundColor="translucent" barStyle="dark-content" />

        <PaperProvider theme={paperTheme}>
          <NavigationContainer 
          theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background, // <- força o fundo
          },
        }}
          >
            <Stack.Navigator 
              screenOptions={{ headerShown: false }}
              initialRouteName={userId ? 'Main' : 'Profile'}
            >
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>

          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default App;
