import dayjs from 'dayjs';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import FastImage, { Source } from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';

import Badge, { BadgeProps } from '../Badge';
import Spacer from '../Spacer';
import MediumText from '../Text/MediumText';
import RegularText from '../Text/RegularText';

type SubtitleType = {
  subtitle: string;
  desc: string;
  extra?: number;
};

interface ItemListProps extends PressableProps {
  id: string;
  title: string;
  date?: string;
  leftImage?: number | Source;
  sub?: SubtitleType | BadgeProps;
  onPress: () => void;
}

export default (props: ItemListProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        android_ripple={props.android_ripple ?? { color: '#BF222966' }}
        style={styles.pressable}
        onPress={props.onPress}>
        <View style={styles.contents}>
          <View style={styles.listLeftContents}>
            {props.leftImage ? (
              <>
                <View
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    width: 56,
                    height: 56,
                    ...styles.imageContainer,
                  }}>
                  <FastImage
                    defaultSource={require('../../../assets/images/gears.jpg')}
                    source={props.leftImage}
                    resizeMode={FastImage.resizeMode.cover}
                    style={styles.largeImage}
                  />
                </View>
                <Spacer width={12} />
              </>
            ) : null}
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flex: 1,
                alignSelf: props.sub ? 'flex-start' : 'center',
              }}>
              <View style={styles.contents}>
                <MediumText color="#000">{props.title}</MediumText>
                {props.date ? (
                  <RegularText color="#666" size={11}>
                    {dayjs(props.date ?? '').format('HH:mm  |  D MMM YYYY')}
                  </RegularText>
                ) : null}
              </View>
              {(props.sub as SubtitleType) ? (
                <>
                  <RegularText size={12} color="#4B4B4B">
                    {(props.sub as SubtitleType).subtitle}
                  </RegularText>
                  <RegularText size={12} color="#4B4B4B">
                    {(props.sub as SubtitleType).desc}
                  </RegularText>
                  {/* <RegularText size={12} color="#4B4B4B">
                    Belum dibayar: Rp {(props.sub as SubtitleType).balance}
                  </RegularText> */}
                </>
              ) : null}
              {(props.sub as BadgeProps)?.label ? (
                <View style={styles.badgeContainer}>
                  <Badge
                    type={(props.sub as BadgeProps).type}
                    label={(props.sub as BadgeProps).label}
                  />
                </View>
              ) : null}
            </View>
          </View>
          <Spacer width={16} />
          <Icon name="chevron-right" size={24} color="#44474E" />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    alignSelf: 'flex-start',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  contents: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  listLeftContents: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigator: {
    paddingRight: 8,
  },
  pressable: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
  },
});
