import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { push, reload } from 'react-router-redux';
import { connect } from 'react-redux';

const BizLink = ({ bizType, children, location, dispatch }) => {
  return (
    <a
      onClick={e => {
        e.preventDefault();
        if (location.pathname !== `/${bizType}`) {
          dispatch(push(`/${bizType}`));
        }
      }}
      style={{
        textDecoration: 'none',
        color: location.pathname.indexOf(`/${bizType}`) !== 0 ? '#6200ee' : 'black',
      }}
    >
      {children}
    </a>
  );
}

export default connect(
  state => ({ location: state.location }),
  dispatch => ({ dispatch }),
)(BizLink);