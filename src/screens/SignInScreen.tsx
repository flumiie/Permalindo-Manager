import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from 'react-native';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';

import { asyncStorage } from '../../store';
import { getAuth } from '../../store/actions';
import { useAppDispatch } from '../../store/hooks';
import { AuthStackParamList } from '../Routes';
import {
  Button,
  DismissableView,
  MediumText,
  RegularText,
  Spacer,
  TextInput,
} from '../components';

export default () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const [_, setSnackbar] = useMMKVStorage<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>('snackbar', asyncStorage, null);
  const [__, setCredentials] = useMMKVStorage<{
    token: string;
    name: string;
    email: string;
    photo: string;
  } | null>('credentials', asyncStorage, null);

  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const [passwordInvisible, setPasswordInvisible] = useState(true);

  const ValidationSchema = Yup.object().shape({
    email: Yup.string().email('Format email salah').required('Harus diisi'),
    password: Yup.string().required('Harus diisi'),
  });

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setCredentials({
        token: userInfo.idToken ?? '',
        name: userInfo.user.name ?? '',
        email: userInfo.user.email ?? '',
        photo: userInfo.user.photo ?? '',
      });
    } catch (error) {
      setSnackbar({
        show: true,
        type: 'error',
        message: 'Ada kesalahan. Mohon coba sesaat lagi',
      });
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validateOnBlur
      validateOnChange
      validationSchema={ValidationSchema}
      onSubmit={values => {
        dispatch(
          getAuth({
            email: values.email,
            password: values.password,
            onSuccess: v => {
              v.user.getIdTokenResult().then(S => {
                setSnackbar({
                  show: true,
                  type: 'success',
                  message: 'Login berhasil',
                });
                setCredentials({
                  token: S.token ?? '',
                  name: v.user.displayName ?? '',
                  email: v.user.email ?? '',
                  photo: v.user.photoURL ?? '',
                });
              });
            },
            onError: v => {
              if (
                v.code === 'auth/invalid-email' ||
                v.code === 'auth/invalid-credential'
              ) {
                setSnackbar({
                  show: true,
                  type: 'error',
                  message: 'Email atau password salah',
                });
              }
            },
          }),
        );
      }}>
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => (
        <DismissableView
          style={{
            paddingTop: 72 + insets.top,
            ...styles.container,
          }}>
          <MediumText size={28} color="#BF2229" style={styles.title}>
            Login
          </MediumText>
          <Spacer height={40} />
          <TextInput
            ref={emailInputRef}
            id="email"
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            onSubmitEditing={() => {
              if (!values.password) {
                passwordInputRef.current?.focus();
              }
              emailInputRef.current?.blur();
            }}
            value={values.email}
            error={touched.email && errors.email}
          />
          <Spacer height={16} />
          <TextInput
            ref={passwordInputRef}
            id="password"
            placeholder="Password"
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            onSubmitEditing={() => {
              if (!values.email) {
                emailInputRef.current?.focus();
              }
              passwordInputRef.current?.blur();
            }}
            secureTextEntry={passwordInvisible}
            rightIcons={{
              password: passwordInvisible ? 'eye-off' : 'eye',
            }}
            showPassword={() => {
              setPasswordInvisible(!passwordInvisible);
            }}
            value={values.password}
            error={touched.password && errors.password}
          />
          <Spacer height={32} />
          <Button
            type="primary"
            disabled={
              !values.email ||
              !!errors.email ||
              !values.password ||
              !!errors.password
            }
            onPress={handleSubmit}>
            Login
          </Button>
          <Spacer height={16} />
          <View style={styles.row}>
            <RegularText>Lupa password? </RegularText>
            <Pressable
              onPress={() => {
                navigation.navigate('ResetPassword');
              }}>
              <RegularText color="#BF2229">Reset password disini</RegularText>
            </Pressable>
          </View>
          <Spacer height={16} />
          <View style={styles.row}>
            <RegularText>Belum ada akun? </RegularText>
            <Pressable
              onPress={() => {
                navigation.navigate('SignUp');
              }}>
              <RegularText color="#BF2229">Registrasi disini</RegularText>
            </Pressable>
          </View>
          <Spacer height={16} />
          <Spacer
            height={1}
            width={Dimensions.get('window').width - 40}
            color="#DDD"
          />
          <Spacer height={16} />
          <View style={styles.row}>
            <RegularText color="#BBB">Atau login dengan ...</RegularText>
          </View>
          <Spacer height={16} />
          <Button
            type="primary"
            disabled
            // backgroundColor="#ea4335"
            onPress={handleGoogleSignIn}>
            <View style={styles.row}>
              <IoniconsIcon name="logo-google" size={18} color="#FFF" />
              <Spacer width={8} />
              <MediumText type="label-large" color="#FFF">
                Google
              </MediumText>
            </View>
          </Button>
        </DismissableView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  column: {
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  tosCheck: {
    flexDirection: 'row',
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    alignSelf: 'center',
    padding: 4,
  },
});
