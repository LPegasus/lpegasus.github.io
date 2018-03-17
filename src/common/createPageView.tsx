import * as React from 'react';
import { connect, Provider } from 'react-redux';

export default (local, View) => class PageStore extends React.Component<any, any> {
  static childContextTypes = {
    getError: () => null,
    visibleFunc: () => null,
    pageProps: () => null,
  };
  store;
  form;
  View;
  visibleCfg: { [key: string]: (state: any) => boolean }

  constructor(props, ctx) {
    super(props, ctx);
    this.View = connect(
      state => ({ ...state }),
      dispatch => ({
        ...local.dispatchActions,
        ...local.dispatchThunks,
        form: local.form,
        dispatch,
      }),
    )(View);
    this.form = local.form;
    this.store = local.store;
  }

  componentDidMount() {
    this.getForm();
  }

  getChildContext() {
    return {
      getError: local.getError,
      visibleFunc: local.visibleFunc,
      pageProps: { ...local.dispatchThunks, ...local.dispatchActions },
    };
  }

  getForm = () => {
    if (typeof this.props.getForm === 'function') {
      this.props.getForm(local.form);
    }
  }

  getError: (...args) => void = (..._args) => {
    throw new Error('getError not implimented');
  }

  render() {
    return (
      <Provider store={local.store}>
        <this.View />
      </Provider>
    );
  }
};
