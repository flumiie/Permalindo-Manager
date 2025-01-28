import firestore from '@react-native-firebase/firestore';

import { MasterDataType } from '../../src/libs/dataTypes';
import { GET_FUND, GET_FUND_ERROR } from '../constants';

interface GetFundDataProps {
  id: string;
  onSuccess: (v: MasterDataType) => void;
  onError: (v: string) => void;
}

export default (props: GetFundDataProps) => {
  return async (dispatch: any) =>
    await firestore()
      .collection('Funds')
      .where('id', '==', props.id)
      .get()
      .then(querySnap => {
        const data = querySnap.docs.map(doc => doc.data());

        dispatch({
          type: GET_FUND,
          payload: data,
        });

        return props.onSuccess(data?.[0]);
      })
      .catch(err => {
        dispatch({
          type: GET_FUND_ERROR,
          payload: err?.message,
        });
        return props.onError(err?.message);
      });
};
