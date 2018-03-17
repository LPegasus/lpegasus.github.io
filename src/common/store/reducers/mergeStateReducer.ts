import { internalActionType } from '../constants';

/**
 * 重置 state
 *
 * @param {any} state
 * @param {{ type: string, payload: any }} action
 * @returns
 */
export default function mergeStateReducer(state, action: { type: string, payload: any, full: boolean }) {
  if (action.type === internalActionType.merge) {
    const data = action.payload;
    const rtn: any = {};
    Object.keys(data).forEach(f => {
      rtn[f] = data[f];
    });
    if (action.full) { // 全量覆盖
      return rtn;
    } else {  // 合并覆盖
      return { ...state, ...rtn };
    }
  }
  return state;
}