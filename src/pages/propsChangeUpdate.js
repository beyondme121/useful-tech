import React, { Component } from 'react'

export default class Parent extends Component {
  state = {
    count: 0
  }

  add = () => {
    this.setState(preState => ({ count: preState.count + 1 }))
  }

  componentDidUpdate(preProps, preState) {
    if (preState.count !== this.state.count) {
      console.log("parent did update...")
    }
  }

  render() {
    console.log('parent render...')
    return (
      <div>
        <p>实验生命周期方法 componentDidUpdate, 父组件中count: {this.state.count}</p>
        <button onClick={this.add}>加1</button>
        <Child count={this.state.count} />
      </div>
    )
  }
}

class Child extends Component {
  state = {
    myCount: 0
  }
  // 如果传递的props发生更新,调用这个钩子
  // componentDidUpdate(preProps, preState, snapshot) {
  //   if (this.props.count !== preProps.count) {
  //     console.log('-----,', this.props.count, preProps.count)
  //   } else {
  //     console.log('*********')
  //   }
  // }

  componentDidUpdate(preProps, preState) {
    console.log('child update...')
    console.log('child: current,', this.props.count)
    console.log('child: preProps,', preProps.count)
    if (Math.random() > 0.5) {
      this.setState((state, props) => ({
        myCount: state.myCount + props.count
      }))
    }
  }



  render() {
    console.log('child render...')
    return (
      <div>
        <div>
          parent count: {this.props.count}
        </div>
        <div>
          child myCount: {this.state.myCount}
        </div>

      </div>
    )
  }
}
