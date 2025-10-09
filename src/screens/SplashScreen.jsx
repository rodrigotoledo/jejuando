import React, { useEffect } from 'react';
import { View, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { light } from '../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import TextContainer from '../components/TextContainer';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  const factor = 0.4;
  const margin = 100;

  const corners = [
    { x: -width * factor + margin, y: -height * factor + margin }, // Top-left
    { x: width * factor - margin, y: -height * factor + margin }, // Top-right
    { x: -width * factor + margin, y: height * factor - margin }, // Bottom-left
    { x: width * factor - margin, y: height * factor - margin }, // Bottom-right
  ];

  const brands = [
    {
      image: require('../assets/Belles-Logotipo-Oficial-Preto.webp'),
      position: useSharedValue({ x: 0, y: 0 }),
    },
    { icon: 'heart', position: useSharedValue({ x: 0, y: 0 }) },
    { icon: 'star', position: useSharedValue({ x: 0, y: 0 }) },
    { icon: 'flower', position: useSharedValue({ x: 0, y: 0 }) },
  ];

  const animatedStyles = brands.map((brand) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateX: brand.position.value.x },
        { translateY: brand.position.value.y },
      ],
    }))
  );

  const logoOpacity = useSharedValue(0);
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  useEffect(() => {
    brands.forEach((brand, index) => {
      const targetPos = corners[index % corners.length];
      brand.position.value = withTiming(
        { x: targetPos.x, y: targetPos.y },
        { duration: 1000, delay: index * 200 },
        () => {
          if (index === brands.length - 1) {
            logoOpacity.value = withSequence(
              withTiming(1, { duration: 500 }),
              withTiming(1, { duration: 2000 })
            );
          }
        }
      );
    });
  }, []);

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
              style={{ width: width * 0.25, height: undefined, aspectRatio: 1 }}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      ))}

      {/* Logo central */}
      <Animated.View style={[{ position: 'absolute', alignItems: 'center' }, logoAnimatedStyle]}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: width * 0.33, height: undefined, aspectRatio: 1 }}
          resizeMode="contain"
        />

        <TextContainer>
          Filó Mais Você
        </TextContainer>

        {/* Botão entrar */}
        <Button
          mode="contained"
          icon="login"
          onPress={() => navigation.navigate('Profile')}
          className="mt-6 rounded-lg"
        >
          Entrar no sistema
        </Button>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
