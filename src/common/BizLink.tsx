import * as React from 'react'
import { NavLink } from 'react-router-dom'
​
const BizLink = ({ bizType, children }) => (
  <NavLink
    to={bizType === 'root' ? '/' : `/${ bizType }`}
    activeStyle={ {
      textDecoration: 'none',
      color: 'black'
    }}
  >
    {children}
  </NavLink>
)
​
export default BizLink;