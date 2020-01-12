import axios from 'axios'
import qs from 'qs'

// 根据环境变量区分接口的默认地址
switch (process.env.NODE_ENV) {
  case "production":
    axios.defaults.baseURL = 'http://api.landrich.cn:3000'
    break;
  case "test":
    axios.defaults.baseURL = 'http://localhost:3000/api'
    break;
  case "development":
    axios.defaults.baseURL = 'http://localhost:4000/api'
    break;
  default:
    axios.defaults.baseURL = 'http://localhost:5000/api'
}

// 设置超时时间和跨域是否允许携带凭证
axios.defaults.timeout = 10000
axios.defaults.withCredentials = true

/**
 * 很多后台服务器一般接收请求数据的格式是x-www-form-urlencoded格式
 * 后端约定请求(GET,POST)数据的格式,一般GET是url-encoded,POST如果是别的格式进行转换为服务器可以识别的格式
 * 转换后的格式是: username=zhangsan&password=123
 */
// 处理GET请求数据的格式
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'

// 处理POST请求数据的格式, data是客户端发送请求的数据 请求主体body
axios.defaults.transformRequest = data => {
  return qs.stringify(data)
}

/**
 * 设置请求拦截器
 * 1. 一般的接口请求中, 都会进行token校验
 * TOKEN校验(JWT): 接受服务器返回的token,存储到redux/vuex/本地存储
 * 每次向服务器发请求,都要把token带上,不带上都认为是非法访问, token的记录时间要看服务器设置 30分钟
 * 可能返回401(没有token), 过期可能返回403
 */
axios.interceptors.request.use(config => {
  // 携带token
  let token = localStorage.getItem('token')
  token && (config.headers.Authorization = token)
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 影响拦截器
 * 服务端返回信息 -> [拦截的统一处理] -> 客户端JS获取到信息
 * 1. 什么情况下默认就是error呢? 默认服务端返回的状态码是2开头的,3也可以(缓存,协商缓存)
 */

// 很多公司不进行配置, 少数公司才在接口返回中设置3xx的状态码, 
// axios.defaults.validateStatus = status => {
//   // 自定义响应成功的HTTP状态码
//   return /^(2|3)\d{2}$/.test(status)
// }

// 默认情况下,状态码以2开头的才会执行第一个回调函数
// 3开头一般要么是永久重定向,要么就是临时重定向(304协商缓存),如果进行了上面的配置,那么状态码2或者3开头的都走第一个callback
// 一般是资源文件(css等静态资源文件)返回304协商缓存,一般请求接口都是2开头
axios.interceptors.response.use(response => {
  // 只返回响应主体中的信息(部分公司根据需求会进一步完善, 例如指定服务器返回的code值来指定成功还是失败)
  return response.data
}, error => {
  let { response } = error
  if (response) {
    // 服务器最起码返回了结果
    // 请求已发送 只不过状态码不是200系列，设置不同状态码的不同处理
    switch (response.status) {
      case 401: // 当前请求需要用户验证(一般是未登录)
        // 此处可以跳转路由,弹出蒙层Modal提示未登录
        break;
      case 403: // 服务器应景理解请求 但是拒绝执行它(一般是TOKEN过期，session过期等)
        localStorage.removeItem('token')
        // 跳转到登录页
        break
      case 404:
        break;
      default:
        break;
    }
  } else {
    // 服务器连结果都没有返回 1. 服务器崩了 2. 客户端断网
    if (!window.navigator.onLine) {
      // 断开网络了，可以让其跳转到断网页面(自己开发的页面)
      return
    }
    return Promise.reject(error)
  }
})

export default axios