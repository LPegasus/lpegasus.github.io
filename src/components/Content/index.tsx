import * as React from 'react';
import { connect } from 'react-redux';

class Content extends React.Component<any, any> {
  render() {
    return (
      <div className="content">
        <h1>666</h1>
      </div>
    )
  }
}

export default connect()(Content);
