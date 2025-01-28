import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Spacer from './Spacer';
import RegularText from './Text/RegularText';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  error?: boolean;
}

export default (props: RadioButtonProps) => {
  return (
    <Pressable style={styles.row} onPress={props.onPress}>
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          borderColor: props.selected || props.error ? '#BF2229' : '#CACACA',
          ...styles.container,
        }}>
        {props.selected ? <View style={styles.inner} /> : null}
      </View>
      <Spacer width={4} />
      <RegularText type="body-medium">{props.label}</RegularText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    padding: 4,
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#BF2229',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
});
