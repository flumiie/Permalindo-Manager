import firestore from '@react-native-firebase/firestore';

import { GET_FUNDS, GET_FUNDS_ERROR } from '../constants';

interface GetFundsDataProps {
  onSuccess: (v: any) => void;
  onError: (v: string) => void;
}

export default (props: GetFundsDataProps) => {
  return async (dispatch: any) =>
    await firestore()
      .collection('Funds')
      .limit(10)
      .get()
      .then(querySnap => {
        if (querySnap.docs.length) {
          const data = querySnap.docs.map(doc => doc.data());
          dispatch({
            type: GET_FUNDS,
            payload: data,
          });
          props.onSuccess(data);
        } else {
          props.onSuccess([]);
        }
      })
      .catch(err => {
        dispatch({
          type: GET_FUNDS_ERROR,
          payload: err?.message,
        });
        props.onError(err?.message);
      });
};
