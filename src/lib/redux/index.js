// redux核心暴露函数, 创建store对象, 暴露于store对象有关的接口
// 核心维护的是状态数据(获取(getState),更新触发(dispatch),订阅更新)

export function createStore(reducers) {

  let state = reducers(undefined, { type: '@@redux/init' })
  let listeners = []

  function getState() {
    return state
  }

  function dispatch(action) {
    const newState = reducers(state, action)    // state是总的state, 调用后返回的newState也是总的state
    state = newState
    listeners.forEach(listener => listener())
  }

  function subscribe(listener) {
    listeners.push(listener)
  }

  return {
    getState,
    dispatch,
    subscribe
  }

}

// 接收一个对象,返回一个新的reducer函数
export function combineReducer(reducers) {
  // 新的reducer函数返回值是一个总的state
  return (state, action) => {
    let newState = {}
    // 调用reducers 集合, 生成新的state集合
    Object.keys(reducers).forEach(key => {
      // 执行自己的reducer函数,使用自己的state状态数据,action是通用,不能重复
      newState[key] = reducers[key](state[key], action)
    })
    return newState
  }
}

export function combineReducerByReduce(reducers) {
  // 返回一个reducer函数,是为了在createStore接收这个函数, 并在函数中执行, 传入初始化的state,和action: {type:'@@redux/init'}
  return (initState = {}, action) => {
    // 执行所有的reducers
    return Object.keys(reducers).reduce((totalState, key) => {
      totalState[key] = reducers[key](initState[key], action)
      return totalState
    }, {})
  }
}