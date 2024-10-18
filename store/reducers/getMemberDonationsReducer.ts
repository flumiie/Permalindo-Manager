import { GET_MEMBER_DONATIONS, GET_MEMBER_DONATIONS_ERROR } from '../constants';

const initialState = {
  data: '',
  error: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case GET_MEMBER_DONATIONS:
      return {
        data: action.payload,
        error: null,
      };

    case GET_MEMBER_DONATIONS_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};
