import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Alert, Text, TextInput, Button, useTheme, RadioButton, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { light } from '../utils/colors';
import AppContainer from '../components/AppContainer';

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
  const mountedRef = useRef(true);

  // Inicia como null para mostrar "Carregando…" até que os padrões ou armazenamento sejam definidos
  const [userData, setUserData] = useState(null);

  const [errors, setErrors] = useState({
    age: false,
    currentWeight: false,
    targetWeight: false,
    height: false,
  });

  // Carrega do AsyncStorage (ou padrões)
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
        console.warn('Erro ao carregar perfil:', e);
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
      Alert.alert('Dados incompletos', 'Por favor, preencha todos os campos obrigatórios');
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
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil');
    }
  };

  // Estado de carregamento simples
  if (!userData) {
    return (
      <ScrollView style={{ flex: 1, padding: 16, backgroundColor: light.background }}>
        <Text style={{ textAlign: 'center', marginTop: 24 }}>Carregando…</Text>
      </ScrollView>
    );
  }

  return (
    <AppContainer>
      <ScrollView
        style={{ flex: 1, padding: 16, backgroundColor: light.background }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24, color: light.primary, marginTop: 16 }}>
          Seu Perfil
        </Text>

        {/* Informações Pessoais */}
        <Text variant="titleSmall" style={{ marginBottom: 8, color: light.primary }}>
          Informações Pessoais
        </Text>

        <TextInput
          label="Nome completo *"
          value={userData.name}
          onChangeText={(text) => handleChange('name', text)}
          mode="outlined"
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Idade *"
          value={userData.age}
          onChangeText={(text) => handleChange('age', text.replace(/[^0-9]/g, ''))}
          mode="outlined"
          keyboardType="numeric"
          error={errors.age}
          style={{ marginBottom: 12 }}
        />
        {errors.age && <HelperText type="error">Idade inválida</HelperText>}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ marginRight: 16 }}>Gênero:</Text>
          <RadioButton.Group onValueChange={(v) => handleChange('gender', v)} value={userData.gender}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value="male" />
                <Text>Masculino</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                <RadioButton value="female" />
                <Text>Feminino</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>

        {/* Medidas Corporais */}
        <Text variant="titleSmall" style={{ marginBottom: 8, color: light.primary }}>
          Medidas Corporais
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput
            label="Peso atual (kg) *"
            value={userData.currentWeight}
            onChangeText={(text) => handleChange('currentWeight', text.replace(/[^0-9.]/g, ''))}
            mode="outlined"
            keyboardType="numeric"
            error={errors.currentWeight}
            style={{ flex: 1, marginRight: 8, marginBottom: 12 }}
          />

          <TextInput
            label="Peso desejado (kg) *"
            value={userData.targetWeight}
            onChangeText={(text) => handleChange('targetWeight', text.replace(/[^0-9.]/g, ''))}
            mode="outlined"
            keyboardType="numeric"
            error={errors.targetWeight}
            style={{ flex: 1, marginBottom: 12 }}
          />
        </View>

        <TextInput
          label="Altura (cm) *"
          value={userData.height}
          onChangeText={(text) => handleChange('height', text.replace(/[^0-9]/g, ''))}
          mode="outlined"
          keyboardType="numeric"
          error={errors.height}
          style={{ marginBottom: 12 }}
        />
        {errors.height && <HelperText type="error">Altura inválida</HelperText>}

        {/* Preferências Alimentares */}
        <Text variant="titleSmall" style={{ marginBottom: 8, color: light.primary }}>
          Preferências Alimentares
        </Text>

        <TextInput
          label="Refeições por dia *"
          value={userData.mealsPerDay}
          onChangeText={(text) => handleChange('mealsPerDay', text.replace(/[^0-9]/g, ''))}
          mode="outlined"
          keyboardType="numeric"
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Restrições alimentares"
          value={userData.dietaryRestrictions}
          onChangeText={(text) => handleChange('dietaryRestrictions', text)}
          mode="outlined"
          style={{ marginBottom: 12 }}
          placeholder="Ex.: Vegetariano, intolerância à lactose"
        />

        <TextInput
          label="Condições de saúde"
          value={userData.healthConditions}
          onChangeText={(text) => handleChange('healthConditions', text)}
          mode="outlined"
          style={{ marginBottom: 16 }}
          placeholder="Ex.: Diabetes, hipertensão"
        />

        {/* Nível de Atividade Física */}
        <Text variant="titleSmall" style={{ marginBottom: 8, color: light.primary }}>
          Nível de Atividade Física
        </Text>

        <RadioButton.Group onValueChange={(v) => handleChange('fitnessLevel', v)} value={userData.fitnessLevel}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <RadioButton value="sedentary" />
            <Text>Sedentário (pouco ou nenhum exercício)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <RadioButton value="moderate" />
            <Text>Moderadamente ativo (exercício 1–3x/semana)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="active" />
            <Text>Muito ativo (exercício 4+ vezes/semana)</Text>
          </View>
        </RadioButton.Group>

        <Button mode="contained" onPress={saveProfile} style={{ marginTop: 24 }} disabled={!validateForm()}>
          Salvar Perfil
        </Button>
      </ScrollView>
    </AppContainer>
  );
};

export default ProfileScreen;