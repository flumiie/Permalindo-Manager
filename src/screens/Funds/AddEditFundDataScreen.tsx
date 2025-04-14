import firestore from '@react-native-firebase/firestore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  TextInput as RNTextInput,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';

import { asyncStorage } from '../../../store';
import { getFunds } from '../../../store/actions';
import { useAppDispatch } from '../../../store/hooks';
import { RootStackParamList } from '../../Routes';
import {
  BoldText,
  Button,
  DismissableView,
  DropdownConfirm,
  RadioButton,
  RegularText,
  Spacer,
  TextInput,
} from '../../components';
import { FundsDataType, MasterDataType } from '../../libs/dataTypes';

export default () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditFundData'>>();

  const [_, setRefreshList] = useMMKVStorage<boolean | null>(
    'refreshList',
    asyncStorage,
    null,
  );
  const [__, setSnackbar] = useMMKVStorage<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>('snackbar', asyncStorage, null);
  const [funds, setFunds] = useMMKVStorage<FundsDataType[]>(
    'funds',
    asyncStorage,
  );
  const [personels] = useMMKVStorage<MasterDataType[]>(
    'personels',
    asyncStorage,
    [],
  );
  const memberCodeInputRef = useRef<RNTextInput>(null);
  const memberNameInputRef = useRef<RNTextInput>(null);
  const itemFundAmountInputRef = useRef<RNTextInput>(null);

  const [showConfirmCreateDataDropdown, setShowConfirmCreateDataDropdown] =
    useState(false);

  const ValidationSchema = Yup.object().shape({
    memberCode: Yup.string().required('Harus diisi'),
    memberName: Yup.string().required('Harus diisi'),
    fundType: Yup.string().required('Harus diisi'),
    itemFundAmount: Yup.string().required('Harus diisi'),
  });

  const dataSet = personels.map(S => {
    return {
      id: S.fullName,
      title: S.memberCode,
    };
  });

  useEffect(() => {
    dispatch(
      getFunds({
        onSuccess: v => {
          setFunds(v);
        },
        onError: () => {},
      }),
    );
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFF" />
      <Formik
        enableReinitialize
        initialValues={{
          date: route.params?.date,
          id: route.params?.id,
          memberCode: route.params?.memberCode,
          memberName: route.params?.memberName,
          fundType: route.params?.fundType,
          itemFundAmount: route.params?.itemFundAmount
            ? Number(
                route.params?.itemFundAmount.replace(/[.|,| |-]/g, ''),
              ).toLocaleString()
            : null,
        }}
        validateOnBlur
        validateOnChange
        validationSchema={ValidationSchema}
        onSubmit={() => {
          Keyboard.dismiss();
          setShowConfirmCreateDataDropdown(true);
        }}>
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <>
            <StatusBar backgroundColor="#FFF" />
            <DropdownConfirm
              open={showConfirmCreateDataDropdown}
              title="Konfirmasi"
              onClose={() => setShowConfirmCreateDataDropdown(false)}
              content={
                <>
                  <Spacer height={8} />
                  <RegularText type="body-medium">
                    Yakin data sudah benar? Data akan{' '}
                    {route.params ? 'berubah' : 'ditambahkan'} setelah menekan
                    OK
                  </RegularText>
                </>
              }
              actions={{
                left: {
                  label: 'Batal',
                  onPress: () => setShowConfirmCreateDataDropdown(false),
                },
                right: {
                  label: 'OK',
                  onPress: () => {
                    setShowConfirmCreateDataDropdown(false);
                    if (route.params) {
                      firestore()
                        .collection('Funds')
                        .where('id', '==', route.params?.id ?? '')
                        .get()
                        .then(querySnap => {
                          if (querySnap.docs.length) {
                            firestore()
                              .collection('Funds')
                              .doc(querySnap.docs[0].id)
                              .update(values)
                              .then(() => {
                                setFunds(prev => {
                                  let temp = prev;

                                  temp = temp?.map(S => {
                                    if (S.id === route.params?.id) {
                                      return values;
                                    }
                                    return S;
                                  });

                                  return temp;
                                });
                                setSnackbar({
                                  show: true,
                                  type: 'success',
                                  message: 'Data sudah tersimpan',
                                });
                                setShowConfirmCreateDataDropdown(false);
                                navigation.goBack();
                              });
                          }
                        });
                    } else {
                      firestore()
                        .collection('Funds')
                        .add({
                          ...values,
                          date: new Date().toString(),
                          id: (funds?.length ?? 0) + 1,
                        })
                        .then(() => {
                          setRefreshList(true);
                          navigation.goBack();
                          setSnackbar({
                            show: true,
                            type: 'success',
                            message: 'Data sudah tersimpan',
                          });
                        });
                    }
                  },
                },
              }}
            />
            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <DismissableView style={styles.contentContainer}>
                  <BoldText type="title-medium">Isi data kas baru</BoldText>
                  <Spacer height={4} />
                  <RegularText type="body-small" color="#4B4B4B">
                    Silakan masukan data terlebih dahulu untuk melanjutkan
                  </RegularText>
                  <Spacer height={8} />
                  <RegularText type="body-small" color="#AAA">
                    * Harus diisi
                  </RegularText>
                  <Spacer height={24} />
                  <AutocompleteDropdown
                    closeOnBlur
                    closeOnSubmit
                    clearOnFocus={false}
                    onSelectItem={item => {
                      setFieldValue('memberName', item?.id ?? '');
                    }}
                    debounce={600}
                    dataSet={dataSet}
                    containerStyle={{
                      borderColor: '#E1E1E1',
                      borderRadius: 2,
                      borderWidth: 1,
                      paddingVertical: 1,
                    }}
                    inputContainerStyle={{ backgroundColor: '#FFF' }}
                    rightButtonsContainerStyle={{ backgroundColor: '#FFF' }}
                    suggestionsListContainerStyle={{ backgroundColor: '#FFF' }}
                    suggestionsListTextStyle={{
                      color: '#222',
                      backgroundColor: '#FFF',
                    }}
                    textInputProps={{
                      placeholder: 'Contoh: A08001',
                      autoCorrect: false,
                      autoCapitalize: 'none',
                      style: {
                        color: '#222',
                        borderRadius: 0,
                        borderColor: '#FFF',
                        backgroundColor: '#FFF',
                      },
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={memberNameInputRef}
                    id="member-name"
                    label="Nama Anggota*"
                    filledTextColor
                    onChangeText={handleChange('memberName')}
                    onBlur={handleBlur('memberName')}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.itemFundAmount) {
                        itemFundAmountInputRef.current?.focus();
                      }
                    }}
                    value={values.memberName}
                    error={touched.memberName && errors.memberName}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={itemFundAmountInputRef}
                    id="item-fund-amount"
                    label="Harga*"
                    filledTextColor
                    keyboardType="decimal-pad"
                    leftLabel="Rp"
                    onChangeText={handleChange('itemFundAmount')}
                    onBlur={() => {
                      handleBlur('itemFundAmount');
                      if (values.itemFundAmount) {
                        itemFundAmountInputRef.current?.setNativeProps({
                          text: Number(
                            values.itemFundAmount?.replace(/[.|,| |-]/g, ''),
                          ).toLocaleString(),
                        });
                      }
                    }}
                    value={values.itemFundAmount ?? ''}
                    error={touched.itemFundAmount && errors.itemFundAmount}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={24} />
                  <View style={styles.row}>
                    <RadioButton
                      label="Pemasukkan"
                      error={touched.fundType && !!errors.fundType}
                      selected={values.fundType === 'Pemasukkan'}
                      onPress={() => setFieldValue('fundType', 'Pemasukkan')}
                    />
                    <Spacer width={16} />
                    <RadioButton
                      label="Pengeluaran"
                      error={touched.fundType && !!errors.fundType}
                      selected={values.fundType === 'Pengeluaran'}
                      onPress={() => setFieldValue('fundType', 'Pengeluaran')}
                    />
                  </View>
                  {touched.fundType && errors.fundType ? (
                    <>
                      <Spacer height={4} />
                      <RegularText color="#B60000">
                        {errors.fundType}
                      </RegularText>
                    </>
                  ) : null}
                </DismissableView>
              </ScrollView>
            </SafeAreaView>
            <View
              style={{
                ...styles.buttonContainer,
                paddingBottom: insets.bottom + 16,
              }}>
              <Button type="primary" onPress={handleSubmit}>
                Simpan
              </Button>
            </View>
          </>
        )}
      </Formik>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
});
