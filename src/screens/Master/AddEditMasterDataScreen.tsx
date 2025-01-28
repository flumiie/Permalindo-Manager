import firestore from '@react-native-firebase/firestore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
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
import getMemberData from '../../../store/actions/getMemberData';
import { useAppDispatch } from '../../../store/hooks';
import { RootStackParamList } from '../../Routes';
import {
  BoldText,
  Button,
  DismissableView,
  DropdownConfirm,
  MediumText,
  RegularText,
  Spacer,
  TextInput,
} from '../../components';
import { MasterDataType } from '../../libs/dataTypes';

export default () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditMasterData'>>();

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
  const [memberData, setMemberData] = useState<MasterDataType | null>(null);

  // const avatarInputRef = useRef<RNTextInput>(null);
  const memberCodeInputRef = useRef<RNTextInput>(null);
  const fullNameInputRef = useRef<RNTextInput>(null);
  const birthPlaceDateInputRef = useRef<RNTextInput>(null);
  const religionInputRef = useRef<RNTextInput>(null);
  const identityCardAddressInputRef = useRef<RNTextInput>(null);
  const currentAddressInputRef = useRef<RNTextInput>(null);
  const countryInputRef = useRef<RNTextInput>(null);
  const provinceInputRef = useRef<RNTextInput>(null);
  const cityInputRef = useRef<RNTextInput>(null);
  const zipCodeInputRef = useRef<RNTextInput>(null);
  const phoneNoInputRef = useRef<RNTextInput>(null);
  const emailInputRef = useRef<RNTextInput>(null);
  const statusInputRef = useRef<RNTextInput>(null);
  const balanceInitialInputRef = useRef<RNTextInput>(null);
  const balanceEndInputRef = useRef<RNTextInput>(null);

  const [showConfirmCreateDataDropdown, setShowConfirmCreateDataDropdown] =
    useState({
      state: false,
      values: {},
    });

  const ValidationSchema = Yup.object().shape({
    // avatar: Yup.string().required('Harus diisi'),
    memberCode: Yup.string().required('Harus diisi'),
    fullName: Yup.string().required('Harus diisi'),
    birthPlaceDate: Yup.string().required('Harus diisi'),
    religion: Yup.string().required('Harus diisi'),
    address: Yup.object({
      identityCardAddress: Yup.string().required('Harus diisi'),
      currentAddress: Yup.string().required('Harus diisi'),
      country: Yup.string().required('Harus diisi'),
      province: Yup.string().required('Harus diisi'),
      city: Yup.string().required('Harus diisi'),
      zipCode: Yup.string().required('Harus diisi'),
    }),
    phoneNo: Yup.string().required('Harus diisi'),
    email: Yup.string().email('Format email salah').required('Harus diisi'),
    status: Yup.string().required('Harus diisi'),
    balance: Yup.object({
      initial: Yup.string().required('Harus diisi'),
      end: Yup.string().required('Harus diisi'),
    }),
  });

  const fetchData = () => {
    dispatch(
      getMemberData({
        memberCode: route.params?.memberCode ?? '',
        onSuccess: v => {
          setMemberData(v);
        },
        onError: () => {
          setSnackbar({
            show: true,
            type: 'error',
            message: 'Ada kesalahan. Mohon coba lagi nanti',
          });
        },
      }),
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.memberCode]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFF" />
      <Formik
        enableReinitialize
        initialValues={{
          // avatar: memberData?.avatar??'',
          memberCode: memberData?.memberCode ?? '',
          fullName: memberData?.fullName ?? '',
          birthPlaceDate: memberData?.birthPlaceDate ?? '',
          religion: memberData?.religion ?? '',
          email: memberData?.email ?? '',
          status: memberData?.status ?? '',
          phoneNo: memberData?.phoneNo ?? '',
          address: {
            identityCardAddress: memberData?.address?.identityCardAddress ?? '',
            currentAddress: memberData?.address?.currentAddress ?? '',
            city: memberData?.address?.city ?? '',
            province: memberData?.address?.province ?? '',
            country: memberData?.address?.country ?? '',
            zipCode: memberData?.address?.zipCode ?? '',
          },
          balance: {
            initial: memberData?.balance?.initial ?? '',
            end: memberData?.balance?.end ?? '',
          },
        }}
        validateOnBlur
        validateOnChange
        validationSchema={ValidationSchema}
        onSubmit={values => {
          setShowConfirmCreateDataDropdown({
            state: true,
            values,
          });
          // navigation.navigate(
          //   route.name.includes('Clearance')
          //     ? 'AddClearanceData'
          //     : 'AddVibrationData',
          //   {
          //     areaCode: values.areaCode,
          //     category: values.category,
          //     dateCreated: values.dateCreated,
          //     timeCreated: values.timeCreated,
          //     type: values.type,
          //     unit: values.unit,
          //     area: values.area,
          //   },
          // );
        }}>
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <>
            <StatusBar backgroundColor="#FFF" />
            <DropdownConfirm
              open={showConfirmCreateDataDropdown.state}
              title="Konfirmasi"
              onClose={() => {
                setShowConfirmCreateDataDropdown({
                  state: false,
                  values: {},
                });
              }}
              content={
                <>
                  <Spacer height={8} />
                  <RegularText type="body-medium">
                    Yakin data sudah benar? Data akan ditambahkan setelah
                    menekan OK
                  </RegularText>
                </>
              }
              actions={{
                left: {
                  label: 'Batal',
                  onPress: () => {
                    setShowConfirmCreateDataDropdown({
                      state: false,
                      values: {},
                    });
                  },
                },
                right: {
                  label: 'OK',
                  onPress: () => {
                    setShowConfirmCreateDataDropdown({
                      state: false,
                      values: {},
                    });
                    firestore()
                      .collection('Personels')
                      .add(values)
                      .then(() => {
                        setRefreshList(true);
                        navigation.goBack();
                        setSnackbar({
                          show: true,
                          type: 'success',
                          message: 'Data sudah tersimpan',
                        });
                      });
                  },
                },
              }}
            />
            <ScrollView style={styles.container}>
              <SafeAreaView>
                <DismissableView style={styles.contentContainer}>
                  <BoldText type="title-medium">Buat master data baru</BoldText>
                  <Spacer height={4} />
                  <RegularText type="body-small" color="#4B4B4B">
                    Silakan masukan data terlebih dahulu untuk melanjutkan
                  </RegularText>
                  <Spacer height={8} />
                  <RegularText type="body-small" color="#AAA">
                    * Harus diisi
                  </RegularText>
                  <Spacer height={24} />
                  {/* <RegularText type="body-medium" color="#4B4B4B">
                    Foto
                  </RegularText>
                  <Spacer height={4} />
                  <Pressable
                    style={styles.avatarContainer}
                    onPress={() => {
                      ImagePicker?.openPicker({
                        mediaType: 'photo',
                        compressImageQuality: 0.9,
                        cropping: true,
                        forceJpg: true,
                        cropperCircleOverlay: true,
                      }).then(photo => {
                        setFieldValue('avatar', photo.path);
                      });
                    }}>
                    <FastImage
                      defaultSource={require('../../../assets/images/avatar.png')}
                      source={{ uri: values.avatar }}
                      resizeMode={FastImage.resizeMode.cover}
                      style={styles.avatar}
                    />
                    <Pressable
                      style={styles.cameraIconContainer}
                      onPress={() => {
                        ImagePicker?.openPicker({
                          mediaType: 'photo',
                          compressImageQuality: 0.9,
                          cropping: true,
                          forceJpg: true,
                          cropperCircleOverlay: true,
                        }).then(photo => {
                          setFieldValue('avatar', photo.path);
                        });
                      }}>
                      <Icon name="camera" size={12} style={styles.cameraIcon} />
                    </Pressable>
                  </Pressable>
                  <Spacer height={16} /> */}
                  <TextInput
                    ref={memberCodeInputRef}
                    id="member-code"
                    label="Kode Member*"
                    placeholder="Contoh: ABC-123"
                    filledTextColor
                    onChangeText={handleChange('memberCode')}
                    onBlur={handleBlur('memberCode')}
                    onSubmitEditing={() => {
                      if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                    value={values.memberCode.toUpperCase()}
                    error={touched.memberCode && errors.memberCode}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={fullNameInputRef}
                    id="full-name"
                    label="Nama Lengkap*"
                    placeholder="Contoh: Tjen Khin Fan"
                    filledTextColor
                    onChangeText={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                    value={`${values.fullName
                      .charAt(0)
                      .toUpperCase()}${values.fullName.substring(1)}`}
                    error={touched.fullName && errors.fullName}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={birthPlaceDateInputRef}
                    id="birth-place-date"
                    label="Tempat / Tgl. Lahir*"
                    placeholder="Contoh: Jakarta, 01 Jan 1960"
                    filledTextColor
                    onChangeText={handleChange('birthPlaceDate')}
                    onBlur={handleBlur('birthPlaceDate')}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                    value={`${values.birthPlaceDate
                      .charAt(0)
                      .toUpperCase()}${values.birthPlaceDate.substring(1)}`}
                    error={touched.birthPlaceDate && errors.birthPlaceDate}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={religionInputRef}
                    id="religion"
                    label="Agama"
                    placeholder="Contoh: Buddha"
                    filledTextColor
                    onChangeText={handleChange('religion')}
                    onBlur={handleBlur('religion')}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                    value={`${values.religion
                      .charAt(0)
                      .toUpperCase()}${values.religion.substring(1)}`}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={emailInputRef}
                    id="email"
                    label="Email"
                    placeholder="Contoh: ytjendrawan@gmail.com"
                    filledTextColor
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={statusInputRef}
                    id="status"
                    label="Status"
                    placeholder="Contoh: Menikah"
                    filledTextColor
                    onChangeText={handleChange('status')}
                    onBlur={handleBlur('status')}
                    value={`${values.status
                      .charAt(0)
                      .toUpperCase()}${values.status.substring(1)}`}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={phoneNoInputRef}
                    id="phoneNo"
                    label="Nomor HP*"
                    placeholder="Contoh: 082111983759"
                    filledTextColor
                    keyboardType="phone-pad"
                    onChangeText={handleChange('phoneNo')}
                    onBlur={handleBlur('phoneNo')}
                    value={values.phoneNo}
                    error={touched.phoneNo && errors.phoneNo}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={identityCardAddressInputRef}
                    id="identity-card-address"
                    label="Alamat KTP*"
                    placeholder="Contoh: Jl. X, Blok A, No. 1"
                    filledTextColor
                    onChangeText={handleChange('address.identityCardAddress')}
                    onBlur={handleBlur('address.identityCardAddress')}
                    value={`${values.address.identityCardAddress
                      .charAt(0)
                      .toUpperCase()}${values.address.identityCardAddress.substring(
                      1,
                    )}`}
                    error={
                      touched.address?.identityCardAddress &&
                      errors.address?.identityCardAddress
                    }
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                </DismissableView>

                <Spacer
                  height={1}
                  width={Dimensions.get('window').width}
                  color="#DDD"
                />

                <DismissableView style={styles.contentContainer}>
                  <MediumText type="label-large">Domisili</MediumText>
                  <Spacer height={16} />
                  <TextInput
                    ref={currentAddressInputRef}
                    id="current-address"
                    label="Alamat*"
                    placeholder="Contoh: Jl. X, Blok A, No. 1"
                    filledTextColor
                    onChangeText={handleChange('address.currentAddress')}
                    onBlur={handleBlur('address.currentAddress')}
                    value={`${values.address.currentAddress
                      .charAt(0)
                      .toUpperCase()}${values.address.currentAddress.substring(
                      1,
                    )}`}
                    error={
                      touched.address?.currentAddress &&
                      errors.address?.currentAddress
                    }
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={cityInputRef}
                    // disabled={!values.address?.province}
                    id="city"
                    label="Kota*"
                    placeholder="Contoh: Bekasi"
                    filledTextColor
                    // showSoftInputOnFocus={false}
                    // rightIcons={{ custom: ['chevron-down'] }}
                    onChangeText={handleChange('address.city')}
                    onBlur={handleBlur('address.city')}
                    // onFocus={() => setShowCitiesDropdown(true)}
                    value={`${values.address.city
                      .charAt(0)
                      .toUpperCase()}${values.address?.city.substring(1)}`}
                    error={touched.address?.city && errors.address?.city}
                    // onPress={() => {
                    //   cityInputRef.current?.focus();
                    //   setShowCitiesDropdown(true);
                    // }}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={provinceInputRef}
                    // disabled={!values.address?.country}
                    id="province"
                    label="Provinsi*"
                    placeholder="Contoh: Jawa Barat"
                    filledTextColor
                    // showSoftInputOnFocus={false}
                    // rightIcons={{ custom: ['chevron-down'] }}
                    onChangeText={handleChange('address.province')}
                    onBlur={handleBlur('address.province')}
                    // onFocus={() => {
                    //   if (selectedCountry?.filename) {
                    //     setShowProvinceDropdown(true);
                    //   }
                    // }}
                    value={`${values.address.province
                      .charAt(0)
                      .toUpperCase()}${values.address?.province.substring(1)}`}
                    error={
                      touched.address?.province && errors.address?.province
                    }
                    // onPress={() => {
                    //   provinceInputRef.current?.focus();
                    //   if (selectedCountry?.filename) {
                    //     setShowProvinceDropdown(true);
                    //   }
                    // }}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={countryInputRef}
                    id="country"
                    label="Negara*"
                    placeholder="Contoh: Indonesia"
                    filledTextColor
                    // showSoftInputOnFocus={false}
                    // rightIcons={{ custom: ['chevron-down'] }}
                    onChangeText={handleChange('address.country')}
                    onBlur={handleBlur('address.country')}
                    // onPress={() => {
                    //   countryInputRef.current?.focus();
                    //   setShowCountriesDropdown(true);
                    // }}
                    value={`${values.address.country
                      .charAt(0)
                      .toUpperCase()}${values.address?.country.substring(1)}`}
                    error={touched.address?.country && errors.address?.country}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={zipCodeInputRef}
                    // disabled={!values.address?.city}
                    id="zipCode"
                    label="Kode Pos*"
                    placeholder="Contoh: 12345"
                    filledTextColor
                    keyboardType="number-pad"
                    // showSoftInputOnFocus={false}
                    // rightIcons={{ custom: ['chevron-down'] }}
                    onChangeText={handleChange('address.zipCode')}
                    onBlur={handleBlur('address.zipCode')}
                    // onFocus={() => setShowZipCodeDropdown(true)}
                    value={values.address.zipCode.replace(/[.|,| |-]/g, '')}
                    error={touched.address?.zipCode && errors.address?.zipCode}
                    // onPress={() => {
                    //   zipCodeInputRef.current?.focus();
                    //   setShowZipCodeDropdown(true);
                    // }}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                </DismissableView>

                <Spacer
                  height={1}
                  width={Dimensions.get('window').width}
                  color="#DDD"
                />

                <DismissableView style={styles.contentContainer}>
                  <MediumText type="label-large">Saldo</MediumText>
                  <Spacer height={16} />
                  <TextInput
                    ref={balanceInitialInputRef}
                    id="initial-balance"
                    label="Saldo Awal*"
                    placeholder="Contoh: 1000000"
                    filledTextColor
                    keyboardType="decimal-pad"
                    leftLabel="Rp"
                    onChangeText={handleChange('balance.initial')}
                    onBlur={handleBlur('balance.initial')}
                    value={
                      values.balance.initial
                        ? Number(
                            values.balance.initial.replace(/[.|,| |-]/g, ''),
                          ).toLocaleString()
                        : ''
                    }
                    error={touched.balance?.initial && errors.balance?.initial}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.end) {
                        balanceEndInputRef.current?.focus();
                      }
                    }}
                  />
                  <Spacer height={16} />
                  <TextInput
                    ref={balanceEndInputRef}
                    id="end-balance"
                    label="Saldo Akhir*"
                    placeholder="Contoh: 1000000"
                    filledTextColor
                    keyboardType="decimal-pad"
                    leftLabel="Rp"
                    onChangeText={handleChange('balance.end')}
                    onBlur={handleBlur('balance.end')}
                    value={
                      values.balance.end
                        ? Number(
                            values.balance.end.replace(/[.|,| |-]/g, ''),
                          ).toLocaleString()
                        : ''
                    }
                    error={touched.balance?.end && errors.balance?.end}
                    onSubmitEditing={() => {
                      if (!values.memberCode) {
                        memberCodeInputRef.current?.focus();
                      } else if (!values.fullName) {
                        fullNameInputRef.current?.focus();
                      } else if (!values.birthPlaceDate) {
                        birthPlaceDateInputRef.current?.focus();
                      } else if (!values.religion) {
                        religionInputRef.current?.focus();
                      } else if (!values.email) {
                        emailInputRef.current?.focus();
                      } else if (!values.status) {
                        statusInputRef.current?.focus();
                      } else if (!values.phoneNo) {
                        phoneNoInputRef.current?.focus();
                      } else if (!values.address?.identityCardAddress) {
                        identityCardAddressInputRef.current?.focus();
                      } else if (!values.address?.currentAddress) {
                        currentAddressInputRef.current?.focus();
                      } else if (!values.address?.city) {
                        cityInputRef.current?.focus();
                      } else if (!values.address?.province) {
                        provinceInputRef.current?.focus();
                      } else if (!values.address?.country) {
                        countryInputRef.current?.focus();
                      } else if (!values.address?.zipCode) {
                        zipCodeInputRef.current?.focus();
                      } else if (!values.balance?.initial) {
                        balanceInitialInputRef.current?.focus();
                      }
                    }}
                  />
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
