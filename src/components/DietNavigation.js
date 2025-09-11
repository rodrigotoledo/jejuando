// components/DietNavigation.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';


import moment from 'moment';

const DietNavigation = ({ selectedDate, setSelectedDate, isFastingDay, userProfile }) => {
  const changeDate = (days) => {
    setSelectedDate(moment(selectedDate).add(days, 'days').format('YYYY-MM-DD'));
  };

  return (
    <View className="w-full flex-row items-center justify-between px-4 py-3 bg-white shadow-sm mb-4">
      <TouchableOpacity
        className="p-2"
        onPress={() => changeDate(-1)}
        activeOpacity={0.7}
      >
        <MaterialDesignIcons name="chevron-left" size={24} color="#37474F" />
      </TouchableOpacity>

      <View className="items-center">
        <Text className="text-lg font-bold text-gray-800">
          {moment(selectedDate).format('DD/MM/YYYY')}
        </Text>
        <Text className="text-sm text-gray-600">
          {isFastingDay ? 'Fasting Day':' Normal Day'} | {userProfile?.mealsPerDay} meals
        </Text>
      </View>

      <TouchableOpacity
        className="p-2"
        onPress={() => changeDate(1)}
        activeOpacity={0.7}
      >
        <MaterialDesignIcons name="chevron-right" size={24} color="#37474F" />
      </TouchableOpacity>
    </View>
  );
};

export default DietNavigation;