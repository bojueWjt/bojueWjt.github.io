---
layout: post
title: 使用resolve，优化react项目中的webpack打包
categorise: webpack react
---

这一段时间，开发基于react、redux的项目近乎半年的时间了。现在回过头来总结一下，在redux的项目中关于webpack配置的一些问题。不打算从头开始讲，只是总结一些认为比较重要的东西。

##转化Jsx
为了让webpack可以识别打包，react中的jsx语法。我们需要使用到优秀的编译工具babel.

###安装webpack的babel加载器。
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

当然做这些还是不够的，现在让babel支持你所需要编译的语法，要像安装插件一样安装哪些特性所需要的模块。所以我们要让babel支持编译react的jsx的语法，要需要安装对应的模块。

### install the cli and this preset
`npm install --save-dev babel-cli babel-preset-react`

### make a .babelrc (config file) with the preset 
`echo '{ "presets": ["react"] }' > .babelrc` 这里如果你原先没有配置babel的话，会生成一个.babelrc的隐藏文件。当我们需要修改babel的解析行为的时候，修改这个文件就够了。

当然在redux的项目中，你可能需要使用上es6的语法，和上面一样，我们同样需要安装和配置解析这类特性的babel模块。

### install the cli and this preset
npm install --save-dev babel-preset-es2015

### make a .babelrc (config file) with the preset
echo '{ "presets": ["react", "es2015"] }' > .babelrc

好了，这个时候一切都准备好了。使用webpack命令编译看看。应该可以成功解析你的react的代码了。


