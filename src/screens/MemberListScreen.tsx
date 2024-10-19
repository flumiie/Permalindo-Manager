import firestore from '@react-native-firebase/firestore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { RefreshControl } from 'react-native';
import { useMMKVStorage } from 'react-native-mmkv-storage';

import { asyncStorage } from '../../store';
import { getMemberList } from '../../store/actions';
import { useAppDispatch } from '../../store/hooks';
import { RootStackParamList } from '../Routes';
import {
  DropdownConfirm,
  DropdownNavigator,
  Empty,
  ItemList,
  NavigationHeader,
  NavigationHeaderProps,
  RegularText,
  Spacer,
} from '../components';
import { MasterDataType } from '../libs/dataTypes';

const ReportListItem = (props: { item: any; onPress: () => void }) => {
  return (
    <ItemList
      id={props.item.memberCode}
      leftImage={require('../../assets/images/avatar.png')}
      title={props.item.fullName}
      sub={{
        subtitle: props.item.email,
        desc: props.item.memberCode,
        balance: 0,
      }}
      onPress={props.onPress}
    />
  );
};

export default () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [credentials] = useMMKVStorage<{
    token: string;
  }>('credentials', asyncStorage, {
    token: '',
  });
  const [personels, setPersonels] = useMMKVStorage<MasterDataType[]>(
    'personels',
    asyncStorage,
    [],
  );
  const [_, setSearchMode] = useMMKVStorage('searchMode', asyncStorage, false);
  const [__, setUseStatusBar] = useMMKVStorage<{
    home: boolean;
    members: boolean;
    account: boolean;
  } | null>('useStatusBar', asyncStorage, null);
  const [refreshList, setRefreshList] = useMMKVStorage<boolean | null>(
    'refreshList',
    asyncStorage,
    null,
  );

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState<{
    open: boolean | null;
    memberCode: string | null;
    fullName: string | null;
  }>({
    open: null,
    memberCode: null,
    fullName: null,
  });
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

  const filteredData = useMemo(() => {
    let tempData: MasterDataType[] = personels;

    if (search) {
      let processedSearch = search
        .replace(/^;$/g, '; ')
        .replace(/; /g, '†')
        .toLowerCase();
      tempData = tempData.filter(
        S =>
          S.memberCode.toLowerCase().includes(processedSearch) ||
          S.fullName.toLowerCase().includes(processedSearch) ||
          S.email?.toLowerCase().includes(processedSearch) ||
          S.phoneNo.toLowerCase().includes(processedSearch),
      );
    }

    return tempData;
  }, [personels, search]);

  const fetchData = () => {
    setLoading(true);

    dispatch(
      getMemberList({
        onSuccess: v => {
          setPersonels(v);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }),
    );
  };

  const onSelectNavigator = (
    v: string,
    data: {
      memberCode: string | null;
      fullName: string | null;
    },
  ) => {
    if (v === 'Edit Master Data') {
      return navigation.navigate('EditMasterData', {
        memberCode: data.memberCode ?? '',
      });
    }
    if (v === 'Hapus') {
      return setShowDeleteDropdown(true);
    }
    // if (v === 'Iuran Anggota') {
    //   return navigation.navigate('MemberDues', {
    //     memberCode: data.memberCode ?? '',
    //     fullName: data.fullName ?? '',
    //   });
    // }

    return null;
  };

  useEffect(() => {
    navigation.setOptions({
      header: (props: NavigationHeaderProps) => (
        <NavigationHeader {...props} useSearch search={setSearch} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (credentials?.token) {
      fetchData();
    }
  }, [credentials?.token]);

  useEffect(() => {
    if (refreshList) {
      fetchData();
      asyncStorage.removeItem('refreshList');
    }
  }, [refreshList]);

  useFocusEffect(
    useCallback(() => {
      setUseStatusBar({
        home: false,
        members: true,
        account: false,
      });
    }, []),
  );

  return (
    <>
      <DropdownNavigator
        open={!!showDropdown.open}
        title={showDropdown.fullName ?? ''}
        options={[
          { type: 'primary', label: 'Edit Master Data' },
          { type: 'secondary', label: 'Hapus' },
          { type: 'disabled', label: 'Iuran Anggota' },
        ]}
        onSelect={v => onSelectNavigator(v, showDropdown)}
        onClose={() => {
          setShowDropdown({
            ...showDropdown,
            open: false,
          });
        }}
      />
      <DropdownConfirm
        open={showDeleteDropdown}
        title="Hapus Master Data"
        content={
          <RegularText>Yakin hapus data {showDropdown.fullName}?</RegularText>
        }
        actions={{
          left: {
            label: 'Batal',
            onPress: () => {
              setShowDeleteDropdown(false);
              setShowDropdown({ ...showDropdown, open: true });
            },
          },
          right: {
            label: 'Hapus',
            onPress: () => {
              firestore()
                .collection('Personels')
                .where('memberCode', '==', showDropdown.memberCode ?? '')
                .get()
                .then(querySnap => {
                  querySnap.forEach(doc => doc.ref.delete());
                  setRefreshList(true);
                });
              setShowDeleteDropdown(false);
            },
          },
        }}
        onClose={() => {
          setShowDeleteDropdown(false);
          setShowDropdown({ ...showDropdown, open: true });
        }}
      />
      <FlatList
        data={filteredData}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        keyExtractor={item => item.memberCode}
        ListEmptyComponent={
          <>
            <Spacer height={24} />
            <Empty />
          </>
        }
        renderItem={({ item }) => (
          <ReportListItem
            item={item}
            onPress={() => {
              setSearchMode(false);
              setShowDropdown({
                open: true,
                memberCode: item.memberCode,
                fullName: item.fullName,
              });
            }}
          />
        )}
      />
    </>
  );
};
