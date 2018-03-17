import { internalActionType } from './constants';

// tslint:disable-next-line:no-empty
export const noop = () => { };

/**
 * 是否是值数据
 *
 * @export
 * @param {any} v
 * @returns
 */
export function isPrimitive(v: any): boolean {
  return ['undefined', 'number', 'string', 'boolean']
    .indexOf(typeof v) !== -1 || v === null;
}

/**
 * 复杂数据对象平铺
 * example: flattenDataFields({a:[1], b: {c:'c', d: [{e:'e'}]}}) => {'a.[0]':1, 'b.c':'c', 'b.d.[0].e': 'e'}
 *
 * @export
 * @param {object} source
 * @param {(Number|String)[]} ns
 * @returns 平铺后的对象数据
 */
export function flattenData(value, ns = '', rtn = {}) {
  const fields = Object.keys(value);

  fields.forEach(f => {
    const _ns = Array.isArray(value) ? `.[${f}]` : `${ns ? '.' : ''}${f}`;
    rtn[ns + _ns] = value[f];
    if (isPrimitive(value[f])) {
      // rtn[ns + _ns] = value[f];
    } else if (value[f]) {
      flattenData(value[f], `${ns}${_ns}`, rtn);
    }
  });
  return rtn;
}

export const bindActions = actions => dispatch => {
  if (!actions) {
    return {};
  }
  const keys = Object.keys(actions);
  const rtn = {} as any;
  keys.forEach(type => {
    rtn[type] = (...args) => {
      dispatch({
        type,
        payload: args,
      });
    };
  });
  return rtn;
};

export const bindThunks = thunks => dispatch => {
  if (!thunks) {
    return {};
  }
  const keys = Object.keys(thunks);
  return keys.reduce((rtn, key) => {
    rtn[key] = (...args) => dispatch(thunks[key](...args));
    return rtn;
  }, {} as any);
};

export function createWatchReducer(watches = {}, extraArgs: { getLastState: Function }) {
  const fields = Object.keys(watches);
  return (state, _action) => {
    // if (true || action.type === internalActionType.stateChange || action.type === internalActionType.initState) {
    const fieldsToDel: string[] = [];
    const res = fields.reduce((_rtn, field) => {
      const lastState = extraArgs.getLastState();
      const fieldState = watches[field](state[field], lastState ? lastState[field] : lastState, state, lastState);
      if (fieldState === undefined) {
        fieldsToDel.push(field);
      }
      return { ..._rtn, [field]: fieldState };
    }, state);
    fieldsToDel.forEach(d => {
      delete res[d];
    });
    return res;
    // }
    // return state;
  };
}

export function defaultGetEventValue(e) {
  if (['undefined', 'string', 'number', 'boolean'].indexOf(typeof e) !== -1 || e === null || !e.target) {
    return e;
  }

  if (e.target.type === 'checkbox') {
    return e.target.checked;
  }
  return e.target.value;
}

export class Defer {
  promise;
  _resolve;
  _reject;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._reject = reject;
      this._resolve = resolve;
    });
  }

  resolve(...args) {
    this._resolve(...args);
  }

  reject(...args) {
    this._reject(...args);
  }
}
