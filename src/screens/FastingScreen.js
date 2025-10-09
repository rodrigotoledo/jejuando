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
import TextContainer from '../components/TextContainer';

const FastingScreen = () => {
  const { colors } = useTheme();

  const [fastingStart, setFastingStart] = useState(null);
  const [fastingEnd, setFastingEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [fill, setFill] = useState(0);
  const [fastingHours, setFastingHours] = useState("16");
  const [datePickerValue, setDatePickerValue] = useState(new Date());

  // Estados para Android
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [preservedTime, setPreservedTime] = useState({ hours: 0, minutes: 0 });

  // Para iOS
  const [showDatetimePicker, setShowDatetimePicker] = useState(false);

  const elapsedHours = useMemo(() => {
    if (!fastingStart) return 0;
    return moment().diff(fastingStart, 'hours', true);
  }, [fastingStart, timeLeft]);

  const stage = useMemo(() => getFastingStage(elapsedHours), [elapsedHours]);

  // Verifica se algum picker está aberto
  const showAnyPicker = showDatetimePicker || showDatePicker || showTimePicker;

  useEffect(() => {
    loadFastingTimes();
  }, []);

  useEffect(() => {
    if (!showAnyPicker && fastingStart && fastingEnd) {
      const interval = setInterval(() => {
        calculateTimeLeft();
        calculateProgress();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fastingStart, fastingEnd, showAnyPicker]);

  // Handler para iOS (datetime único)
  const onChangeDatetime = (event, selectedDate) => {
    if (selectedDate) {
      setShowDatetimePicker(false);
    }

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
    setShowDatePicker(false);

    if (!selectedDate || event?.type === 'dismissed') {
      return;
    }

    // Combina a nova data com o horário preservado
    const newTempDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      preservedTime.hours,
      preservedTime.minutes,
      0
    );
    setTempDate(newTempDate);
    setShowTimePicker(true);
  };

  // Handler para Android - Mudança de horário
  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);

    if (!selectedDate || event?.type === 'dismissed') {
      return;
    }

    // Combina a data (de tempDate) com o horário selecionado
    const combinedDate = new Date(tempDate);
    combinedDate.setHours(selectedDate.getHours());
    combinedDate.setMinutes(selectedDate.getMinutes());
    combinedDate.setSeconds(0);

    setDatePickerValue(combinedDate);

    const newStart = moment(combinedDate);
    const hours = Number(fastingHours);
    const newEnd = newStart.clone().add(hours, 'hours');

    setFastingStart(newStart);
    setFastingEnd(newEnd);
    saveFastingTimes(newStart, newEnd);
  };

  // Função para abrir o picker baseado na plataforma
  const openDateTimePicker = () => {
    if (Platform.OS === 'ios') {
      setShowDatetimePicker(true);
    } else {
      // Android: preserva o horário atual e abre date com data atual
      const hours = datePickerValue.getHours();
      const minutes = datePickerValue.getMinutes();
      setPreservedTime({ hours, minutes });

      const dateOnly = new Date(datePickerValue);
      dateOnly.setHours(0, 0, 0, 0);
      setTempDate(dateOnly);
      setShowDatePicker(true);
    }
  };

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
      <TextContainer>
        Jejum Intermitente
      </TextContainer>

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
                display="default"
                onChange={onChangeDate}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={tempDate} // Agora usa tempDate com horário preservado
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