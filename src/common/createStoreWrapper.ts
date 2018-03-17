import { createStore as reduxCreateStore, applyMiddleware, AnyAction, compose } from 'redux';
import thunk from 'redux-mid-async-func';
import omit from 'omit.js';
import { internalActionType } from './constants';
import {
  bindActions, bindThunks,
  createWatchReducer, validatorRunnerMiddleware,
} from './utils';

function mergeReducer(...reducers) {
  if (reducers.length === 0) {
    return v => v;
  }
  return (state, action) => {
    return reducers.filter(r => typeof r === 'function')
      .reduce((preState, reducer) => {
        return reducer(preState, action);
      }, state);
  };
}

function validatingReducer(state, action) {
  if (action.type === internalActionType.validateStart) {
    return { ...state, validating: true };
  } else if (action.type === internalActionType.validateEnd) {
    return { ...state, validating: false };
  }
  return state;
}

function forceUpdateReducer(state, action) {
  if (action.type === internalActionType.forceUpdate) {
    return { ...state };
  }
  return state;
}

/**
 * 字段数据变更
 *
 * @param {any} state
 * @param {any} action
 * @returns
 */
function fieldChangeReducer(state, action) {
  if (action.type === internalActionType.fieldChange && action.field) {
    state[action.field] = action.payload;
    return { ...state };
  }
  return state;
}

/**
 * 重置 state
 *
 * @param {any} state
 * @param {{ type: string, payload: any }} action
 * @returns
 */
function setInitialStateReducer(state, action: { type: string, payload: any, full: boolean }) {
  if (action.type === internalActionType.initState) {
    // 第一期暂不支持 复杂数据结构，必须平铺
    // const flattenedData = flattenData(action.payload);
    const flattenedData = action.payload;
    const rtn: any = {};
    Object.keys(flattenedData).forEach(f => {
      rtn[f] = flattenedData[f];
    });
    if (action.full) { // 全量覆盖
      return rtn;
    } else {  // 合并覆盖
      return { ...state, ...rtn };
    }
  }
  return state;
}

export default function createStoreWrapper(config) {
  const local: any = {
    visibleFunc(field: string) {  // 控制 xformitem 是否渲染
      if (local.visibleCfg && typeof local.visibleCfg[field] === 'function') {
        const state = local.store.getState();
        return local.visibleCfg[field](state);
      }
      return true;
    }
  };
  // const flattenedData = flattenData(config.initialState);
  const flattenedData = config.initialState;
  const initialState: any = {};

  Object.keys(flattenedData).forEach(f => {
    initialState[f] = flattenedData[f];
  });

  local.visibleCfg = Object.keys(config.visible || {}).reduce((rtn, cur) => {
    rtn[cur] = config.visible[cur];
    const tmpFields = cur.split('&_&');
    if (tmpFields.length > 1) {
      tmpFields.forEach(d => {
        if (!rtn[d]) {
          rtn[d] = rtn[cur];
        }
      });
    }
    return rtn;
  }, {});

  local.form = {
    setInitialState(_value) {  // 重设初始状态
      throw new Error('form can\'t be used until store is created');
    },
    validateFields(_fields: string[], _options: { scroll?: boolean }) {
      throw new Error('form can\'t be used until store is created');
    },
    getState() {
      throw new Error('form can\'t be used until store is created');
    },
    getVisibleState() {
      throw new Error('form can\'t be used until store is created')
    },
  };

  /**
   * 合并页面 store 配置的 actions 成 reducer
   */
  const actions = config.actions || {};
  const customReducer = (state, action: AnyAction) => {
    const { type, payload } = action;
    const callback = actions[type];
    if (typeof callback !== 'function') {
      return state;
    }
    const nextState = callback.apply(null, [state, ...payload]);
    return nextState;
  };

  let internalStateHistory: any[] = [];

  // watches 需要知道之前的数据
  const reducerStatefulArgs = {
    getLastState() { return internalStateHistory[1]; }
  };
  const watchReducer = createWatchReducer(config.watch, reducerStatefulArgs);

  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const extraArgument = { form: local.form, actions: {}, thunks: {} };
  const validateRunner = {
    run: () => { throw new Error('cannot call validator before store\'s been created.'); },
  } as any;
  const store = reduxCreateStore(
    mergeReducer(
      // validateEndReducer,
      forceUpdateReducer,
      fieldChangeReducer,
      setInitialStateReducer,
      validatingReducer,
      customReducer,
      watchReducer,
    ),
    initialState,
    composeEnhancers(
      applyMiddleware(
        thunk.withExtraArgument(extraArgument),
        validatorRunnerMiddleware(validateRunner),
      ),
    ),
  );

  // 保存最后一次变更的 state
  store.subscribe(() => {
    internalStateHistory.unshift(store.getState());
    if (internalStateHistory.length >= 3) {
      internalStateHistory.splice(2);
    }
  });

  const validateWrapper = createValidateSubscription(config.validators, local);
  validateRunner.run = validateWrapper.run;

  local.getError = validateWrapper.getError;

  local.dispatchActions = bindActions(actions)(store.dispatch);
  local.dispatchThunks = bindThunks(config.thunks)(store.dispatch);
  extraArgument.actions = local.dispatchActions;
  extraArgument.thunks = local.dispatchThunks;

  local.form.setInitialState = (value, isFull?: boolean) => {
    store.dispatch({
      type: internalActionType.initState,
      payload: value,
      full: isFull,
    });
  };

  local.form.getLastState = reducerStatefulArgs.getLastState();

  local.form.getState = (names: string[] = []) => {
    const state = { ...store.getState() };
    return omit(state, Object.keys(state).filter(d => names.indexOf(d) !== -1));
  };

  local.form.validateFields = (...args) => {
    let cb: Function;
    let fields: string[];
    let options: any = {};
    const currentState = local.form.getVisibleState();
    if (args.length <= 1) {
      cb = args[0];
      fields = Object.keys(currentState);
    } else if (args.length === 2) {
      [fields, cb] = args;
    } else {
      [fields, options, cb] = args;
    }

    validateWrapper.run();
    store.dispatch({ type: internalActionType.forceUpdate });
    const invisibleFields = fields.filter(f => local.visibleFunc(f) === false);
    validateWrapper.getError((errList: null | Array<{ field: string; message: string; }>) => {
      let errs: any | null = [];
      if (errList) {
        errList.forEach(e => {
          if (fields.indexOf(e.field) >= 0 && invisibleFields.indexOf(e.field) === -1) {
            errs.push(e);
          }
        });
      }
      if (errs.length === 0) {
        errs = null;
      }
      if (typeof cb === 'function') {
        cb(errs, currentState);
      }
    });
  };

  local.form.getVisibleState = (names: string[] = []) => {
    const rtn = { ...local.form.getState(names) };
    Object.keys(rtn).forEach(f => {
      const _fields = f.split('&_&');
      if (!_fields.length) {
        return;
      }
      if (local.visibleFunc(f) === false) {
        _fields.forEach(d => {
          delete rtn[d];
        });
      }
    });
    return rtn;
  };

  local.store = store;
  return local;
}
