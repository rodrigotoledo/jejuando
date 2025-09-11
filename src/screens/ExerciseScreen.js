import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_GPT_KEY } from '@env';
import {
  Card,
  Button,
  ActivityIndicator,
  Text,
  TextInput,
  Chip,
  useTheme,
} from 'react-native-paper';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const ExerciseScreen = () => {
  const { colors } = useTheme();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]); // lista de atividades
  const [input, setInput] = useState(''); // campo temporário
  const [exercisePlan, setExercisePlan] = useState(null);

  useEffect(() => {
    loadUserProfile();
    loadExercisePlan();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) setUserProfile(JSON.parse(profile));
    } catch (e) {
      console.error('Error when loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadExercisePlan = async () => {
    try {
      const plan = await AsyncStorage.getItem('exercisePlan');
      if (plan) setExercisePlan(JSON.parse(plan));
    } catch (e) {
      console.error('Error when loading plan:', e);
    }
  };

  const addActivity = () => {
    if (!input.trim()) return;
    setActivities([...activities, input.trim()]);
    setInput('');
  };

  const generateExercisePlan = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);

      const prompt = `
Crie um plano de exercícios baseado no perfil e nas atividades sugeridas:

Perfil:
- Nome: ${userProfile.name}
- Idade: ${userProfile.age}
- Peso atual: ${userProfile.currentWeight}kg
- Peso alvo: ${userProfile.targetWeight}kg
- Altura: ${userProfile.height}cm
- Sexo: ${userProfile.gender}
- Nível de atividade: ${userProfile.fitnessLevel}
- Condições de saúde: ${userProfile.healthConditions || 'nenhuma'}

Atividades sugeridas:
${activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Requisitos:
- Formato JSON
- Estrutura: { plan: [ { day, activity, duration, intensity } ], estimatedTimeToGoal }
- O plano deve ter pelo menos 7 dias variando atividades.
- DEVE SER EM INGLES
`;

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_GPT_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const parsed = JSON.parse(res.data.choices[0].message.content);

      setExercisePlan(parsed);
      await AsyncStorage.setItem('exercisePlan', JSON.stringify(parsed));
    } catch (e) {
      console.error('Erro ao gerar plano:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View className="flex-1 p-4 bg-background">
      <Text variant="headlineMedium" className="mb-4 text-primary">
        Exercises
      </Text>

      {/* Input + botão adicionar */}
      <View className="flex-row items-center mb-4 w-full">
        <View className="flex-1 mr-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            mode="outlined"
            placeholder="Ex: Walk 30min in the morning"
          />
        </View>
        <TouchableOpacity
          onPressIn={addActivity}
          className='bg-primary justify-center items-center h-10 w-10 rounded-full'
        >
          <Text style={{color: '#fff'}}>
          +
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chips das atividades adicionadas */}
      <View className="flex-row flex-wrap mb-4">
        {activities.map((act, idx) => (
          <Text
            key={idx}
            mode='outlined'
            style={{ backgroundColor: colors.surface, color: colors.primary, marginRight: 8, marginBottom: 8, padding: 4, borderRadius: 16 }}
          >
            <MaterialDesignIcons name="run-fast" size={20} color={colors.primary} />
            {act}
          </Text>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={generateExercisePlan}
        className="mb-4 rounded-lg"
      >
        Generate exercise plan
      </Button>

      {/* Mostra o plano gerado */}
      {exercisePlan && (
        <ScrollView className="mt-4">
          <Card className="mb-4">
            <Card.Title title="Exercise plan" />
            <Card.Content>
              {exercisePlan.plan.map((p, i) => (
                <Text key={i} className="mb-1">
                  Is {p.day}: {p.activity} ({p.duration}) - Intensity: {p.intensity}
                </Text>
              ))}
              <Text variant="bodyLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
                Estimation to reach goal: {exercisePlan.estimatedTimeToGoal}
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

export default ExerciseScreen;
