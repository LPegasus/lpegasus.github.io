import { internalActionType } from '../constants';

export default function forceUpdateReducer(state, action) {
  if (action.type === internalActionType.forceUpdate) {
    return { ...state };
  }
  return state;
}