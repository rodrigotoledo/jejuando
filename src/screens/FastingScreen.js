import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import notifee, { TriggerType } from '@notifee/react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Text, Button, useTheme, Surface, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getFastingStage } from '../utils/fastingStages';

const FastingScreen = () => {
  const { colors } = useTheme();

  const [fastingStart, setFastingStart] = useState(null);
  const [fastingEnd, setFastingEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [fill, setFill] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [fastingHours, setFastingHours] = useState("16");
  const [datePickerValue, setDatePickerValue] = useState(new Date());

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
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (Platform.OS === 'ios' && selectedDate) {
      setShowPicker(false);
    }

    if (!selectedDate || event.type === 'dismissed') {
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
    showNotification('Start Fasting', 'Your fast has started now!');
    scheduleNotification('End Fasting', 'Your fast is over!Eating time.', end.toDate());
  };

  const calculateTimeLeft = () => {
    if (!fastingEnd) return;
    const diff = fastingEnd.diff(moment(), 'seconds');
    if (diff > 0) {
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      setTimeLeft(`${hours}h ${minutes}m remaining`);
    } else {
      setTimeLeft('Fasting completed!');
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
    <Surface style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineMedium" style={{ color: colors.primary, marginBottom: 24 }}>
        Intermittent Fasting
      </Text>

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
            onPress={() => {
              setDatePickerValue(fastingStart ? fastingStart.toDate() : new Date());
              setShowPicker(true);
            }}
            style={{ marginTop: 12 }}
          >
            Start: {fastingStart ? fastingStart.format('HH:mm') : '--'} | Change start
          </Button>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={datePickerValue}
          mode="time"
          is24Hour={true}
          onChange={onChangeStart}
        />
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
        Start Intermittent Fasting with {fastingHours}h
      </Button>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
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