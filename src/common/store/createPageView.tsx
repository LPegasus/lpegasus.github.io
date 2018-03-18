import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

const noop = () => null;

export default (storeWrapper, View, context = {}, history?) => {
  const childContextTypes = Object.keys(context).reduce((rtn, c) => Object.assign(rtn, { [c]: noop }), {});

  return class PageStore extends React.Component<any, any> {
    static childContextTypes = childContextTypes;
    store;
    form;
    View;
    visibleCfg: { [key: string]: (state: any) => boolean }

    constructor(props, ctx) {
      super(props, ctx);
      this.View = connect(
        state => ({ ...state }),
        dispatch => ({
          ...storeWrapper.dispatchActions,
          ...storeWrapper.dispatchThunks,
          form: storeWrapper.form,
          dispatch,
          ...storeWrapper.dispatchActions,
          ...storeWrapper.dispatchThunks,
        }),
      )(View);
      this.form = storeWrapper.form;
      this.store = storeWrapper.store;
    }

    componentDidMount() {
      this.getForm();
    }

    getChildContext() {
      return context;
    }

    getForm = () => {
      if (typeof this.props.getForm === 'function') {
        this.props.getForm(storeWrapper.form);
      }
    }

    render() {
      return (
        <Provider store={storeWrapper.store}>
          {storeWrapper.history
            ? <ConnectedRouter history={storeWrapper.history} store={storeWrapper.store}><this.View /></ConnectedRouter>
            : <this.View />
          }
        </Provider>
      );
    }
  };
}
