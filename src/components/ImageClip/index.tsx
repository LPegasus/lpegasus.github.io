import * as React from 'react';
import ImageClip from 'react-imgclip';
import 'react-imgclip/style/index.css';
import { Grid, GridCell } from 'rmwc/Grid';
import { Select } from 'rmwc/Select';
import { Checkbox } from 'rmwc/Checkbox';
import { Switch } from 'rmwc/Switch';
import { FormField } from 'rmwc/FormField';
import { Card, CardPrimaryAction, CardMedia } from 'rmwc/Card';
import { Typography } from 'rmwc/Typography';
import { Button } from 'rmwc/Button';
import Trigger from 'rc-trigger';
import {
  Dialog,
  DefaultDialogTemplate,
  DialogSurface,
  DialogHeader,
  DialogHeaderTitle,
  DialogBody,
  DialogFooter,
  DialogFooterButton,
  DialogBackdrop
} from 'rmwc/Dialog';
import 'rc-trigger/assets/index.css';

export default class ImageClipDemo extends React.Component<any, any> {
  getDataUrl: () => Promise<string>;
  state = {
    ratio: "1",
    posInfo: {} as any,
    canOverClip: false,
    base64: null,
    fixLeftTop: false,
    ownImage: false,
    previewOn: false,
    src: 'https://lpeva.site/images/miaowu.jpg',
  };

  handleChange = info => {
    this.setState(s => {
      s.posInfo = info;
      if (s.fixLeftTop) {
        s.posInfo = { ...s.posInfo, x: 0, y: 0 };
      }
      return s;
    });
  };

  handleOverClip = e => {
    this.setState({
      canOverClip: e.target.checked,
    });
  }

  handleSelect = e => {
    this.setState({
      ratio: e.target.value === '0' ? undefined : e.target.value,
    });
  };

  handlefixLeftTop = e => {
    const checked = e.target.checked;
    this.setState(s => {
      if (checked) {
        s.posInfo = { ...s.posInfo, x: 0, y: 0 };
        s.fixLeftTop = true;
      } else {
        s.fixLeftTop = false;
      }
      return s;
    });
  };

  uploadClick = () => {
    (document.querySelector('#upload') as HTMLInputElement).click();
  }

  upload = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadedUrl = URL.createObjectURL(file);
      this.setState({
        src: uploadedUrl,
        ownImage: true,
      });
    }
  }

  getClipImage = () => {
    this.getDataUrl().then(dataUrl => {
      this.setState({
        base64: dataUrl,
        previewOn: true,
      });
    });
  }

  getDataURLDelegator = (getDataUrl) => {
    this.getDataUrl = getDataUrl;
  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Grid style={{ width: '100%' }}>
          <GridCell span={3}>
            <Select
              onChange={this.handleSelect}
              value={this.state.ratio}
              label="width : height"
              options={[{
                label: '不限制',
                value: '0',
              }, {
                label: '1 : 2',
                value: '0.5',
              }, {
                label: '1 : 1',
                value: '1',
              }, {
                label: '4 : 3',
                value: '4 / 3',
              }, {
                label: '16 : 9',
                value: '16 / 9',
              }, {
                label: '7 : 3',
                value: '21 / 9',
              }]}
            />
          </GridCell>
          <GridCell span={3}>
            <Switch
              checked={this.state.fixLeftTop}
              onChange={this.handlefixLeftTop}
            >
              Fix Clip Viewport at (0, 0)
            </Switch>
          </GridCell>
          <GridCell span={3}>
            <Checkbox
              title="sometime you want ensure the hole pic is contained by the clip viewport"
              checked={this.state.canOverClip}
              onChange={this.handleOverClip}
            >
              can over clip
            </Checkbox>
          </GridCell>
          <GridCell span={3}>
            <input onChange={this.upload} type="file" id="upload" accept="image/*" style={{ display: 'none' }} />
            <Trigger
              popup={(
                <Typography
                  style={{ padding: '4px 6px', borderRadius: '4px' }}
                  tag="div"
                  use="caption"
                  theme="primary-bg text-primary-on-secondary"
                >
                  Use your own image and get base64 clipped image.
                </Typography>
              )}
              action={['hover']}
              popupAlign={{
                points: ['tc', 'bc'],
                offset: [0, 3]
              }}
            >
              <Button onClick={this.uploadClick}>Upload</Button>
            </Trigger>
          </GridCell>
          {this.state.ownImage && (
            <GridCell span={3}>
              <Button onClick={this.getClipImage}>Get Image Base64</Button>
            </GridCell>
          )}
        </Grid>
        <Card>
          <CardPrimaryAction>
            <div style={{ width: 800, marginTop: 40 }}>
              <ImageClip
                x={this.state.posInfo.x}
                y={this.state.posInfo.y}
                width={this.state.posInfo.width}
                height={this.state.posInfo.height}
                src={this.state.src}
                canOverClip={this.state.canOverClip}
                onChange={this.handleChange}
                getDataURLDelegator={this.getDataURLDelegator}
                ratio={this.state.ratio ? eval(this.state.ratio) : undefined}
              />
            </div>
            <div style={{ padding: '1rem' }}>
              <Typography use="title" tag="h2">ClipInfo</Typography>
              <Typography
                use="body1"
                tag="pre"
                adjustMargin
                theme="text-secondary-on-background"
              >
                {JSON.stringify(this.state.posInfo, null, 2)}
              </Typography>
            </div>
          </CardPrimaryAction>
        </Card>
        {this.state.ownImage && (
          <Dialog
            open={this.state.previewOn}
            onClose={() => { this.setState({ previewOn: false }); }}
          >
            <DialogSurface>
              <DialogHeader>
                <DialogHeaderTitle>Preview Clipped Image</DialogHeaderTitle>
              </DialogHeader>
              <DialogBody>
                <img style={{ maxHeight: 800, maxWidth: 800 }} src={this.state.base64} />
              </DialogBody>
              <DialogFooter>
                <DialogFooterButton accept>Sweet!</DialogFooterButton>
              </DialogFooter>
            </DialogSurface>
            <DialogBackdrop />
          </Dialog>
        )}
      </div>
    );
  }
}
