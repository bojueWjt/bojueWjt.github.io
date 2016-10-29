---
layout: post
title: webpack生产环境中的配置
categorise: webpack 
---

## 分离第三方引用
在webpack打包的项目中，我们可以通过配置，将第三方引用的库，单独打包出来放在一个文件里。这样用户在应用更新的时候，也无需将第三方的库重新下载一次，而是直接读取原来的缓冲就可以了。提供用户在再次使用应用时的加载速度。

{% highlight javascript %}
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
{% endhighlight %}

## 分多文件入口
在webpack项目中，有时候我们可能有多个url对应不同的页面，比如一个网站有一个面向用户的页面，还有一个面向管理员的后台管理的页面，还有一个手机版的页面。这个时候我们肯定不会希望这些页面的代码，都打包在一起。我们可以使用webpack配置多个入口。

{% highlight javascript %}
exports.module = {
    ...
    entry: {
        app: path.resolve(__dirname, "app/main.js"),
        admin: path.resolve(__dirname, "app/admin-main.js"),
        vendors: ["react", "react-dom"]
    },
    // 多入口时的配置， 使用[name]变量
    output: {
        path: path.resolve(__dirname, "build"),
        filename: '[name].js'
    },
    ...
}

{% endhighlight %}

## require-ensure 
require.ensure在需要的时候才下载依赖的模块，当参数指定的模块都下载下来了（下载下来的模块还没执行），便执行参数指定的回调函数。require.ensure会创建一个chunk，且可以指定该chunk的名称，如果这个chunk名已经存在了，则将本次依赖的模块合并到已经存在的chunk中，最后这个chunk在webpack构建的时候会单独生成一个文件。

