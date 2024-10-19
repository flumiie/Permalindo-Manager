import { useNetInfo } from '@react-native-community/netinfo';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StatusBar, StatusBarStyle, StyleSheet } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import store, { asyncStorage } from '../store';
import Routes from './Routes';
import { Snackbar } from './components';

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFF',
  },
};

function App(): React.JSX.Element {
  const { isConnected } = useNetInfo();

  const [networkConnected, setNetworkConnected] = useMMKVStorage(
    'networkConnected',
    asyncStorage,
    false,
  );
  const [snackbar, setSnackbar] = useMMKVStorage<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>('snackbar', asyncStorage, null);
  const [useStatusBar] = useMMKVStorage<{
    home: boolean;
    members: boolean;
    account: boolean;
  } | null>('useStatusBar', asyncStorage, null);
  const [offsets] = useMMKVStorage<{
    headerHeight: number;
    beyond: boolean;
  } | null>('offsets', asyncStorage, null);

  const [statusBar, setStatusBar] = useState<{
    backgroundColor: string;
    barStyle: StatusBarStyle;
  }>({
    backgroundColor: '#FCFCFF',
    barStyle: 'dark-content',
  });

  useEffect(() => {
    setTimeout(() => {
      RNBootSplash.hide({ fade: true });
    }, 1500);
  }, []);

  useEffect(() => {
    setNetworkConnected(!!isConnected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (networkConnected) {
      setSnackbar({
        show: true,
        type: 'success',
        message: 'Berhasil terhubung ke internet',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConnected]);

  useEffect(() => {
    if (useStatusBar?.home) {
      setStatusBar({
        backgroundColor: offsets?.beyond ? '#FFF' : '#BF2229',
        barStyle: offsets?.beyond ? 'dark-content' : 'light-content',
      });
    }
    if (useStatusBar?.members || useStatusBar?.account) {
      setStatusBar({
        backgroundColor: '#FCFCFF',
        barStyle: 'dark-content',
      });
    }
  }, [useStatusBar, offsets]);

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={statusBar.backgroundColor}
        barStyle={statusBar.barStyle}
      />
      <NavigationContainer theme={Theme}>
        <Provider store={store}>
          <GestureHandlerRootView style={styles.flex}>
            <Routes />
          </GestureHandlerRootView>
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default App;
