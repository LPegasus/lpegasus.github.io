import 'material-components-web/dist/material-components-web.min.css';
import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Frame from './Frame';

const Root = () => (
  <Router>
    <Route path="/:bizType?" component={Frame} />
  </Router>
);

export default Root;
