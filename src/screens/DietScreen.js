import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import CheckBox from 'react-native-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import axios from 'axios';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import DietNavigation from '../components/DietNavigation';
import Config from 'react-native-config'
import OpenAI from 'openai';
import AppContainer from '../components/AppContainer';
import TextContainer from '../components/TextContainer';


const DietScreen = ({ navigation }) => {
  const [dietPlan, setDietPlan] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [isFastingDay, setIsFastingDay] = useState(false);
  const openai = new OpenAI({ apiKey: Config.API_GPT_KEY });

  const fastingDays = [0, 3]; // Exemplo: Domingo e Quarta

  useEffect(() => {
    console.log(Config.API_GPT_KEY);
    loadUserProfile();
  }, []);


  useEffect(() => {
    if (userProfile) {
      loadDietPlan();
    }
  }, [selectedDate, userProfile]);

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      } else {
        Alert.alert('Perfil não encontrado', 'Complete seu perfil primeiro');
        navigation.navigate('Profile');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const loadDietPlan = async () => {
    try {
      setLoading(true);
      const dayOfWeek = moment(selectedDate).day();
      setIsFastingDay(fastingDays.includes(dayOfWeek));

      // Verifica se já existe um plano para esta data
      const storedPlan = await AsyncStorage.getItem(`dietPlan_${selectedDate}`);
      
      if (storedPlan) {
        setDietPlan(JSON.parse(storedPlan));
      } else {
        await generateDietPlan();
      }
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
      Alert.alert('Erro', 'Não foi possível carregar o plano de dieta');
    } finally {
      setLoading(false);
    }
  };


  const safeItemToText = (item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const { name, calories, protein, carbs, fat } = item;
      return `${name || 'Item'} (${calories || 0} cal, ${protein || 0}g P, ${carbs || 0}g C, ${fat || 0}g G)`;
    }
    return String(item);
  };

  const generateDietPlan = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      
      // Monta o prompt com base no perfil do usuário
      const prompt = createGPTPrompt(userProfile, isFastingDay);
      
      // Chama a API do GPT
      const gptResponse = await callGPTAPI(prompt);
      
      // Processa a resposta
      const generatedPlan = processGPTResponse(gptResponse);
      
      // Salva localmente
      await AsyncStorage.setItem(
        `dietPlan_${selectedDate}`,
        JSON.stringify(generatedPlan)
      );
      
      setDietPlan(generatedPlan);
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      // Plano de fallback caso a API falhe
      setDietPlan(getFallbackDietPlan(userProfile, isFastingDay));
    } finally {
      setLoading(false);
    }
  };

    const createGPTPrompt = (profile, fasting) => {
    return `Crie um plano de dieta detalhado para ${fasting ? 'um dia com jejum intermitente' : 'um dia normal'} com ${profile.mealsPerDay} refeições.
    
    Perfil:
    - Nome: ${profile.name || 'Não informado'}
    - Idade: ${profile.age} anos
    - Peso atual: ${profile.currentWeight} kg
    - Peso alvo: ${profile.targetWeight} kg
    - Altura: ${profile.height} cm
    - Sexo: ${profile.gender === 'male' ? 'masculino' : 'feminino'}
    - Nível de atividade: ${getActivityLevelText(profile.fitnessLevel)}
    - Restrições alimentares: ${profile.dietaryRestrictions || 'nenhuma'}
    - Condições de saúde: ${profile.healthConditions || 'nenhuma'}
    
    Requisitos:
    - Formato JSON com: meals (array), totalCalories, totalProtein, totalCarbs, totalFat
    - Cada refeição deve conter: time, name, items (array), calories, withOrlistate (boolean)
    - Incluir macros aproximados para cada item
    - ${fasting ? 'Jejum de 16h (comer entre 12h-20h)' : 'Dia normal sem jejum'}
    - ${profile.mealsPerDay} refeições principais
    - Calorias totais baseadas no déficit necessário para atingir o peso alvo
    
    Retorne APENAS o JSON, sem comentários ou markdown MAS TEM QUE SER EM INGLES.`;
  };

  const getActivityLevelText = (level) => {
    const levels = {
      sedentary: 'Sedentário',
      moderate: 'Moderadamente ativo',
      active: 'Muito ativo'
    };
    return levels[level] || level;
  };

  const callGPTAPI = async (prompt) => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7
    });
      
    return completion.choices[0].message.content;
  };

  const processGPTResponse = (response) => {
    try {
      // Tenta parsear o JSON diretamente
      return JSON.parse(response);
    } catch (error) {
      // Se falhar, tenta extrair o JSON de markdown
      const jsonMatch = response.match(/```json([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Resposta do GPT em formato inválido');
    }
  };

  const getFallbackDietPlan = (profile, fasting) => {
    // Implementação simplificada para exemplo
    const baseCalories = fasting ? 1600 : 1800;
    return {
      meals: [
        {
          time: '08:00',
          name: 'Café da manhã',
          items: [
            '2 ovos mexidos (140 cal, 12g proteína)',
            '1 fatia de pão integral (80 cal, 3g proteína)',
            '1/4 abacate (80 cal, 7g gordura)'
          ],
          calories: 300,
          withOrlistate: false
        },
      ],
      totalCalories: baseCalories,
      totalProtein: Math.round(baseCalories * 0.3 / 4), // 30% de proteínas
      totalCarbs: Math.round(baseCalories * 0.4 / 4),  // 40% de carboidratos
      totalFat: Math.round(baseCalories * 0.3 / 9)      // 30% de gorduras
    };
  };

  const toggleMealCompleted = async (index) => {
    if (!dietPlan || !dietPlan.meals || !dietPlan.meals[index]) return;
    console.log('Marcando refeição como concluída:', index);

  const updatedPlan = { ...dietPlan };
  updatedPlan.meals[index] = {
    ...updatedPlan.meals[index],
    completed: !updatedPlan.meals[index].completed
  };

  setDietPlan(updatedPlan);
  
  try {
    await AsyncStorage.setItem(
      `dietPlan_${selectedDate}`,
      JSON.stringify(updatedPlan)
    );
  } catch (error) {
    console.error('Erro ao salvar plano:', error);
  }
};

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator animating={true} color="#37474F" size="large" />
        <Text className="mt-4 text-gray-600">Gerando seu plano de dieta...</Text>
      </View>
    );
  }

    if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-700">Perfil não encontrado</Text>
        <Button 
          mode="contained"
          onPress={() => navigation.navigate('Profile')}
          className="mt-4"
        >
          Completar Perfil
        </Button>
      </View>
    );
  }
  
  return (
    <AppContainer>
      <TextContainer>
        Plano de Dieta
      </TextContainer>
      <View className="flex-1 bg-gay-200 items-center">
        {/* Cabeçalho com navegação por data */}
        <DietNavigation 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isFastingDay={isFastingDay}
          userProfile={userProfile}
        />


        {/* Resumo nutricional */}
        {dietPlan && (
        <>
          <Card className="py-4 my-4">
            <Text className="text-xl font-bold text-center">Resumo Nutricional Diário</Text>
            <View className="flex-row justify-between p-4 gap-4">
              <NutritionInfo label="Calorias" value={dietPlan.totalCalories} unit="cal" />
              <NutritionInfo label="Proteínas" value={dietPlan.totalProtein} unit="g" />
              <NutritionInfo label="Carboidratos" value={dietPlan.totalCarbs} unit="g" />
              <NutritionInfo label="Gorduras" value={dietPlan.totalFat} unit="g" />
            </View>
          </Card>

          <ScrollView
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {dietPlan?.meals?.map((meal, index) => (
                <Card key={index} className="mb-4 bg-slate-600" theme={{ colors: { primary: 'green' } }}>
                  <Card.Title title={`${meal.time} - ${meal.name}`} subtitle={`${meal.calories} cal | ${meal.withOrlistate ? 'Com Orlistate' : 'Sem Orlistate'}`}
                    right={() => ( <CheckBox label="Concluído!"  checked={!!meal.completed} onChange={() => toggleMealCompleted(index)} color="#37474F" /> )}
                  />
                  <Card.Content>
                    {meal.items.map((item, i) => (
                      <Text key={i} className="text-gray-700 mb-1">• {safeItemToText(item)}</Text>
                    ))}
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </>
        )}
        <TouchableOpacity
          onPress={generateDietPlan} className="flex-row items-center justify-center bg-amber-600 px-4 py-2 rounded-full my-4"
        >
            <MaterialDesignIcons name="refresh" size={20} color="#fff"  />
            <Text className="text-white ml-2">Gerar um novo plano</Text>
        </TouchableOpacity>

    </View>
  </AppContainer>
  );
};

// Componente auxiliar para mostrar informações nutricionais
const NutritionInfo = ({ label, value, unit }) => (
  <View className="items-center">
    <Text className="text-sm text-gray-600">{label}</Text>
    <Text className="text-lg font-bold">
      {value} <Text className="text-sm font-normal">{unit}</Text>
    </Text>
  </View>
);

export default DietScreen;