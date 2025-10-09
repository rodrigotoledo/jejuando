import React from 'react';
import { Text } from 'react-native';

const TextContainer = ({children}) => (
  <>
    <Text className="text-4xl text-center my-4 text-primary font-andada-bold">
      {children}
    </Text>
  </>
);

export default TextContainer;
