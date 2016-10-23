---
layout: post
title: 使用resolve，优化react项目中的webpack打包
categorise: webpack react
---

这一段时间，开发基于react、redux的项目近乎半年的时间了。现在回过头来总结一下，在redux的项目中关于webpack配置的一些问题。不打算从头开始讲，只是总结一些认为比较重要的东西。

**转化Jsx
为了让webpack可以识别打包，react中的jsx语法。我们需要使用到优秀的编译工具babel.

安装webpack的babel加载器。
`npm install babel-loader --save-dev`

在webpack的配置文件中配置，让文件后缀名为js和jsx的文件，都通过babel-loader加载进来。
{% highlight javascript %}

module.exports = {
    ...
    module: {
        loaders: [{
            test: /\.jsx?$/, // 用正则来匹配文件路径，这段意思是匹配 js 或者 jsx
            loader: 'babel', // 加载模块 "babel" 是 "babel-loader" 的缩写
            exclude: /node_modules/,
            include: __dirname
        }],
    }
}
{% endhighlight %}