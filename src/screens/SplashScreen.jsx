import React, { useEffect } from 'react';
import { View, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { light } from '../utils/colors';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  // Define os cantos fixos
  const factor = 0.4; // quanto menor, mais para dentro da tela
  const margin = 100;

  const corners = [
    { x: -width * factor + margin, y: -height * factor + margin }, // Top-left
    { x: width * factor - margin, y: -height * factor + margin }, // Top-right
    { x: -width * factor + margin, y: height * factor - margin }, // Bottom-left
    { x: width * factor - margin, y: height * factor - margin }, // Bottom-right
  ];

  // Marcas com cantos específicos
  const brands = [
    {
      image: require('../assets/Belles-Logotipo-Oficial-Preto.webp'),
      position: useSharedValue({ x: 0, y: 0 }),
    },
    { icon: 'heart', position: useSharedValue({ x: 0, y: 0 }) },
    { icon: 'star', position: useSharedValue({ x: 0, y: 0 }) },
    { icon: 'flower', position: useSharedValue({ x: 0, y: 0 }) },
  ];

  // Estilos animados
  const animatedStyles = brands.map((brand) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateX: brand.position.value.x },
        { translateY: brand.position.value.y },
      ],
    }))
  );

  // Opacidade do logo
  const logoOpacity = useSharedValue(0);
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  useEffect(() => {
    // Cada marca vai para o canto correspondente
    brands.forEach((brand, index) => {
      const targetPos = corners[index % corners.length];
      brand.position.value = withTiming(
        { x: targetPos.x, y: targetPos.y },
        { duration: 1000, delay: index * 200 },
        () => {
          if (index === brands.length - 1) {
            logoOpacity.value = withSequence(
              withTiming(1, { duration: 500 }),
              withTiming(1, { duration: 2000 }, () => {
                runOnJS(navigation.navigate)('Profile');
              })
            );
          }
        }
      );
    });
  }, [navigation]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      {brands.map((brand, index) => (
        <Animated.View key={index} style={animatedStyles[index]}>
          {brand.icon ? (
            <MaterialCommunityIcons
              name={brand.icon}
              size={50}
              color={light.secondary}
            />
          ) : (
            <Image
              source={brand.image}
              className="w-1/4" // 25% da largura da tela
              style={{ width: width * 0.25, height: undefined, aspectRatio: 1 }} // Garante proporção
              resizeMode="contain"
            />
          )}
        </Animated.View>
      ))}

      <Animated.View style={[{ position: 'absolute' }, logoAnimatedStyle]}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: width * 0.33, height: undefined, aspectRatio: 1 }} // 33% da largura da tela
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;