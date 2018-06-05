import { FETCH_COLLECTIONS } from '../shared/constants/actionTypes';

export default (state = null, action) => {
  switch (action.type) {
    case FETCH_COLLECTIONS: {
      return action.payload;
    }
  }
  return state;
}
