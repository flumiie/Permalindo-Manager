import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';

interface FloatingActionButtonProps extends ViewProps {
  icon: string;
  onPress: () => void;
}

const FloatingActionButton = (props: FloatingActionButtonProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[{ bottom: insets.bottom + 24 }, styles.container, props.style]}
      {...props}>
      <TouchableOpacity activeOpacity={0.8} onPress={props.onPress}>
        <View style={[styles.button, styles.menu]}>
          <Icon name={props.icon} size={32} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    right: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    backgroundColor: '#BF2229',
  },
  secondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
});
