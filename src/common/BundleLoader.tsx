import * as React from 'react';

export interface BundleLoaderProps { load: Function; render?: Function; }
export interface BundleLoaderState { mod: any; }

export default class BundleLoader extends React.Component<BundleLoaderProps, BundleLoaderState> {
  static defaultProps = {
    render: Comp => <Comp />,
  };

  state = {
    mod: null,
  };

  componentWillMount() {
    this.load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps);
    }
  }

  load(props) {
    this.setState({
      mod: null
    });
    props.load((mod) => {
      this.setState({
        mod: mod.default ? mod.default : mod,
      });
    });
  }

  render() {
    return this.props.render(this.state.mod);
  }
}
