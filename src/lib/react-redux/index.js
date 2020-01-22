import React, { Component } from 'react'
import PropTypes from 'prop-types'

const Context = React.createContext()

export class Provider extends Component {
  // 接收参数类型校验
  static propTypes = {
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    // 初始化一个Context,默认值是传递进来的store对象
    // Context = React.createContext(props.store || {})
    // console.log('Context', Context)
  }

  render() {
    return (
      <Context.Provider value={this.props.store}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

// 1. mapStateToProps:函数, mapDispatchToProps: 函数或者对象
// 2. 函数调用后返回一个高阶组件,包装 UI组件 返回 容器组件, 处理UI组件,给UI组件添加一般属性和函数属性
export function connect(mapStateToProps, mapDispatchToProps) {
  return UIComponent => {
    return class Container extends React.Component {
      // mapStateToProps形参是state,就是全局的state,从store中来
      static contextType = Context

      constructor(props) {
        super(props)
        this.state = {
          ordinaryProps: {}
        }
      }

      // 获取一般属性
      getOrdinaryProps = store => {
        const props = mapStateToProps(store.getState())
        return props
      }

      // 获取更新状态的函数属性
      getDispatchProps = store => {
        // 如果传递的是dispatch函数
        if (typeof mapDispatchToProps === 'function') {
          return mapDispatchToProps(store.dispatch)
        } else {
          // 传递的是对象, 由action creator组成
          // console.log('mapDispatchToProps:', mapDispatchToProps)
          return Object.keys(mapDispatchToProps).reduce((pre, key) => {
            let actionCreator = mapDispatchToProps[key]
            pre[key] = (...args) => store.dispatch(actionCreator(...args))
            return pre
          }, {})
        }
      }

      componentDidMount() {
        const store = this.context
        const ordinaryProps = this.getOrdinaryProps(store)
        const dispatchProps = this.getDispatchProps(store)
        this.setState({
          ordinaryProps
        })
        this.dispatchProps = dispatchProps
        // 这个生命周期可以添加订阅
        store.subscribe(() => {
          // 当store中的状态state数据发生更新, 就会触发容器组件的state更新, 
          // 进而会重新调用render, 最终会重新渲染UI组件的更新
          this.setState({
            ordinaryProps: this.getOrdinaryProps(store)
          })
        })
      }

      render() {
        return (
          <UIComponent {...this.state.ordinaryProps} {...this.dispatchProps} />
        )
      }
    }
  }
}



























/*
export function connect(mapStateToProps, mapDispatchToProps) {

  return (UIComponent) => {

    return class ContainerComponent extends React.Component {
      static contextType = Context

      constructor(props) {
        super(props)
        this.state = {
          stateProps: {},
          dispatchProps: {}
        }
      }

      componentDidMount() {
        const store = this.context
        // 得到包含所有一般属性的对象
        const stateProps = mapStateToProps(store.getState())

        // 得到包含所有函数属性的对象
        let dispatchProps
        // 判断mapDispatchToProps这个参数是函数还是对象
        if (typeof mapDispatchToProps === 'function') {
          dispatchProps = mapDispatchToProps(store.dispatch)
        } else {
          // 如果传递的是对象,类似{increment, decrement}
          dispatchProps = Object.keys(mapDispatchToProps).reduce((pre, key) => {
            const actionCreator = mapDispatchToProps[key] // increment
            // 调用actionCreator返回一个action: { type: 'xxx', payload: data }
            pre[key] = (...args) => store.dispatch(actionCreator(...args))
            return pre
          }, {})
          // 最终返回的dispatchProps是什么? {increment: (...arge) => {函数内部调用dispatch(action)}} 触发reducer的状态更新
          // 也就是遍历actionCreator,调用store.dispatch(action),返回一个这样的对象,包含了调用dispatch(action)的函数
        }
        // 保存在组件上, 因为函数的定义是不会变的, 而状态stateProps是会更新的, 所以要保存到组件状态数据上
        this.dispatchProps = dispatchProps

        this.setState({
          stateProps      // 将所有一般属性作为容器组件中的状态数据, 更新状态
        })
        // 绑定store的state变化的监听
        store.subscribe(() => {   //  store内部的state状态数据发生了变化
          // 更新容器组件(重新渲染组件[调用setState]),进而就更新了UI组件
          this.setState({
            stateProps: mapStateToProps(store.getState())     // 将所有一般属性作为容器组件中的状态数据, 更新状态
          })
        })
      }

      render() {
        console.log("this.context:", this.context)
        return (
          <UIComponent {...this.state.stateProps} {...this.dispatchProps} />
        )
      }
    }
  }
}
*/