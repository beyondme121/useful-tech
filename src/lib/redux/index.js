// 精简版redux 的核心 store
// 维护着 公共state 以及 reducer处理状态函数

// 向外暴露三个核心api 
// createStore combineReducer

// 接收reducer, 返回一个对象 --> store, 这个对象包含了三个主要属性(属性值是函数)
export function createStore(reducer) {

  // store中的state是调用reducer产生的初始化state
  // 用来存储内部状态数据的变量, 初始值为调用reducer函数返回的结果(外部指定的默认值)
  let state = reducer(undefined, { type: '@@redux/init' })
  // 用来存储监听state更新回调函数的数组容器
  const listeners = []

  // 返回当前内部的state数据
  function getState() {
    return state
  }

  // 分发action, 触发reducer函数的调用, 产生新的state
  /**
   * 1. 触发reducer调用，得到新的state
   * 2. 保存新的state
   * 3. 调用所有已经存在的监视回调函数
   * @param {*} action 
   */
  function dispatch(action) {
    // 1. 触发reducer调用，得到新的state
    const newState = reducer(state, action)
    // 2. 保存新的state
    state = newState
    // 3. 调用所有已经存在的监视回调函数
    listeners.forEach(listener => listener())
  }

  // 绑定内部state改变的监听回调 redux维护的state如果发生变化,就会调用subscribe所对应的回调函数
  // 可以给一个store绑定多个监听
  function subscribe(listener) {
    listeners.push(listener)
  }


  return {
    getState,
    dispatch,
    subscribe
  }
}


// 1. 整合传入参数对象中的多个reducer函数，返回一个新的reducer
// 2. 新的reducer管理的总状态：{ r1: state1, r2: state2 }
export function combineReducer(reducers) {
  return (state, action) => {

  }
}