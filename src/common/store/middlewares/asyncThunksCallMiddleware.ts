import { internalActionType } from '../constants';

/**
 * 提供直接调用 thunks 的 action
 *
 * @export
 * @param {*} asyncThunks 
 * @returns 
 */
export default function asyncThunksCallMiddleware(asyncThunks: any) {
  return () => next => action => {
    if (action.type === internalActionType.call && action.name in asyncThunks) {
      return next(asyncThunks[action.name](...(action.args || [])));
    }
    return next(action);
  };
}
