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
  const itemFundAmountInputRef = useRef<RNTextInput>(null);

  const [showConfirmCreateDataDropdown, setShowConfirmCreateDataDropdown] =
    useState(false);
  const [fundTypeError, setFundTypeError] = useState(false);

  const ValidationSchema = Yup.object().shape({
    memberCode: Yup.string().required('Harus diisi'),
    memberName: Yup.string().required('Harus diisi'),
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
        validationSchema={ValidationSchema}>
        {({
          values,
          errors,
          touched,
          setFieldTouched,
          setFieldValue,
          handleChange,
          handleBlur,
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
                          id: Math.floor(Math.random() * Date.now()),
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
                    ref={memberCodeInputRef}
                    closeOnBlur
                    closeOnSubmit
                    clearOnFocus={false}
                    onSelectItem={item => {
                      setFieldValue('memberName', item?.id ?? '');
                      setFieldValue('memberCode', item?.title ?? '');
                    }}
                    onChangeText={handleChange('memberCode')}
                    onBlur={handleBlur('memberCode')}
                    debounce={600}
                    dataSet={dataSet}
                    containerStyle={{
                      borderColor: '#E1E1E1',
                      borderRadius: 2,
                      paddingVertical: 1,
                    }}
                    inputContainerStyle={{
                      backgroundColor: '#FFF',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderColor:
                        touched.memberCode && errors.memberCode
                          ? '#B60000'
                          : values.memberCode
                          ? '#00AB41'
                          : '#E1E1E1',
                    }}
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
                        color: '#4B4B4B',
                        backgroundColor: '#FFF',
                        fontFamily: 'Poppins-Regular',
                        fontSize: 14,
                      },
                    }}
                  />
                  {touched.memberCode && errors.memberCode ? (
                    <>
                      <Spacer height={4} />
                      <RegularText color="#B60000">
                        {errors.memberCode}
                      </RegularText>
                    </>
                  ) : null}
                  <Spacer height={16} />
                  <RegularText type="body-medium" color="#4B4B4B">
                    Nama Anggota
                  </RegularText>
                  <Spacer height={4} />
                  {values.memberCode ? (
                    <RegularText type="body-small" color="#4B4B4B">
                      {values.memberName}
                    </RegularText>
                  ) : (
                    <RegularText type="body-small" color="#4B4B4B">
                      Mohon isi kode anggota
                    </RegularText>
                  )}
                  <Spacer height={16} />
                  <TextInput
                    ref={itemFundAmountInputRef}
                    id="item-fund-amount"
                    label="Harga*"
                    filledTextColor
                    keyboardType="decimal-pad"
                    leftLabel="Rp"
                    onChangeText={handleChange('itemFundAmount')}
                    onBlur={handleBlur('itemFundAmount')}
                    value={values.itemFundAmount ?? ''}
                    error={touched.itemFundAmount && errors.itemFundAmount}
                    onEndEditing={() => {
                      if (values.itemFundAmount) {
                        itemFundAmountInputRef.current?.setNativeProps({
                          text: Number(
                            values.itemFundAmount?.replace(/[.|,| |-]/g, ''),
                          ).toLocaleString(),
                        });
                      }
                    }}
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
                      error={fundTypeError}
                      selected={values.fundType === 'Pemasukkan'}
                      onPress={() => {
                        itemFundAmountInputRef?.current?.blur();
                        setFieldTouched('fundType');
                        setFieldValue('fundType', 'Pemasukkan');
                        setFundTypeError(false);
                      }}
                    />
                    <Spacer width={16} />
                    <RadioButton
                      label="Pengeluaran"
                      error={fundTypeError}
                      selected={values.fundType === 'Pengeluaran'}
                      onPress={() => {
                        itemFundAmountInputRef?.current?.blur();
                        setFieldTouched('fundType');
                        setFieldValue('fundType', 'Pengeluaran');
                        setFundTypeError(false);
                      }}
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
              <Button
                type="primary"
                onPress={() => {
                  Keyboard.dismiss();
                  if (errors.memberCode) {
                    memberCodeInputRef.current?.focus();
                    memberCodeInputRef.current?.blur();
                  }
                  if (errors.memberName) {
                    memberCodeInputRef.current?.focus();
                    memberCodeInputRef.current?.blur();
                  }
                  if (errors.itemFundAmount) {
                    itemFundAmountInputRef.current?.focus();
                    itemFundAmountInputRef.current?.blur();
                  }
                  if (!values.fundType) {
                    setFundTypeError(true);
                  }
                  if (
                    !errors.memberCode &&
                    !errors.memberName &&
                    !errors.itemFundAmount &&
                    !fundTypeError
                  ) {
                    setShowConfirmCreateDataDropdown(true);
                  }
                }}>
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
