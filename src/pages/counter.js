import React, { Component } from 'react'
import { connect } from '../lib/react-redux'
import { increment, decrement } from '../redux-use-case/actions'

class Counter extends Component {

  state = {
    obj: { name: 'sanfeng' }
  }
  handleAdd = (num) => {
    this.props.increment(num)
  }

  handleMinus = num => {
    this.props.decrement(num)
  }

  render() {
    return (
      <div>
        React-Redux Counter: {this.props.count}
        <p>{this.state.obj.name}</p>
        <button onClick={() => this.handleAdd(100)}>加100</button>
        <button onClick={() => this.handleMinus(2)}>减2</button>
      </div>
    )
  }
}

const mapStateToProps = state => ({ count: state.count })

// 函数类型
// const mapDispatchToProps = dispatch => ({
//   increment: () => dispatch(increment())
// })

const mapDispatchToProps = dispatch => {
  return {
    decrement: (num) => dispatch(decrement(num)),
    increment: num => dispatch(increment(num))
  }
}

// 对象类型
// const mapDispatchToProps = { increment, decrement }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter)
