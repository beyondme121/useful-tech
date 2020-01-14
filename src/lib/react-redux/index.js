import React from 'react'
import store from '../../redux-use-case/store'
// 创建上下文对象并初始化
const Context = React.createContext(store)

export class Provider extends React.Component {
  render() {
    return (
      <Context.Provider value={store}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

// 
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