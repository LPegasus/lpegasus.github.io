import * as React from 'react';
import createStoreWrapper from "./createStoreWrapper";
import { internalActionType } from "./constants";
import createPageView from "./createPageView";

export class Model {
  merge: (partialState: any) => Promise<any>;
  state: any;
  watch: { [key: string]: (cur, prev, curState, prevState) => any };
  validators: Array<{ fields: string[]; rules: any }>;
}

const storeDecorator = <T extends Function>(Klass) =>
  (View: T) => {
    const cls: Model = new Klass();
    const thunks = Reflect.ownKeys(Object.getPrototypeOf(cls))
      .filter(d => d !== 'constructor' && typeof cls[d] === 'function')
      .reduce((rtn, key) => {
        rtn[key] = (...args) => cls[key].bind(cls, ...args);
        return rtn;
      }, {} as any);

    const storeWrapper = createStoreWrapper({
      initialState: cls.state || {},
      watch: cls.watch,
      validators: cls.validators,
      thunks,
    });

    Object.defineProperties(cls, {
      state: {
        get() {
          return storeWrapper.store.getState();
        },
      },
      merge: {
        get() {
          return (partialState: any) => {
            return storeWrapper.store.dispatch({ type: internalActionType.merge, payload: partialState });
          }
        }
      }
    });

    return createPageView(storeWrapper, View,
      {
        getError: storeWrapper.getError,
        visibleFunc: storeWrapper.visibleFunc,
      }
    );
  }

/**
 * connect 的 mapDispatchToProps 中用来生成调用 Model 中定义的 async 成员函数的工具方法
 * 
 * @export
 * @param {any} dispatch 
 * @param {'string'} name 
 * @returns 
 */
export function getCallThunkFuncs(names: string[]) {
  return dispatch => {
    const rtn: { [key: string]: Function } = {};
    names.forEach(name => {
      rtn[name] = (...args: any[]) => {
        dispatch({
          name,
          type: internalActionType.call,
          args,
        });
      }
    });
    return rtn;
  }
}
export default storeDecorator;