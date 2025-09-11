import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Alert, Text, TextInput, Button, useTheme, RadioButton, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const DEFAULT_PROFILE = {
  name: 'rodrigo',
  age: '39',
  currentWeight: '100',
  targetWeight: '85',
  height: '166',
  gender: 'male',
  mealsPerDay: '6',
  dietaryRestrictions: '',
  fitnessLevel: 'sedentary',
  healthConditions: '',
};

const STORAGE_KEYS = {
  userId: 'userId',
  userProfile: 'userProfile',
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const mountedRef = useRef(true);

  // starts as null to show "Loading…" until defaults or storage is set
  const [userData, setUserData] = useState(null);

  const [errors, setErrors] = useState({
    age: false,
    currentWeight: false,
    targetWeight: false,
    height: false,
  });

  // Load from AsyncStorage (or defaults)
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.userProfile);
        if (!mountedRef.current) return;

        if (saved) {
          const p = JSON.parse(saved);
          setUserData({
            name: String(p.name ?? ''),
            age: String(p.age ?? ''),
            currentWeight: String(p.currentWeight ?? ''),
            targetWeight: String(p.targetWeight ?? ''),
            height: String(p.height ?? ''),
            gender: String(p.gender ?? 'male'),
            mealsPerDay: String(p.mealsPerDay ?? '3'),
            dietaryRestrictions: String(p.dietaryRestrictions ?? ''),
            fitnessLevel: String(p.fitnessLevel ?? 'sedentary'),
            healthConditions: String(p.healthConditions ?? ''),
          });
        } else {
          setUserData(DEFAULT_PROFILE);
        }
      } catch (e) {
        console.warn('Error loading profile:', e);
        setUserData(DEFAULT_PROFILE);
      }
    };
    load();
    return () => { mountedRef.current = false; };
  }, []);

  const handleChange = (field, value) => {
    if (!userData) return;
    setUserData(prev => ({ ...prev, [field]: value }));

    if (['age', 'currentWeight', 'targetWeight', 'height'].includes(field)) {
      setErrors(prev => ({
        ...prev,
        [field]: isNaN(parseFloat(value)) || parseFloat(value) <= 0,
      }));
    }
  };

  const validateForm = () => {
    if (!userData) return false;
    return (
      userData.name &&
      userData.age && !isNaN(parseFloat(userData.age)) &&
      userData.currentWeight && !isNaN(parseFloat(userData.currentWeight)) &&
      userData.targetWeight && !isNaN(parseFloat(userData.targetWeight)) &&
      userData.height && !isNaN(parseFloat(userData.height))
    );
  };

  const saveProfile = async () => {
    if (!userData || !validateForm()) {
      Alert.alert('Incomplete data', 'Please fill in all required fields');
      return;
    }
    try {
      const userId = (await AsyncStorage.getItem(STORAGE_KEYS.userId)) || `user_${Date.now()}`;
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.userId, userId],
        [STORAGE_KEYS.userProfile, JSON.stringify({
          ...userData,
          age: parseInt(userData.age, 10),
          currentWeight: parseFloat(userData.currentWeight),
          targetWeight: parseFloat(userData.targetWeight),
          height: parseFloat(userData.height),
          mealsPerDay: parseInt(userData.mealsPerDay, 10),
        })],
      ]);

      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Could not save your profile');
    }
  };

  // Simple loading state
  if (!userData) {
    return (
      <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
        <Text style={{ textAlign: 'center', marginTop: 24 }}>Loading…</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24, color: colors.primary, marginTop: 16 }}>
        Your Profile
      </Text>

      {/* Personal Info */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: colors.primary }}>
        Personal Information
      </Text>

      <TextInput
        label="Full name *"
        value={userData.name}
        onChangeText={(text) => handleChange('name', text)}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Age *"
        value={userData.age}
        onChangeText={(text) => handleChange('age', text.replace(/[^0-9]/g, ''))}
        mode="outlined"
        keyboardType="numeric"
        error={errors.age}
        style={{ marginBottom: 12 }}
      />
      {errors.age && <HelperText type="error">Invalid age</HelperText>}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ marginRight: 16 }}>Gender:</Text>
        <RadioButton.Group onValueChange={(v) => handleChange('gender', v)} value={userData.gender}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton value="male" />
              <Text>Male</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
              <RadioButton value="female" />
              <Text>Female</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      {/* Body Measurements */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: colors.primary }}>
        Body Measurements
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput
          label="Current weight (kg) *"
          value={userData.currentWeight}
          onChangeText={(text) => handleChange('currentWeight', text.replace(/[^0-9.]/g, ''))}
          mode="outlined"
          keyboardType="numeric"
          error={errors.currentWeight}
          style={{ flex: 1, marginRight: 8, marginBottom: 12 }}
        />

        <TextInput
          label="Target weight (kg) *"
          value={userData.targetWeight}
          onChangeText={(text) => handleChange('targetWeight', text.replace(/[^0-9.]/g, ''))}
          mode="outlined"
          keyboardType="numeric"
          error={errors.targetWeight}
          style={{ flex: 1, marginBottom: 12 }}
        />
      </View>

      <TextInput
        label="Height (cm) *"
        value={userData.height}
        onChangeText={(text) => handleChange('height', text.replace(/[^0-9]/g, ''))}
        mode="outlined"
        keyboardType="numeric"
        error={errors.height}
        style={{ marginBottom: 12 }}
      />
      {errors.height && <HelperText type="error">Invalid height</HelperText>}

      {/* Dietary Preferences */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: colors.primary }}>
        Dietary Preferences
      </Text>

      <TextInput
        label="Meals per day *"
        value={userData.mealsPerDay}
        onChangeText={(text) => handleChange('mealsPerDay', text.replace(/[^0-9]/g, ''))}
        mode="outlined"
        keyboardType="numeric"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Dietary restrictions"
        value={userData.dietaryRestrictions}
        onChangeText={(text) => handleChange('dietaryRestrictions', text)}
        mode="outlined"
        style={{ marginBottom: 12 }}
        placeholder="E.g.: Vegetarian, lactose intolerance"
      />

      <TextInput
        label="Health conditions"
        value={userData.healthConditions}
        onChangeText={(text) => handleChange('healthConditions', text)}
        mode="outlined"
        style={{ marginBottom: 16 }}
        placeholder="E.g.: Diabetes, hypertension"
      />

      {/* Fitness Level */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: colors.primary }}>
        Physical Activity Level
      </Text>

      <RadioButton.Group onValueChange={(v) => handleChange('fitnessLevel', v)} value={userData.fitnessLevel}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <RadioButton value="sedentary" />
          <Text>Sedentary (little or no exercise)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <RadioButton value="moderate" />
          <Text>Moderately active (exercise 1–3x/week)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadioButton value="active" />
          <Text>Very active (exercise 4+ times/week)</Text>
        </View>
      </RadioButton.Group>

      <Button mode="contained" onPress={saveProfile} style={{ marginTop: 24 }} disabled={!validateForm()}>
        Save Profile
      </Button>
    </ScrollView>
  );
};

export default ProfileScreen;
