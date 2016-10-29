---
layout: post
title: webpack生产环境中的配置
categorise: webpack 
---

## 分离第三方引用
在webpack打包的项目中，我们可以通过配置，将第三方引用的库，单独打包出来放在一个文件里。这样用户在应用更新的时候，也无需将第三方的库重新下载一次，而是直接读取原来的缓冲就可以了。提供用户在再次使用应用时的加载速度。
{% lighlight javascript %}
exports.module = {
  ...
    // 将第三方的资源独立打包成一个文件引入，这样在应用更新以后用户也不需要重新下载。
  entry: {
      app: path.resolve(__dirname, "app/main.js"),
      vendors: ['react', 'react-dom']
     },
    // 需要用的一个webpack的插件 记得在index.html中引入vendors 不然会报错哟
    // 
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
    ]
    ...
}
{% endlighlight %}