import * as React from 'react';
import { connect } from 'react-redux';
import Banner from './Banner';
import LeftMenuList from './LeftMenuList';
import Content from './Content';
import './frame.less';

class Frame extends React.Component<any, any> {
  render() {
    console.log(this.props.match);
    return (
      <React.Fragment>
        <Banner />
        <div style={{ display: 'flex' }}>
          <LeftMenuList />
          <Content />
        </div>
        <footer className="footer">footer</footer>
      </React.Fragment>
    );
  }
}

export default connect()(Frame);
