---
layout: post
title: 记一次项目webpack的构建速度优化
categorise: webpack
---

最近在写的一个旧项目，发现项目在机器上面的编译速度很慢。第一次编译费时基本在80s的时间左右，修改后重新构建的速度也很慢。基本是需要在20s左右，个别可能会有80s才重新构建完成的情况。很影响开发的效率，所以尝试了一些优化工作，在这里分享给大家。
![优化前的webpack,编译后控制台打印的信息](http://balen.wang/img/webpack-optizition/webpack-optizition-01.jpeg)
## 现有能观察到的问题
1. LoaderUtils.parseQuery() 的警告信息。
2. webpack,webpack-dev-middleware版本落后。
3. 对于我们我进行的优化工作而言，现在的webpack编译后没法给出比较详尽的信息。

### 针对上面提出的三个问题的解决办法
1. 察阅了相关的Issues发现，是less-loader里面使用了loaderUtils.parseQuery()这个方法，将less-loader升级到v4.0.6版本。
2. 对webpack和webpack-dev-middleware进行了升级，升级后对应的版本分别是v3.6.0,v2.0.6
3. 对webpack-dev-middlware进行升级后，它默认打印出了更加详尽的打包信息。我们修改webpack.dev.conf.js中设置“profile: true”可以查看到花费时间较多的编译项。

### 效果
进行升级后我们的第一次编译时间已经缩减到55s左右了。重新构建时间在7s左右。控制台也得到了更详尽的编译信息。效果还是比较明显的。

## 对新得到的详尽的编译信息进行分析
![](http://balen.wang/img/webpack-optizition/webpack-optizition-02.jpeg)
以上是耗时时间较长的编译项，我挑选了几个我比较关注的内容
1. report模块的编译时间有4s这么多，应该是raven-js本身的体积就比较大，但是在开发环境编译下，引入report是不必要的。
2. element-ui和vue.esm编译也花了很长时间。
3. babel-polyfill这个选项编译有多项，也花费了许多的时间。
4. error.png这张12kb的图片也花去了我们3s的编译时间，这个是比较怪异的。
5. hidden modules有1692个之多，当然包含我们自己所编写的模块，但大部分应该是引入的第三方npm包依赖的模块。

### 针对以上问题的解决办法

#### 1.修改report的引入判断入口
在原项目中，我们在report/index.js里面去判断是否启用数据上报，但是raven-js已经被引入了进来，我们把引入判读逻辑转移到main.js中。这样在开发环境下，我们不会再次引入raven-js了。
```javascript
// 数据上报
let report = {}
if (process.env.NODE_ENV === 'production') {
  report = require('./report')
}
```

#### 2.使用resolve.alias修改babel-polyfill和axios的引入路径
resolve.alias是webpack配置的一个选项，主要的作用是，当请求模块加载时，可以将这个请求重定向到其他的文件。 当我们在项目中引用react的时候，我们是这些写的。 import React from 'react; 这样其实我们是会引入react的源码，而不是它压缩打包的代码。而我们会通过webpack再次的压缩打包这部分源码。 所以我们如果像提高webpack的编译效率，可以使用resolve.alias这个选项来重定位第三方库的请求，到其压缩的源码部分。
```javascript
	profile: true,  // 打印耗时较多的编译项
	resolve: {
		alias: {
			'babel-polyfill': 'babel-polyfill/dist/polyfill.min.js',
				'axios': 'axios/dist/axios.min.js'
		}
	}
```
#### 其他问题的说明
element-ui、vue、vuex、vue-router等一系列的库，在引入的时候已经做了优化。不是很适用resolve.alias这样的方式，现在还不知道怎么对这些做一个优化。还有一些引入的库像lazyload本身没有提供已经压缩的版本。
**error.png的编译问题应该是lazyload引起的，至于为什么会这样还不知道原因，了解的朋友可以告诉我一下。**
lodash有多个库依赖，引入使用方式也不同，也不适用resolve.alias的方式

#### 修改后的效果
![](https://lexiangla.com/assets/eae49fa047a011e884f15254004b6d18)
第一次编译时间保存在44s左右，重新编译的时间维持在5s左右。效果还是比较明显的。hidden modules 也减少了300项


### 修改css-loader的版本为0.14.5
css-loader v0.14.5以上的版本编译速度比较慢。具体可以查看这个[Issues](http://balen.wang/img/webpack-optizition/webpack-optizition-03.jpeg)。不过这个修改会产生前面提过的LoaderUtils.parseQuery() 的警告信息。但是效果确实很明显，第一次的构建速度可以减少4s的时间。

## 更进一步的修改

前面的修改只是在webpack.dev.conf.js上做修改。风险还是比较小。下面的修改会影响到webpack.base.conf.js。影响还有待观察。

### 使用happlypack多线程构建

happlypack可以使webpack的构建由单进程工作，转化为多进程构建。提供webpack的编译效率。这里就不多描述了。感兴趣的朋友可以看一下问末的参考文章。本机上实验使用happlypack后，第一次编译的耗时可以缩减到25s。十分惊人了。

## 结论
此次优化以后，编译的效率可以提高50%。在其他的项目我们也可以尝试去做一些这样的优化工作。

## 参考文章

- [Webpack 性能优化-使用别名做重定向](http://code.oneapm.com/javascript/2015/07/07/webpack_performance_1/)
- [Vuejs项目的Webpack2构建优化](https://molunerfinn.com/Webpack-Optimize/#%E5%BC%80%E5%90%AFwebpack%E7%9A%84cache)
- [深入浅出 Webpack](http://webpack.wuhaolin.cn/)