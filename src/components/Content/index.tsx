import * as React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import ImageClipDemo from '../ImageClip';

class Content extends React.Component<any, any> {
  render() {
   return (
      <div className="content">
        <Route path={`/imgclip`} exact component={ImageClipDemo} />
      </div>
    )
  }
}

export default connect()(Content);
