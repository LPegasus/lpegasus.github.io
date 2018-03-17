import asyncValidator from 'async-validator';
import { debounce } from 'lodash-es';
import { Defer } from './utils';
import { internalActionType } from './constants';

export interface IErrorWrapper {
  field: string;
  message: string[];
}

function createSchema(validators: any[] = [], checkField?) {
  const schema = {} as any;
  validators.forEach(({ fields, rules }) => {
    // const { fields, rules } = validator as any;
    if (!checkField || fields.indexOf(checkField) !== -1) {
      fields.forEach(f => {
        const _rules = schema[f] || [];
        schema[f] = [..._rules, ...rules];
      });
    }
  });
  return schema;
}

export default function createValidateSubscription(validators, local) {
  const getValidator = (checkField?) => {
    const schema = createSchema(validators, checkField);
    const keyToSkip = Object.keys(schema).filter(d => local.visibleFunc(d) === false);
    keyToSkip.forEach(key => {
      delete schema[key];
    });
    return new asyncValidator(schema);
  };

  // 状态收敛
  const localWithState: {
    errors: IErrorWrapper[];
    status: 'pending' | 'finish';
    id: number;
    defer: Defer;
  } = { errors: [], status: 'pending', id: 0, defer: new Defer() };

  // tslint:disable-next-line:variable-name
  const _run_ = debounce((fieldName?) => {
    local.store.dispatch({ type: internalActionType.validateStart });
    const id = ++localWithState.id;
    if (fieldName) {
      const partialValidator = getValidator(fieldName);

      // 关联的校验表单项名称
      let checkedFields = [fieldName];
      validators.forEach((v) => {
        const index = v.fields.indexOf(fieldName);
        if (index !== -1) {
          const fields = [...v.fields];
          fields.splice(index, 1);
          checkedFields = checkedFields.concat(fields);
        }
      });

      partialValidator.validate(local.store.getState(), (errs, _errMap) => {
        errs = errs || [];
        if (id === localWithState.id) {
          let newErrors: any[] = [];
          if (localWithState.errors.length === 0) {  // 之前没有报错状态
            newErrors = errs;
          } else {  // 之前有报错状态，进行状态merge
            localWithState.errors.forEach((error) => {
              if (checkedFields.indexOf(error.field) !== -1) {
                const nowErr = errs.filter((err) => err.field === error.field)[0];
                if (nowErr) {
                  newErrors.push(nowErr);
                }
              } else {
                newErrors.push(error);
              }
            });
          }
          localWithState.errors = newErrors;
          localWithState.defer.resolve();
          local.store.dispatch({ type: internalActionType.validateEnd });
        }
      });
    } else { // 全量效验
      getValidator().validate(local.store.getState(), (errs, _errMap) => {
        if (id === localWithState.id) {
          localWithState.errors = errs || [];
          localWithState.defer.resolve();
          local.store.dispatch({ type: internalActionType.validateEnd });
        }
      });
    }
  }, 300, { leading: true });

  const run = (fieldName?) => {
    localWithState.defer = new Defer();
    _run_(fieldName);
  };

  const getError = (...args) => {
    let callback;
    let field;
    if (args.length === 1) {
      callback = args[0];
    } else {
      field = args[0];
      callback = args[1];
    }
    localWithState.defer.promise.then(() => {
      callback(!field ? localWithState.errors
        : localWithState.errors.filter(d => d.field === field));
    });
  };

  return {
    run,
    getError,
  };
}
