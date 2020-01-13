// jquery的ajax发起的ajax的 "同源" 异步请求, 加上dataType: 'jsonp'就是发起跨域的jsonp请求
$.ajax({
  url: 'http://127.0.0.1:8001/list',
  method: 'get',
  dataType: 'jsonp',         // 执行的是JSONP请求
  success: res => {
    console.log(res)
  }
})