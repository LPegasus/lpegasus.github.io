import { internalActionType } from '../constants';

/**
 * 字段数据变更
 *
 * @param {any} state
 * @param {any} action
 * @returns
 */
export default function stateChangeReducer(state, action) {
  if (action.type === internalActionType.stateChange && action.field) {
    state[action.field] = action.payload;
    return { ...state };
  }
  return state;
}