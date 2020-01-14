import React from 'react'
import PropTypes from 'prop-types'
// PropTypes 提供一系列验证器，可用于确保组件接收到的数据类型是有效的
// 出于性能方面的考虑，propTypes 仅在开发模式下进行检查

// 用来向所有容器组件提供store的组件类
export class Provider extends React.Component {
  // 组件接收props的数据类型检查
  static propTypes = {
    store: PropTypes.object.isRequired
  }

  // 声明提供的context的数据名称和类型
  static childContextTypes = {
    store: PropTypes.object
  }

  // 向所有有声明的子组件提供包含要传递的context对象
  getChildContext() {
    return {
      store: this.props.store
    }
  }

  render() {
    // 渲染所有子标签
    return this.props.children
  }
}

/**
 * connect高阶函数:接收mapStateToProps和mapDispatchToProps, 返回一个高阶组件函数
 * 高阶组件: 接收UI组件,返回容器组件
 */
export function connect(mapStateToProps, mapDispatchToProps) {
  // 返回一个高阶组件函数
  return (UIComponent) => {
    return class ContainerComponent extends React.Component {
      // 声明接收的context数据的名称和类型
      static contextType = {
        store: PropTypes.object
      }

      constructor(props, context) {
        super(props)
        console.log('ContainerComponent constructor(),', context.store)
      }

      render() {
        return <UIComponent />
      }
    }
  }
}