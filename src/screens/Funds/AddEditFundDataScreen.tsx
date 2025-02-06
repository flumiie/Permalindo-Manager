import firestore from '@react-native-firebase/firestore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
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
import { FundsDataType } from '../../libs/dataTypes';

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
  const itemNameInputRef = useRef<RNTextInput>(null);
  const memberCodeInputRef = useRef<RNTextInput>(null);
  const itemFundAmountInputRef = useRef<RNTextInput>(null);

  const [showConfirmCreateDataDropdown, setShowConfirmCreateDataDropdown] =
    useState(false);

  const ValidationSchema = Yup.object().shape({
    itemName: Yup.string().required('Harus diisi'),
    fundType: Yup.string().required('Harus diisi'),
    memberCode: Yup.string().required('Harus diisi'),
    itemFundAmount: Yup.string().required('Harus diisi'),
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
          itemName: route.params?.itemName,
          fundType: route.params?.fundType,
          memberCode: route.params?.memberCode,
          itemFundAmount: route.params?.itemFundAmount
            ? Number(
                route.params?.itemFundAmount.replace(/[.|,| |-]/g, ''),
              ).toLocaleString()
            : null,
        }}
        validateOnBlur
        validateOnChange
        validationSchema={ValidationSchema}
        onSubmit={() => setShowConfirmCreateDataDropdown(true)}>
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
            <ScrollView style={styles.container}>
              <SafeAreaView>
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

                  <TextInput
                    ref={memberCodeInputRef}
                    id="member-code"
                    label="Kode Anggota*"
                    filledTextColor
                    onChangeText={handleChange('memberCode')}
                    onBlur={handleBlur('memberCode')}
                    onSubmitEditing={() => {
                      if (!values.itemName) {
                        itemNameInputRef.current?.focus();
                      } else if (!values.itemFundAmount) {
                        itemFundAmountInputRef.current?.focus();
                      }
                    }}
                    value={values.memberCode ?? ''}
                    error={touched.memberCode && errors.memberCode}
                  />
                  <Spacer height={16} />

                  <TextInput
                    ref={itemNameInputRef}
                    id="item-name"
                    label="Nama Item*"
                    filledTextColor
                    onChangeText={handleChange('itemName')}
                    onBlur={handleBlur('itemName')}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.itemFundAmount) {
                        itemFundAmountInputRef.current?.focus();
                      }
                    }}
                    value={values.itemName}
                    error={touched.itemName && errors.itemName}
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
                      itemFundAmountInputRef.current?.setNativeProps({
                        text: Number(
                          values.itemFundAmount?.replace(/[.|,| |-]/g, ''),
                        ).toLocaleString(),
                      });
                    }}
                    value={values.itemFundAmount ?? ''}
                    error={touched.itemFundAmount && errors.itemFundAmount}
                    onSubmitEditing={() => {
                      if (!values.itemName) {
                        itemNameInputRef.current?.focus();
                      } else if (!values.memberCode) {
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
              </SafeAreaView>
            </ScrollView>
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
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  contentContainer: {
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
