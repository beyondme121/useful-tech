import { createStore } from './lib/index'

import countReducer from './reducer'

// 调用createStore,传入reducer,返回store对象
export default createStore(countReducer)