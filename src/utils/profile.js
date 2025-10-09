import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadUserProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    return null;
  }
};

export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
  }
};
