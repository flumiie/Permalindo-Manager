import { CREATE_MEMBER_DUE, CREATE_MEMBER_DUE_ERROR } from '../constants';

const initialState = {
  data: '',
  error: null,
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case CREATE_MEMBER_DUE:
      return {
        data: action.payload,
        error: null,
      };

    case CREATE_MEMBER_DUE_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};
