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
  console.log(props);
  return (
    <Drawer persistent open={props.leftMenuVisible}>
      <DrawerHeader>
        Blogs
      </DrawerHeader>
      <DrawerContent>
        <ListItem>
          <ListItemText>
            <BizLink bizType="imgclip">
              Image Clip
            </BizLink>
          </ListItemText>
        </ListItem>
      </DrawerContent>
    </Drawer>
  );
}

export default connect(
  state => pick(state, 'leftMenuVisible'),
)(LeftMenuList);
