import 'react-native-gesture-handler';
import "../global.css"

import React, { useState, useEffect } from 'react';
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import notifee, { AndroidImportance } from '@notifee/react-native';

import ProfileScreen from './screens/ProfileScreen';
import OffersScreen from './screens/OffersScreen';
import FastingScreen from './screens/FastingScreen';
import DietScreen from './screens/DietScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import LogoutScreen from './screens/LogoutScreen';
import SplashScreen from './screens/SplashScreen';
import { paperTheme } from './utils/paperTheme';
const { light, dark } = paperTheme;


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: paperTheme.light.colors.primary,
        tabBarInactiveTintColor: paperTheme.light.colors.secondary,
        tabBarStyle: {
          backgroundColor: paperTheme.light.colors.inverseOnSurface,
          borderTopWidth: 0,
          paddingTop: 2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Fast') {
            iconName = 'clock-alert';
          } else if (route.name === 'Diet') {
            iconName = 'food';
          } else if (route.name === 'Logout') {
            iconName = 'logout';
          } else if (route.name === 'InternalProfile') {
            iconName = 'account';
          } else if (route.name === 'Exercises') {
            iconName = 'run-fast';
          } else if (route.name === 'Offers') {
            iconName = 'tag-heart';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Offers"
        options={{ tabBarLabel: 'Ofertas' }}
        component={OffersScreen}
      />
      <Tab.Screen
        name="Fast"
        options={{ tabBarLabel: 'Jejum' }}
        component={FastingScreen}
      />
      <Tab.Screen
        name="Diet"
        options={{ tabBarLabel: 'Dieta' }}
        component={DietScreen}
      />
      <Tab.Screen
        name="Exercises"
        options={{ tabBarLabel: 'Exercícios' }}
        component={ExerciseScreen}
      />
      <Tab.Screen
        name="InternalProfile"
        options={{ tabBarLabel: 'Meus Dados' }}
        component={ProfileScreen}
      />
      <Tab.Screen
        name="Logout"
        options={{ tabBarLabel: 'Sair' }}
        component={LogoutScreen}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [userId, setUserId] = useState(null);

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
      console.log('Error when configuring notifications:', error);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: light.background }} edges={['top', 'left', 'right']}>
        <SafeAreaProvider>
          <StatusBar
            translucent={true}
            backgroundColor="transparent"
            barStyle="dark-content"
          />

          <PaperProvider theme={paperTheme.light}>
            <NavigationContainer
              theme={{
                ...DefaultTheme,
                colors: {
                  ...DefaultTheme.colors,
                  ...paperTheme.light.colors,
                },
              }}
            >
              <Stack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName={userId ? 'SplashScreen' : 'Main'}
              >
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
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
