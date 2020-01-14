import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from './lib/react-redux'

import './index.css';
import App from './App';

import store from './redux-use-case/store'

console.log('总状态,', store.getState())

// ReactDOM.render(<App store={store} />, document.getElementById('root'))
ReactDOM.render(<Provider store={store}>
  <App />
</Provider>, document.getElementById('root'))


// 监听store中state的变化,如果有变化, 调用了dispatch,会遍历listeners数组,执行数组中的回调函数
store.subscribe(() => {
  ReactDOM.render(<App store={store} />, document.getElementById('root'));
})
