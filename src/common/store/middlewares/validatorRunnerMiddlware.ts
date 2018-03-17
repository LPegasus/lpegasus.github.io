import { internalActionType } from '../constants';
/**
 * middleware to run validator
 *
 * @export
 * @param {{ run: Function }} validatorRunner
 * @returns
 */
export default function validatorRunnerMiddleware(validatorRunner: { run: Function }) {
  return () => next => action => {
    const nextAction = next(action);
    if (action.type === internalActionType.stateChange || action.type === internalActionType.merge) {
      validatorRunner.run(action.field);
    }
    return nextAction;
  };
}
