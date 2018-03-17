import { internalActionType } from '../constants';

export default function validatingReducer(state, action) {
  if (action.type === internalActionType.validateStart) {
    return { ...state, validating: true };
  } else if (action.type === internalActionType.validateEnd) {
    return { ...state, validating: false };
  }
  return state;
}
