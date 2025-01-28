import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { RefreshControl } from 'react-native';
import { useMMKVStorage } from 'react-native-mmkv-storage';

import { asyncStorage } from '../../../store';
import { getFunds } from '../../../store/actions';
import { useAppDispatch } from '../../../store/hooks';
import { RootStackParamList } from '../../Routes';
import {
  DropdownConfirm,
  DropdownNavigator,
  Empty,
  FloatingActionButton,
  ItemList,
  NavigationHeader,
  NavigationHeaderProps,
  RegularText,
  Spacer,
} from '../../components';
import { FundsDataType } from '../../libs/dataTypes';

const FundsItemList = (props: { item: any; onPress: () => void }) => {
  return (
    <ItemList
      id={props.item.id}
      date={props.item.date}
      title={props.item.itemName}
      sub={{
        subtitle: `Rp ${Number(
          props.item.itemPrice.replace(/[.|,| |-]/g, ''),
        ).toLocaleString()}`,
        desc: `${props.item.fundType}: ${props.item.itemUnit} Unit`,
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
  const [funds, setFunds] = useMMKVStorage<FundsDataType[]>(
    'funds',
    asyncStorage,
  );
  const [_, setSearchMode] = useMMKVStorage('searchMode', asyncStorage, false);
  const [refreshList, setRefreshList] = useMMKVStorage<boolean | null>(
    'refreshList',
    asyncStorage,
    null,
  );

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState<{
    open: boolean | null;
    id: string | null;
    date: string | null;
    itemName: string | null;
    fundType: string | null;
    itemUnit: number | null;
    itemPrice: string | null;
  }>({
    open: null,
    id: null,
    date: null,
    itemName: null,
    fundType: null,
    itemUnit: null,
    itemPrice: null,
  });
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

  const filteredData = useMemo(() => {
    let tempData: FundsDataType[] = funds;

    if (search) {
      let processedSearch = search
        .replace(/^;$/g, '; ')
        .replace(/; /g, '†')
        .toLowerCase();
      tempData = tempData.filter(
        S =>
          S.itemName.toLowerCase().includes(processedSearch) ||
          S.fundType.toLowerCase().includes(processedSearch) ||
          S.itemUnit.toString().includes(processedSearch) ||
          S.itemPrice.toLowerCase().includes(processedSearch),
      );
    }

    return tempData;
  }, [funds, search]);

  const fetchData = () => {
    setLoading(true);

    dispatch(
      getFunds({
        onSuccess: v => {
          setFunds(v);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }),
    );
  };

  const onSelectNavigator = ({
    v,
    data,
  }: {
    v: string;
    data: typeof showDropdown;
  }) => {
    if (v === 'Edit Data Kas') {
      return navigation.navigate('EditFundData', {
        id: data.id ?? '',
        date: data.date ?? '',
        itemName: data.itemName ?? '',
        fundType: data.fundType ?? '',
        itemUnit: data.itemUnit ?? 0,
        itemPrice: data.itemPrice ?? '',
      });
    }
    if (v === 'Hapus') {
      return setShowDeleteDropdown(true);
    }

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

  return (
    <>
      <DropdownNavigator
        open={!!showDropdown.open}
        title={showDropdown.itemName ?? ''}
        options={[
          { type: 'primary', label: 'Edit Data Kas' },
          { type: 'secondary', label: 'Hapus' },
        ]}
        onSelect={v => onSelectNavigator({ v, data: showDropdown })}
        onClose={() => {
          setShowDropdown({
            ...showDropdown,
            open: false,
          });
        }}
      />
      <DropdownConfirm
        open={showDeleteDropdown}
        title="Hapus Data Kas"
        content={
          <RegularText>
            Yakin hapus {showDropdown.itemName} dari kas?
          </RegularText>
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
                .collection('Funds')
                .where('itemName', '==', showDropdown.itemName ?? '')
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
        keyExtractor={item => item.itemName}
        ListEmptyComponent={
          <>
            <Spacer height={24} />
            <Empty />
          </>
        }
        renderItem={({ item }) => (
          <FundsItemList
            item={item}
            onPress={() => {
              setSearchMode(false);
              setShowDropdown({
                open: true,
                id: item.id ?? '',
                date: item.date ?? '',
                itemName: item.itemName,
                fundType: item.fundType,
                itemUnit: item.itemUnit,
                itemPrice: item.itemPrice,
              });
            }}
          />
        )}
      />
      <FloatingActionButton
        icon="plus"
        onPress={() => {
          navigation.navigate('NewFundData');
        }}
      />
    </>
  );
};
