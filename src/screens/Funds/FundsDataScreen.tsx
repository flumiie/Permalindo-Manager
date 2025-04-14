import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar, View } from 'react-native';
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
  MediumText,
  NavigationHeader,
  NavigationHeaderProps,
  RegularText,
  Spacer,
} from '../../components';
import { FundsDataType } from '../../libs/dataTypes';
import { decimalize } from '../../libs/functions';

const Header = (props: { amount: number }) => {
  return (
    <View
      style={{ display: 'flex', paddingVertical: 12, paddingHorizontal: 16 }}>
      <MediumText>
        Total:{' '}
        {decimalize(props.amount).includes('-')
          ? `-Rp${decimalize(props.amount).slice(1)}`
          : `Rp${decimalize(props.amount)}`}
      </MediumText>
    </View>
  );
};

const FundsItemList = (props: { item: any; onPress: () => void }) => {
  return (
    <ItemList
      id={props.item.id}
      date={props.item.date}
      title={props.item.memberName ?? ''}
      sub={{
        subtitle: `${
          props.item?.fundType === 'Pengeluaran' ? '-' : ''
        }Rp${Number(
          props.item?.itemFundAmount?.replace?.(/[.|,| |-]/g, ''),
        ).toLocaleString()}`,
        desc: `${props.item?.fundType}: ${props.item?.memberCode}`,
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
    memberName: string | null;
    fundType: string | null;
    memberCode: string | null;
    itemFundAmount: string | null;
  }>({
    open: null,
    id: null,
    date: null,
    memberName: null,
    fundType: null,
    memberCode: null,
    itemFundAmount: null,
  });
  const [showDeleteDropdown, setShowDeleteDropdown] = useState({
    id: '',
    show: false,
  });

  const filteredData = useMemo(() => {
    let tempData: FundsDataType[] = funds;

    if (search) {
      let processedSearch = search
        ?.replace?.(/^;$/g, '; ')
        ?.replace?.(/; /g, '†')
        ?.toLowerCase();
      tempData = tempData?.filter(
        S =>
          S.memberName?.toLowerCase().includes(processedSearch) ||
          S.fundType?.toLowerCase().includes(processedSearch) ||
          S.memberCode?.toLowerCase().includes(processedSearch) ||
          S.itemFundAmount?.toLowerCase().includes(processedSearch),
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
        memberName: data.memberName ?? '',
        fundType: data.fundType ?? '',
        memberCode: data.memberCode ?? '',
        itemFundAmount: data.itemFundAmount ?? '',
      });
    }
    if (v === 'Hapus') {
      return setShowDeleteDropdown({ id: data.id ?? '', show: true });
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
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFF" />
      <DropdownNavigator
        open={!!showDropdown.open}
        title={showDropdown.memberName ?? ''}
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
        open={showDeleteDropdown.show}
        title="Hapus Data Kas"
        content={
          <RegularText>
            Yakin hapus {showDropdown.memberName} dari kas?
          </RegularText>
        }
        actions={{
          left: {
            label: 'Batal',
            onPress: () => {
              setShowDeleteDropdown({ id: '', show: false });
              setShowDropdown({ ...showDropdown, open: true });
            },
          },
          right: {
            label: 'Hapus',
            onPress: () => {
              firestore()
                .collection('Funds')
                .where('id', '==', showDropdown.id ?? '')
                .get()
                .then(querySnap => {
                  if (querySnap.docs.length) {
                    firestore()
                      .collection('Funds')
                      .doc(querySnap.docs[0].id)
                      .delete();
                    setRefreshList(true);
                  }
                });
              setShowDeleteDropdown({ id: '', show: false });
            },
          },
        }}
        onClose={() => {
          setShowDeleteDropdown({ id: '', show: false });
          setShowDropdown({ ...showDropdown, open: true });
        }}
      />
      <FlatList
        data={filteredData}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <>
            <Spacer height={24} />
            <Empty />
          </>
        }
        ListHeaderComponent={
          filteredData?.length
            ? () => {
                let amount = 0;
                filteredData?.forEach(S => {
                  if (S?.fundType === 'Pemasukkan') {
                    amount += Number(S?.itemFundAmount ?? '0');
                  } else if (S?.fundType === 'Pengeluaran') {
                    amount -= Number(S?.itemFundAmount ?? '0');
                  }
                });
                return <Header amount={amount} />;
              }
            : null
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
                memberName: item.memberName ?? '',
                fundType: item.fundType ?? '',
                memberCode: item.memberCode ?? '',
                itemFundAmount: item.itemFundAmount ?? '',
              });
            }}
          />
        )}
      />
      <FloatingActionButton
        icon="plus"
        onPress={() => navigation.navigate('NewFundData')}
      />
    </>
  );
};
