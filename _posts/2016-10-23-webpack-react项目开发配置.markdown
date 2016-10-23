---
layout: post
title: 使用resolve，优化react项目中的webpack打包
categorise: webpack react
---

这一段时间，开发基于react、redux的项目近乎半年的时间了。现在回过头来总结一下，在redux的项目中关于webpack配置的一些问题。不打算从头开始讲，只是总结一些认为比较重要的东西。

## 转化Jsx
为了让webpack可以识别打包，react中的jsx语法。我们需要使用到优秀的编译工具babel.

### 安装webpack的babel加载器。
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
            include: __dirname，
            noParse: ['react']
        }],
    }
    ...
}
{% endhighlight %}

当然做这些还是不够的，现在让babel支持你所需要编译的语法，要像安装插件一样安装哪些特性所需要的模块。所以我们要让babel支持编译react的jsx的语法，要需要安装对应的模块。

### 安装babel-cli和babel-preset-react
`npm install --save-dev babel-cli babel-preset-react`

### 配置.babelrc文件
`echo '{ "presets": ["react"] }' > .babelrc` 这里如果你原先没有配置babel的话，会生成一个.babelrc的隐藏文件。当我们需要修改babel的解析行为的时候，修改这个文件就够了。



当然在redux的项目中，你可能需要使用上es6的语法，和上面一样，我们同样需要安装和配置解析这类特性的babel模块。

### 安装babel-cli和babel-preset-es2015
`npm install --save-dev babel-preset-es2015`

### 配置.babelrc文件
`echo '{ "presets": ["react", "es2015"] }' > .babelrc`



好了，这个时候一切都准备好了。使用webpack命令编译看看。应该可以成功解析你的react的代码了。


## resolve.alias

`resolve.alias`是webpack配置的一个选项，主要的作用是，当请求模块加载时，可以将这个请求重定向到其他的文件。
当我们在项目中引用react的时候，我们是这些写的。
`import React from 'react;`
这样其实我们是会引入react的源码，而不是它压缩打包的代码。而我们会通过webpack再次的压缩打包这部分源码。 所以我们如果像提高webpack的编译效率，可以使用`resolve.alias`这个选项来重定位第三方库的请求，到其压缩的源码部分。

### 在webpack配置文件中中配置resolve.alias

这里我们除了配置react的请求重定向外，我们也配置了react-dom的请求重定向
{% highlight javascript %}
var node_modules = path.resolve(__dirname, "node_modules/");
var reactPath = path.resolve(node_modules, "react/dist/react.min.js");
var reactDomPath = path.resolve(node_modules, 'react-dom/dist/react-dom.min.js');

module.exports = {
    ...
    resolve: {
        alias: {
            'react': reactPath,
            'react-dom': reactDomPath
        }
    },
    ....
}
{% endhighlight %}

## 在 Webpack 中忽略对已知文件的解析

`modules.noParse` 可以让webpack忽略去检查文件的内部文件依赖。当你*确定一个引入的模块没有别的模块依赖*的时候，可以通过这个属性进一步的提高webpack的编译效率。

### 在webpack中配置modules.noParse

需要注意的是这里我们只在react上使用，因为react-dom回去请求react，所以react-dom本身并不适应

{% highlight javascript %}
module.exports = {
    ...
    module: {
        loaders: [{
            test: /\.jsx?$/, 
            ...
            noParse: ['react']
        }],
    }
    ...
}
{% endhighlight %}

### 有个小困惑


`WARNING in ./~/react/dist/react.min.js
Critical dependencies:
12:407-414 This seems to be a pre-built javascript file. Though this is possible, it's not recommended. Try to require the original source to get better results.
 @ ./~/react/dist/react.min.js 12:407-414`

 会报这样的一个警告，查了半天我还不知道为什么，谁知道的可以邮箱告诉我。谢谢大家。



### 参考文章
- [文章配置源码，github仓库](https://github.com/bojueWjt/webpack-learn/tree/master/002)
- [Webpack 性能优化·1](http://code.oneapm.com/javascript/2015/07/07/webpack_performance_1/)
- [React 和 Webpack 小书](https://www.gitbook.com/book/wohugb/react-webpack-cookbook/details)


