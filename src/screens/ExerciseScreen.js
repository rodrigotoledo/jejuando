import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import {
  Card,
  Button,
  ActivityIndicator,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Config from 'react-native-config'
import OpenAI from 'openai';
import AppContainer from '../components/AppContainer';
import TextContainer from '../components/TextContainer';
import { callGPTAPI } from '../utils/openai';

const ExerciseScreen = ({navigation}) => {
  const { colors } = useTheme();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]); // lista de atividades
  const [input, setInput] = useState(''); // campo temporário
  const [exercisePlan, setExercisePlan] = useState(null);
  let openai = new OpenAI({ apiKey: Config.API_GPT_KEY });
  openai.baseURL = 'https://api.openai.com/v1';
  openai.buildURL = (path) => `${openai.baseURL}${path.startsWith('/') ? path : '/' + path}`;

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
      if (userProfile) {
        loadExercisePlan();
      }
    }, [userProfile]);

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

  const loadExercisePlan = async () => {
    try {
      setLoading(true);
      const plan = await AsyncStorage.getItem('exercisePlan');
      if (plan){
        setExercisePlan(plan); // Agora é string Markdown, não JSON
      }else{
        generateExercisePlan();
      }
    } catch (e) {
      console.error('Erro ao carregar plano:', e);
      Alert.alert('Erro', 'Não foi possível carregar o plano de exercícios');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = () => {
    if (!input.trim()) return;
    setActivities([...activities, input.trim()]);
    setInput('');
  };

  const getFallbackExercisePlan = (profile) => {
  // Implementação simplificada para exemplo - agora retorna string Markdown em PT
  const intensity = profile?.fitnessLevel || 'sedentary'; // sedentary, moderate, active
  const baseDuration = intensity === 'active' ? 40 : intensity === 'moderate' ? 30 : 20;
  const calPerMin = intensity === 'active' ? 8 : intensity === 'moderate' ? 6 : 5; // Cal/min aproximado

  let exercises = '';
  if (intensity === 'active') {
    exercises = `
### Corrida intervalada
Duração: 15 min | Repetições: N/A | Calorias: ${Math.round(15 * calPerMin)}

### Burpees
Duração: 10 min | Repetições: 4 séries de 10 | Calorias: ${Math.round(10 * calPerMin)}

### Flexões diamante
Duração: 10 min | Repetições: 3 séries de 15 | Calorias: ${Math.round(10 * calPerMin)}

### Alongamentos dinâmicos
Duração: 5 min | Repetições: Todo o corpo | Calorias: ${Math.round(5 * calPerMin * 0.7)}
    `;
  } else if (intensity === 'moderate') {
    exercises = `
### Caminhada rápida
Duração: 12 min | Repetições: N/A | Calorias: ${Math.round(12 * calPerMin)}

### Agachamentos com salto
Duração: 8 min | Repetições: 3 séries de 12 | Calorias: ${Math.round(8 * calPerMin)}

### Prancha com rotação
Duração: 5 min | Repetições: 3x 30s | Calorias: ${Math.round(5 * calPerMin)}

### Alongamentos
Duração: 5 min | Repetições: Todo o corpo | Calorias: ${Math.round(5 * calPerMin * 0.7)}
    `;
  } else {
    exercises = `
### Caminhada leve
Duração: 10 min | Repetições: N/A | Calorias: ${Math.round(10 * calPerMin)}

### Flexões de parede
Duração: 5 min | Repetições: 3 séries de 8 | Calorias: ${Math.round(5 * calPerMin)}

### Elevação de pernas sentado
Duração: 5 min | Repetições: 3 séries de 10 | Calorias: ${Math.round(5 * calPerMin)}
    `;
  }

  const totalTime = baseDuration;
  const totalCaloriesBurned = Math.round(baseDuration * calPerMin);

  return `# Plano de Exercícios Adaptado para Nível ${intensity.charAt(0).toUpperCase() + intensity.slice(1)}

## Resumo
- Tempo total: ${totalTime} minutos
- Calorias estimadas: ${totalCaloriesBurned} cal

${exercises}

## Estimativa para Alcançar Meta
Com base no seu perfil, mantenha consistência por 4-6 semanas para ver resultados visíveis no peso alvo.`;
};

  const generateExercisePlan = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);

      // Monta o prompt com base no perfil do usuário
      const prompt = createGPTPrompt(userProfile);
      
      // Chama a API do GPT
      const gptResponse = await callGPTAPI(prompt);
      
      // Processa a resposta
      const generatedPlan = processGPTResponse(gptResponse);
      
      // Salva localmente como string
      await AsyncStorage.setItem(
        `exercisePlan`,
        generatedPlan // Agora é a string Markdown limpa
      );
      
      setExercisePlan(generatedPlan);
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      // Plano de fallback caso a API falhe
      setExercisePlan(getFallbackExercisePlan(userProfile));
    } finally {
      setLoading(false);
    }
  };

  const createGPTPrompt = (userProfile) => {
    return `Crie um plano de exercícios baseado no perfil e nas atividades sugeridas. O plano deve ter pelo menos 7 dias variando atividades, incluindo duração, intensidade e dicas em português.

    Perfil:
    - Nome: ${userProfile.name}
    - Idade: ${userProfile.age}
    - Peso atual: ${userProfile.currentWeight}kg
    - Peso alvo: ${userProfile.targetWeight}kg
    - Altura: ${userProfile.height}cm
    - Sexo: ${userProfile.gender}
    - Nível de atividade: ${getActivityLevelText(userProfile.fitnessLevel)}
    - Condições de saúde: ${userProfile.healthConditions || 'nenhuma'}

    Atividades sugeridas:
    ${activities.map((a, i) => `${i + 1}. ${a}`).join('\n') || 'Nenhuma atividade sugerida - crie um plano genérico equilibrado.'}

    Requisitos:
    - Retorne APENAS em formato MARKDOWN, todo o conteúdo EM PORTUGUÊS.
    - Estrutura sugerida: Título principal, resumo (tempo total, calorias estimadas), seções por dia (## Dia X: Atividade - Duração: X min - Intensidade: Baixa/Média/Alta - Descrição breve), e uma seção final com estimativa de tempo para meta.
    - Mantenha simples e motivador, sem código ou JSON.`;
  };

  const getActivityLevelText = (level) => {
    const levels = {
      sedentary: 'Sedentário',
      moderate: 'Moderadamente ativo',
      active: 'Muito ativo'
    };
    return levels[level] || level;
  };


  const processGPTResponse = (response) => {
    try {
      // Remove blocos de código Markdown se existirem (ex: ```markdown ... ```)
      let cleanResponse = response;
      const mdMatch = response.match(/```markdown([\s\S]*?)```/i) || response.match(/```([\s\S]*?)```/i);
      if (mdMatch) {
        cleanResponse = mdMatch[1].trim();
      }
      // Remove qualquer texto extra antes/depois
      cleanResponse = cleanResponse.replace(/^\s*[^#]*\n?/, '').trim(); // Remove linhas não-MD no topo
      return cleanResponse;
    } catch (error) {
      throw new Error('Resposta do GPT em formato inválido');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator animating={true} size="large" />
        <Text className="mt-4 text-secondary">Gerando seu plano de exercícios...</Text>
      </View>
    );
  }

  return (
    <AppContainer>
      <View className="flex-1 p-4 bg-background">
        <TextContainer>
          Plano de Exercícios
        </TextContainer>

        {/* Input + botão adicionar */}
        <View className="flex-row items-center mb-4 w-full">
          <View className="flex-1 mr-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              mode="outlined"
              placeholder="Ex: Caminhar 30min pela manhã"
            />
          </View>
          <TouchableOpacity
            onPressIn={addActivity}
            className='bg-primary justify-center items-center h-10 w-10 rounded-full'
          >
            <Text className='text-white'>
            +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chips das atividades adicionadas */}
        <View className="flex-row flex-wrap mb-4">
          {activities.map((act, idx) => (
            <Text
              key={idx}
              className="bg-surface text-primary mr-2 mb-2 px-3 py-1 rounded-full flex-row items-center"
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
          icon={({ size, color }) => (
            <MaterialDesignIcons name="refresh" size={size} color={color} />
          )}
        >
          Gerar plano de exercícios
        </Button>

        {/* Mostra o plano gerado */}
        {exercisePlan && (
          <ScrollView className="mb-2">
            <Card className="my-4">
              <Card.Content>
                <Markdown>
                  {exercisePlan}
                </Markdown>
              </Card.Content>
            </Card>
          </ScrollView>
        )}
      </View>
    </AppContainer>
  );
};

export default ExerciseScreen;