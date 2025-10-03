import React from "react";
import { View, Text, Image } from "react-native";
import {  } from "react-native-paper";

export default function AppContainer({ children }) {
  return (
    <View className="flex-1 bg-background pb-10">
      <View className="w-full items-center justify-center">
        <View className="flex flex-row items-center justify-around w-2/3">
          <Image
            source={require("../assets/logo.png")}
            className="w-24 h-24 self-center mt-4"
            resizeMode="contain"
          />
          <Text className="font-andada-bold text-2xl text-center mb-6 text-primary mt-4">Filó Mais Você</Text>
        </View>
      </View>
      <>
        {children}
      </>
    </View>
  );
}
