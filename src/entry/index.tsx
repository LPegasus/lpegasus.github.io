import '../common';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import storeDecorator, { Model } from '../common/store';
import createHistory from 'history/createHashHistory';
import App from '../components/App';

class IndexModel extends Model {
  state = {
    leftMenuVisible: true,
  }

  async toggleLeftMenu() {
    this.merge({
      leftMenuVisible: !this.state.leftMenuVisible,
    });
  }
}

@storeDecorator(IndexModel, createHistory())
class Index extends React.Component<any, any> {
  render() {
    window._t_ = this;
    return (
      <App />
    );
  }
}

ReactDOM.render(<Index />, document.querySelector('#root'));
