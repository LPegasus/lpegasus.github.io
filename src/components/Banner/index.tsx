import * as React from 'react';
import { connect } from 'react-redux';
import {
  Toolbar,
  ToolbarRow,
  ToolbarSection,
  ToolbarTitle,
  ToolbarMenuIcon,
  ToolbarIcon
} from 'rmwc/Toolbar';
import { Button } from 'rmwc/Button';
import { getCallThunkFuncs } from '../../common/store';

const Banner = ({ toggleLeftMenu }) => (
  <Toolbar fixed>
    <ToolbarRow>
      <ToolbarSection alignStart>
        <ToolbarTitle
          style={{ color: '#fff' }}
        >
          <Button
            style={{ color: '#fff', fontSize: 'inherit' }}
            onClick={toggleLeftMenu}
          >
            <i className="fa fa-bars" />
          </Button>
        </ToolbarTitle>
        <ToolbarTitle>LPegasus Blog</ToolbarTitle>
      </ToolbarSection>
    </ToolbarRow>
  </Toolbar>
);

export default connect(s => s,
  getCallThunkFuncs(['toggleLeftMenu'])
)(Banner);
