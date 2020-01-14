// redux的核心: 暴露三个函数, 生成一个store对象


// 接收reducer组合(多个reducer),返回store对象
export function createStore(reducer) {

  // 执行createStore就会初始化state数据
  // 用来存储内部状态数据的变量, 初始值为调用reducer函数返回的结果(外部指定的默认值)
  let state = reducer(undefined, { type: '@@redux/init' })

  // 用来存储监听state更新的回调函数的数组容器
  const listeners = []

  function getState() {
    return state
  }

  function dispatch(action) {
    let newState = reducer(state, action)
    state = newState
    listeners.forEach(listener => listener())
  }

  // 参数为监听内部state更新的回调函数, 可以调用多次，可以绑定多个监听，监听是函数
  function subscribe(listener) {
    // 保存到缓存listener容器数组中
    listeners.push(listener)
  }

  return {
    getState,
    dispatch,
    subscribe
  }
}

/**
 * reducers的结构:
 * {
 *    count: (state = 2, action) => newState,
 *    user: (state = {}, action) => {}
 * }
 * 
 * combineReducer(reducers)返回的reducer函数的返回值结构 --> 对象
 * {
 *    count: count(state.count, action),     // 调用count reducer返回的新的状态数据
 *    user: user(state.user, action)         // ...
 * }
 * 
 */





// 接收一个对象,包含多个reducer函数,返回一个新的reducer函数, 调用新的reducer函数返回的是总的state状态数据
// 新的reducer管理的总状态
// 返回新的reducer函数 { r1: state1, r2: state2 }

// function combineReducer(reducers) {
//   return (state = {}, action) => {
//     Object.keys(reducers).reduce((preState, key) => {
//       preState[key] = reducers[key](state[key], action)
//       return preState
//     }, {})
//   }
// }



// forEach版本
export function combineReducerByForEach(reducers) {
  return (state = {}, action) => {
    let totalState = {}
    Object.keys(reducers).forEach(key => {
      totalState[key] = reducers[key](state[key], action)
    })
    return totalState
  }
}

export function combineReducer(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((totalState, key) => {
      totalState[key] = reducers[key](state[key], action)
      return totalState
    }, {})
  }
}