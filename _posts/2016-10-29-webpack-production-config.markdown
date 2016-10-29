---
layout: post
title: webpack生产环境中的配置以及react-router中使用懒加载
categorise: webpack react react-router
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

### 在react-router中使用require-ensure（懒加载）

在react-router中使用webpack的require-ensure语法，这样我们的应用就可以按需加载了。再也不用担心因为项目很大，打包出来一个巨型的bundle.js（尴尬😅）。

下面来看一个小栗子
{% highlight javascript %}

// App.js 
...
class App extends Component {
    render() {

        return (
            <div>
                <h1>this is App </h1>
                <Link to={`/page2`}>page2</Link>
                {this.props.children}
            </div>
            );
    }
}
...


// Page1.js
...
class Page1 extends Component {
    render() {
        return <h2>this is page 1</h2>
    }
}
...


// Page2.js
...
class Page2 extends Component {
    render() {
        return <h2>this is page 2</h2>
    }
}
...


// routes.js react-router 的路由配置文件
import App from './App.js';

const routes = {
    component: App,
    childRoutes: [{
        path: '/',
        indexRoute: {
            getComponent(location, cb) {
            // 懒加载 Page1.js 访问根目录的时候才会加载进来Page1.js的模块
                require.ensure([], (require) => {
                  cb(null, require('./Page1.js'));
                });
            },
        }   
    }, {
        path: '/page2',
        getComponent(location, cb) {
        require.ensure([], (require) => {
          cb(null, require('./Page2.js'));
        });
      },
    }]
}

export default routes;

// 主入口函数 main.js


import React from 'react';
import ReactDom from 'react-dom';
import App from './App.js';
import { Router, Route, Link, browserHistory } from 'react-router'
import routes from './routes.js';

const root = (
    <Router history={browserHistory} routes={routes}>
    </Router>);

function main() {
    ReactDom.render(root, document.getElementById("app"));
}

main();


{% endhighlight %}

完整的源代码在文章的最后有附上链接，可以下载下来看看效果。
访问根目录时我们可以看到加载进来了 1.chunk.js 这里包含的事Page1.js的模块代码。
当我们访问 /page2 路径的时候，我们可以看到 webpack为我们引入了一个 2.chunk.js的文件。这一部分包含的就是 Page2.js 模块的代码了。真正做到按需加载。

### 提醒
值得一题的是，我们的资料项目应该都是基于babel 5.0。但是我用的是babel 6.0。6.0的版本如果不加插件声明的话。使用require引入用ES6语法声明的模块的时候行为会有一些差异- [具体可以看这里](http://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/) 所以，当你在使用的时候可能需要注意这个小细节。（以后要是发生了，和实例代码一样，却总是没有项目还真的要看看是不是babel的问题😢）。

### 参考文章
- [分离第三方库和多入口配置源码，github仓库](https://github.com/bojueWjt/webpack-learn/tree/master/003)
- [react-router配置源码，github仓库](https://github.com/bojueWjt/webpack-learn/tree/master/004)
- [webpack: require.ensure与require AMD的区别](http://blog.csdn.net/zhbhun/article/details/46826129)
- [React 和 Webpack 小书](https://www.gitbook.com/book/wohugb/react-webpack-cookbook/details)




