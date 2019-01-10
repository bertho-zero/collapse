import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import CollapsePanel from './Panel';
import openAnimationFactory from './openAnimationFactory';
import classNames from 'classnames';
import { isFragment } from 'react-is';
import shallowEqual from 'shallowequal';

function toArray(activeKey) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    currentActiveKey = currentActiveKey ? [currentActiveKey] : [];
  }
  return currentActiveKey;
}

class Collapse extends Component {
  constructor(props) {
    super(props);

    const { activeKey, defaultActiveKey } = this.props;
    let currentActiveKey = defaultActiveKey;
    if ('activeKey' in this.props) {
      currentActiveKey = activeKey;
    }

    this.state = {
      openAnimation: this.props.openAnimation || openAnimationFactory(this.props.prefixCls),
      activeKey: toArray(currentActiveKey),
    };

    this.getNewChild = this.getNewChild.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if ('activeKey' in nextProps) {
      this.setState({
        activeKey: toArray(nextProps.activeKey),
      });
    }
    if ('openAnimation' in nextProps) {
      this.setState({
        openAnimation: nextProps.openAnimation,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }

  onClickItem(key) {
    let activeKey = this.state.activeKey;
    if (this.props.accordion) {
      activeKey = activeKey[0] === key ? [] : [key];
    } else {
      activeKey = [...activeKey];
      const index = activeKey.indexOf(key);
      const isActive = index > -1;
      if (isActive) {
        // remove active state
        activeKey.splice(index, 1);
      } else {
        activeKey.push(key);
      }
    }
    this.setActiveKey(activeKey);
  }

  getNewChild(child, index) {
    if (!child) return null;

    const activeKey = this.state.activeKey;
    const { prefixCls, accordion, destroyInactivePanel, expandIcon } = this.props;
    // If there is no key provide, use the panel order as default key
    const key = child.key || String(index);
    const { header, headerClass, disabled } = child.props;
    let isActive = false;
    if (accordion) {
      isActive = activeKey[0] === key;
    } else {
      isActive = activeKey.indexOf(key) > -1;
    }

    const props = {
      key,
      panelKey: key,
      header,
      headerClass,
      isActive,
      prefixCls,
      destroyInactivePanel,
      openAnimation: this.state.openAnimation,
      accordion,
      children: child.props.children,
      onItemClick: disabled ? null : this.onClickItem,
      expandIcon,
    };

    return React.cloneElement(child, props);
  }

  getItems() {
    const { children } = this.props;
    const childList = isFragment(children) ? children.props.children : children;

    const newChildren = Children.map(childList, this.getNewChild);

    //  ref: https://github.com/ant-design/ant-design/issues/13884
    if (isFragment(children)) {
      return (
        <React.Fragment>
          {newChildren}
        </React.Fragment>
      );
    }

    return newChildren;
  }

  setActiveKey(activeKey) {
    if (!('activeKey' in this.props)) {
      this.setState({ activeKey });
    }
    this.props.onChange(this.props.accordion ? activeKey[0] : activeKey);
  }

  render() {
    const { prefixCls, className, style, accordion } = this.props;
    const collapseClassName = classNames({
      [prefixCls]: true,
      [className]: !!className,
    });
    return (
      <div className={collapseClassName} style={style} role={accordion ? 'tablist' : null}>
        {this.getItems()}
      </div>
    );
  }
}

Collapse.propTypes = {
  children: PropTypes.any,
  prefixCls: PropTypes.number,
  activeKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  defaultActiveKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  openAnimation: PropTypes.object,
  onChange: PropTypes.func,
  accordion: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  destroyInactivePanel: PropTypes.bool,
  expandIcon: PropTypes.func,
};

Collapse.defaultProps = {
  prefixCls: 'rc-collapse',
  onChange() {},
  accordion: false,
  destroyInactivePanel: false,
};

Collapse.Panel = CollapsePanel;

export default Collapse;
