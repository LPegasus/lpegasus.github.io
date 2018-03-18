import * as React from 'react';
import { connect } from 'react-redux';
import { pick } from 'lodash-es';
import {
  Drawer,
  DrawerHeader,
  DrawerContent
} from 'rmwc/Drawer';
import {
  ListItem,
  ListItemText
} from 'rmwc/List';
import BizLink from '../../common/BizLink';

const LeftMenuList = (props) => {
  return (
    <Drawer persistent open={props.leftMenuVisible}>
      <DrawerHeader>
        Blogs
      </DrawerHeader>
      <DrawerContent>
        <BizLink bizType="imgclip">
          <ListItem style={{ cursor: 'pointer' }}>
            <ListItemText>
              Image Clip
            </ListItemText>
          </ListItem>
        </BizLink>
      </DrawerContent>
    </Drawer>
  );
}

export default connect(
  state => pick(state, 'leftMenuVisible'),
  dispatch => ({ dispatch }),
)(LeftMenuList);
