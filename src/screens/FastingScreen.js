import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import notifee, { TriggerType } from '@notifee/react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Button, useTheme, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getFastingStage } from '../utils/fastingStages';
import AppContainer from '../components/AppContainer';

const FastingScreen = () => {
  const { colors } = useTheme();

  const [fastingStart, setFastingStart] = useState(null);
  const [fastingEnd, setFastingEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [fill, setFill] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [fastingHours, setFastingHours] = useState("16");
  const [datePickerValue, setDatePickerValue] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false); // Para data no Android
  const [showTimePicker, setShowTimePicker] = useState(false); // Para horário no Android
  const [tempDate, setTempDate] = useState(new Date()); // Data temporária no Android para combinar

  // Para iOS, reutiliza showPicker (mas renomeei pra showDatetimePicker pra clareza)
  const [showDatetimePicker, setShowDatetimePicker] = useState(false);

  // ... useMemos e outros useEffects iguais ...

  // Handler para iOS (datetime único)
  const onChangeDatetime = (event, selectedDate) => {
    // No iOS, esconde só se uma data foi selecionada (não há "cancel" explícito no onChange)
    if (selectedDate) {
      setShowDatetimePicker(false);
    }

    // Early return se não há data selecionada
    if (!selectedDate) {
      return;
    }

    setDatePickerValue(selectedDate);

    const newStart = moment(selectedDate);
    const hours = Number(fastingHours);
    const newEnd = newStart.clone().add(hours, 'hours');

    setFastingStart(newStart);
    setFastingEnd(newEnd);
    saveFastingTimes(newStart, newEnd);
  };

  // Handler para Android - Mudança de data
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false); // Fecha o date picker

    if (!selectedDate || event?.type === 'dismissed') {
      return;
    }

    // Atualiza a data temporária e abre o time picker
    setTempDate(selectedDate);
    setShowTimePicker(true);
  };

  // Handler para Android - Mudança de horário
  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false); // Fecha o time picker

    if (!selectedDate || event?.type === 'dismissed') {
      return;
    }

    // Combina a data (de tempDate) com o horário selecionado
    const combinedDate = new Date(tempDate);
    combinedDate.setHours(selectedDate.getHours());
    combinedDate.setMinutes(selectedDate.getMinutes());
    combinedDate.setSeconds(0); // Opcional: zera segundos

    setDatePickerValue(combinedDate);

    const newStart = moment(combinedDate);
    const hours = Number(fastingHours);
    const newEnd = newStart.clone().add(hours, 'hours');

    setFastingStart(newStart);
    setFastingEnd(newEnd);
    saveFastingTimes(newStart, newEnd);
  };

  // Função para abrir o picker baseado na plataforma (chamada no onPress do botão)
  const openDateTimePicker = () => {
    if (Platform.OS === 'ios') {
      setShowDatetimePicker(true);
    } else {
      // Android: abre date primeiro
      setTempDate(datePickerValue); // Usa o valor atual como base
      setShowDatePicker(true);
    }
  };

  // ... loadFastingTimes e saveFastingTimes iguais, mas ajustei load pra usar datePickerValue ...

  const loadFastingTimes = async () => {
    const start = await AsyncStorage.getItem('fastingStart');
    const end = await AsyncStorage.getItem('fastingEnd');
    if (start) {
      const startMoment = moment(start);
      setFastingStart(startMoment);
      setDatePickerValue(startMoment.toDate());
    }
    if (end) {
      setFastingEnd(moment(end));
    }
  };

  const saveFastingTimes = async (start, end) => {
    await AsyncStorage.setItem('fastingStart', start.toISOString());
    await AsyncStorage.setItem('fastingEnd', end.toISOString());
  };

  const elapsedHours = useMemo(() => {
    if (!fastingStart) return 0;
    return moment().diff(fastingStart, 'hours', true);
  }, [fastingStart, timeLeft]);

  const stage = useMemo(() => getFastingStage(elapsedHours), [elapsedHours]);

  useEffect(() => {
    loadFastingTimes();
  }, []);

  useEffect(() => {
    if (!showPicker && fastingStart && fastingEnd) {
      const interval = setInterval(() => {
        calculateTimeLeft();
        calculateProgress();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fastingStart, fastingEnd, showPicker]);

  const onChangeStart = (event, selectedDate) => {
    // Esconde o picker no Android sempre (ele fecha sozinho após seleção ou cancel)
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    // No iOS, esconde só se uma data foi selecionada (não há "cancel" explícito no onChange)
    if (Platform.OS === 'ios' && selectedDate) {
      setShowPicker(false);
    }

    // Early return se não há data selecionada OU se é Android e foi dismissed
    if (!selectedDate || (Platform.OS === 'android' && event?.type === 'dismissed')) {
      return;
    }

    setDatePickerValue(selectedDate);

    const newStart = moment(selectedDate);
    const hours = Number(fastingHours);
    const newEnd = newStart.clone().add(hours, 'hours');

    setFastingStart(newStart);
    setFastingEnd(newEnd);
    saveFastingTimes(newStart, newEnd);
  };

  const startFasting = (hours = 16) => {
    const now = moment();
    const end = now.clone().add(hours, 'hours');
    setFastingStart(now);
    setFastingEnd(end);
    setDatePickerValue(now.toDate());
    saveFastingTimes(now, end);
    showNotification('Iniciar Jejum', 'Seu jejum começou agora!');
    scheduleNotification('Fim do Jejum', 'Seu jejum terminou! Hora de comer.', end.toDate());
  };

  const calculateTimeLeft = () => {
    if (!fastingEnd) return;
    const diff = fastingEnd.diff(moment(), 'seconds');
    if (diff > 0) {
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      setTimeLeft(`${hours}h ${minutes}m restantes`);
    } else {
      setTimeLeft('Jejum concluído!');
      setFill(100);
    }
  };

  const calculateProgress = () => {
    if (!fastingStart || !fastingEnd) return;
    const total = fastingEnd.diff(fastingStart, 'seconds');
    const elapsed = moment().diff(fastingStart, 'seconds');
    const percent = Math.min((elapsed / total) * 100, 100);
    setFill(percent);
  };

  const showNotification = async (title, body) => {
    await notifee.displayNotification({
      title,
      body,
      android: { channelId: 'default_channel' },
    });
  };

  const scheduleNotification = async (title, body, date) => {
    await notifee.createTriggerNotification(
      { title, body, android: { channelId: 'default_channel' } },
      { type: TriggerType.TIMESTAMP, timestamp: date.getTime() }
    );
  };

  return (
    <AppContainer>
      <Text className="text-4xl text-center my-4 text-primary font-andada-bold">
        Jejum Intermitente
      </Text>

      <View className="flex justify-center items-center my-4">
        <AnimatedCircularProgress
          size={200}
          width={16}
          fill={fill}
          tintColor={colors.primary}
          backgroundColor={colors.surfaceVariant}
        >
          {() => (
            <Text variant="titleLarge" style={{ textAlign: 'center', color: colors.onSurface }}>
              {timeLeft || '--'}
            </Text>
          )}
        </AnimatedCircularProgress>

        {fastingStart && (
          <View style={{ marginVertical: 16, alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ marginTop: 8, color: stage.color }}>
              {stage.title} — {stage.subtitle}
            </Text>
            <Button
              mode="outlined"
              onPress={openDateTimePicker}
              style={{ marginTop: 12 }}
            >
              Início: {fastingStart ? fastingStart.format('HH:mm') : '--'} | Alterar início
            </Button>
          </View>
        )}

        {Platform.OS === 'ios' ? (
          showDatetimePicker && (
            <DateTimePicker
              value={datePickerValue}
              mode="datetime"
              is24Hour={true}
              onChange={onChangeDatetime}
            />
          )
        ) : (
          // Android: dois pickers separados
          <>
            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default" // Opcional: ajusta display no Android
                onChange={onChangeDate}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={datePickerValue} // Usa o horário atual como base
                mode="time"
                is24Hour={true}
                onChange={onChangeTime}
              />
            )}
          </>
        )}

        <RadioButton.Group
          onValueChange={setFastingHours}
          value={fastingHours}
        >
          <View style={styles.radioContainer}>
            {["10", "12", "14", "16", "18", "24", "36"].map((value) => (
              <View key={value} style={styles.radioItem}>
                <RadioButton value={value} />
                <Text>{value}h</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>

        <Button
          mode="contained"
          onPress={() => startFasting(Number(fastingHours))}
          style={{ marginTop: 16 }}
        >
          Iniciar Jejum Intermitente com {fastingHours}h
        </Button>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
});

export default FastingScreen;