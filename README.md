### axios 第二次封装

#### 1. 封装前最原始的写法

```js
// get
axios
  .get(url, {
    params: {
      searchText: ""
    }
  })
  .then(resp => {})
  .catch(err => {});

// post
axios
  .post(url, {
    username: "",
    password: ""
  })
  .then(resp => {})
  .catch(err => {});
```

#### 2. 封装 url 地址

1. 每次请求都会请求一个 url 地址, 比如 http://127.0.0.1:port/api/xxx, 没请求一个后端接口,都要写这样长的地址
2. 公司开发会区分开发环境(调用本地接口)，生产环境(真实服务器上的接口), 测试环境。我们会根据一些特殊的变量如环境变量进行区分,或者做一些处理
3. 如果服务端采用的 cors 这种方式(跨域资源共享)，一般我们要允许客户端向服务端发请求携带资源凭证，比如携带 cookie，要不然跨域怎么携带 cookie 过去，不能每次发请求都单独写一遍携带 cookie(这也是重新封装 axios 的作用,需要提前做一些处理)
4. POST 请求是通过请求主体发送给 server 的, 一般的公司的服务器都有对 post 接收 body 有一定的要求, 比如 json 格式，或者是 url-encoded
5. 如果请求出现错误，统一处理错误反馈
6. 当从服务器请求返回结果后,返回结果可能会有成功和失败的可能，失败也会有很多失败的情况
7. 发请求断网了,错误处理等问题
8. 对于接口请求的公共的处理的部分进行处理. 这才是封装的初衷

### axios 的全局配置项

1. 根据环境变量判断使用 axios 的配置项

```js
// 根据环境变量区分接口的默认地址
switch (process.env.NODE_ENV) {
  case "production":
    axios.defaults.baseURL = "http://api.landrich.cn:3000";
    break;
  case "test":
    axios.defaults.baseURL = "http://localhost:3000/api";
    break;
  case "development":
    axios.defaults.baseURL = "http://localhost:4000/api";
    break;
  default:
    axios.defaults.baseURL = "http://localhost:5000/api";
}
```

2. 设置超时时间和跨域是否允许携带凭证

```js
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
```

3. 约定后端服务器可以接受的数据的格式

```js
/**
 * 很多后台服务器一般接收请求数据的格式是x-www-form-urlencoded格式
 * 后端约定请求(GET,POST)数据的格式,一般GET是url-encoded,POST如果是别的格式进行转换为服务器可以识别的格式
 * 转换后的格式是: username=zhangsan&password=123
 */
// 处理GET请求数据的格式
axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";

// 处理POST请求数据的格式, data是客户端发送请求的数据 请求主体body
axios.defaults.transformRequest = data => {
  return qs.stringify(data);
};
```

4. 扩展 qs 包

```js
// 将字符串username=zhangsan&password=123转换为对象{username: xxx, password: xxx}
qs.stringify(data);
```

5. JSON 的两个方法

```js
// 将JSON对象转换为json字符串
const jsonstr = JSON.stringify(data);
// 将json格式字符串转换为json对象
const jsonObj = JSON.parse(jsonstring);
```

6. 设置请求拦截器
