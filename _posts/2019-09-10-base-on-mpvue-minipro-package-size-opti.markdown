---
layout: post
title: 基于mpvue的小程序包大小优化总结
---

### 1. 需求背景
  开发立新二手车小程序（以下简称门店小程序），车辆管理需求的过程中发现，门店小程序的包体积大小过大。其中生成环境1380kb，开发环境2839kb。
#### 1.1 主包大小对生产环境
  之前我们为了优化包的体积大小，做了一次本地图片上cdn。但显然生产环境中的主包大小，已经接近小程序对于主包大小2M的限制条件，不利于我们后面新业务的开发上新。而且主包的提交大小也影响了用户打开小程序的速度，和小程序运行时所占用的系统内存。一般来说小程序的主包控制在1M，可以让用户在1s内打开小程序。
##### 1.1.1 小程序的启动步骤
  ![小程序的启动步骤图示](http://ninico.top/img/minipro-package-size-optizition/the-step.png)
  包的大小将直接影响，第一步资源准备和第二步业务代码注入和渲染的速度。
#### 1.2 主包大小对生产环境
  开发环境中的主包大小已经超过了限制条件，开发过程中无法进行小程序预览调试，真机中的预览调试，每次都需要进行一次压缩打包，影响了开发效率。
### 2. 分析mpvue打包后的主包大小组成部分
  因为开发环境中的打包结果相较于生产环境中，只多不少。所以以下分析我们全部以开发环境下来分析，
  ---- ----
  mpvue将每个注册的page作为webpack打包的入口，同时也会将系统中引入的公共库或者引入次数较多的文件，打包到一个公有代码文件中。其中在我们的项目中使用到了一个自有的小程序组件库，在webpack的打包构成中也会引入进来。
  #### 2.1 mpvue打包后的包结构
  ![mpvue打包的最终文件夹](http://ninico.top/img/minipro-package-size-optizition/mp-dist-dir.jpeg)
  这里除了pages业务分包文件夹，其他的文件都是主包的内容。但是不用担心，这里我们只看common、static两个文件夹就可以了。因为这两个文件夹一个公共库提取的部分，一个自有小程序组件的部分。占到了主包体积的84%
  #### 2.2 common中的vendor.js
  vendor.js是common的主体部分，是通过webpack的CommonsChunkPlugin插件提取出来的公有库文件。
  我们来看webpack的包分析插件BundleAnalyzerPlugin给出的分析结果。
  ![BundleAnalyzerPlugin分析结果](http://ninico.top/img/minipro-package-size-optizition/bundle-analyzer.jpeg)
  右边的src是业务逻辑里面使用到的公有库代码不是我们的优化的目标，我们看到node_modules一共是1.51M的体积，是我们重点要处理的，但是这里bundle-analyzer给出的分析是很不详细而且是不准确的，比如说core-js（babel的语法垫片）体积只有71kb在这里确是图示的一半。
  #### 2.3 CommonsChunkPlugin
  CommonsChunkPlugin是webpack在打包时用力提取公共代码的插件。
  我决定在CommonsChunkPlugin里做一些修改，既然vendor.js是通过CommonsChunkPlugin打包出来的，我们就可以让它打印出更加详细一些的信息。
  {% highlight javascript %}
  // 分析打包入公共提取包的文件，获得更多的细节。
  var minChunkBuildAnalyzer = (function() {
    var countObj = {}
    return function (module) {
      var getModuleName = function (resource) {
        var resourceArr = resource.split('/') || []
        var incNodeModules= resource.includes('node_modules')
        var nodeModulesIndexOf = resourceArr.indexOf('node_modules')
        var incStore = resource.includes('/src/store/')
        var incMockjs = resource.includes('/src/mock/')

        return incNodeModules ? resourceArr[nodeModulesIndexOf + 1] :
                    incStore ? 'VuexStore' :
                    incMockjs ? 'MockjsConfig' :
                                  resource
      }

      var source = module.resource || ''
      var moduleName = getModuleName(source)
      countObj[moduleName] = (countObj[moduleName] || 0) + module.size()
      if (module.resource.includes('outboundFormMixin.js')) {
        var ouputArr = Object.keys(countObj)
        ouputArr.sort(function(a, b) {
          return countObj[a] > countObj[b] ? 1 : -1
        })
        console.log(ouputArr.map(function(i) {
          var obj = {}
          obj.name = i
          obj.count = (countObj[i] / 2048).toFixed(2) + 'kb'
          return obj
        }))
        countObj = {}
      }
    }
  })()
  {% endhighlight %}
  我们在代码里简单的做个分类，node_modules中的引入文件我们直接打印出来，而在src中分出VuexStore,和MockjsConfig这两个零碎但是占比大的文件类型来进行累计。最后把它们按照体积来简单的排个序，这里我们偷个懒，直接定位到最后打包的文件时输出信息。当然你也可以写一个webpack插件，在打包结束时来打印这些信息。
  {% highlight javascript %}
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common/vendor',
        minChunks: function (module, count) {
          var need = (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf('node_modules') >= 0
          ) || count > 1
          if (need && process.evn.common_chunk_report) {
            minChunkBuildAnalyzer(module)
          }
          // any required modules inside node_modules are extracted to vendor
          return need
        }
    })
{% endhighlight %}
  这里我们简单的修改以下CommonsChunkPlugin组件中的配置，添加了一个环境变量来控制组件是否执行。以下是这个函数的输出结果。
  {% highlight javascript %}
[
  // 这里只列出体积较大的前几个，其他的省略。
  {
    name: 'src/components/carSearchInput.vue',
    count: '6.08kb'
	},
	{
		name: 'src/pages/ticketFollowManage/components/uploadImages.vue',
		count: '7.34kb'
	},
	{
		name: 'src/components/uploadImages.vue',
		count: '7.42kb'
	},
	{
		name: 'src/login/index.js',
		count: '8.29kb'
	},
	{
		name: 'qs',
		count: '10.77kb'
	},
	{
		name: 'regenerator-runtime',
		count: '12.33kb'
	},
	{
		name: 'vuex',
		count: '12.75kb'
	},
	{
		name: 'flyio',
		count: '14.99kb'
	},
	{
		name: 'mpvue-entry',
		count: '16.63kb'
	},
	{
		name: 'MockjsConfig',
		count: '25.28kb'
	},
	{
		name: 'VuexStore',
		count: '33.47kb'
	},
	{
		name: 'core-js',
		count: '36.71kb'
	},
	{
		name: 'mpvue',
		count: '72.99kb'
	},
	{
		name: 'mockjs',
		count: '116.32kb'
	},
	{
		name: 'echarts',
		count: '142.33kb'
	},
	{
		name: 'lodash',
		count: '324.99kb'
	}
]
{% endhighlight %}
  这次我们拿到了更加细致的打包信息，上马就有了优化的思路。
  1. 我们看到lodash有夸张的325kb之多，但是我们在项目里只是用到了一个函数，这是不应该的。
  2. echarts也有142kb的体积，但是我们只有在一个页面用到了echarts，所以我们应该把它分离出主包。
  3. mockjs是我们本地的开发环境下使用的模拟数据工具，和其数据配置一起算有140kb之多，为了减少我们开发环境下的主包大小。这里我们可以把它移出本地。
   
### 3. lodash的引入
查看项目代码，发现在项目中lodash的引入方式是这样
  {% highlight javascript %}
  import { debounce as _debounce } from 'lodash'
{% endhighlight %}
这样的引入方式是会将整个lodash的包都引入到js中的。而lodash提供了我们引入单个的fn的方法。
  {% highlight javascript %}
  import * as _debounce from 'lodash/debounce'
{% endhighlight %}
这样的话我们就可以只引入lodash中的debounce函数所包含的js包了。我们将项目中所有的lodash引入方式做一次修改，跑一次我们的分析函数。
  {% highlight javascript %}
{ name: 'lodash', count: '61.39kb' }
{% endhighlight %}
现在lodash打入包的体积只有61kb了。
#### 3.1 lodash在小程序中的兼容问题。
值得一提的是，lodash有一些方法使用到了js全局的函数像是Math。但是在小程序中对于全局对象的识别可能会有误。
  {% highlight javascript %}
/***
 lodash中识别宿主对象的函数部分。 
 ***/

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();
{% endhighlight %}
上面这段函数识别到的对象是小程序中的global对象，感兴趣的同事可以，copy代码到小程序开发环境中执行以下。然而小程序中的global对象上是不会挂载像Math、Regex、Symbol等这样的全局对象和方法的。所以我们需要在项目的入口文件中加入一段兼容性的代码。如下所示。
  {% highlight javascript %}
// 这段代码用来兼容lodash
Object.assign(global, {
  Array: Array,
  Date: Date,
  Error: Error,
  Function: Function,
  Math: Math,
  Object: Object,
  RegExp: RegExp,
  String: String,
  TypeError: TypeError,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
})
{% endhighlight %}
事实上lodash这段对于宿主对象的识别方式，是被广泛应用的。所以在使用其他库的时候我们也需要注意这个问题。

### 4. echarts 的打包
要将echarts打入到别的子包也是很容易的，我们只需要简单修改一下CommonsChunkPlugin的配置就可以了。
  {% highlight javascript %}
  var need = (
    module.resource &&
    /\.js$/.test(module.resource) &&
    module.resource.indexOf('node_modules') >= 0 && count > 1
  ) || count > 1
  return need
  {% endhighlight %}
  这里我们将判断是否需要打入公共包的判断条件改一下，在node_modules的判断中加上一个限制:count > 1,这样只有被引入过两次的node_modules包才会被打入到公共的js包中。这样echarts就只会被打包到使用到它的分包中了。
  --- --- 
  然而echart只是在车辆估计参考中，一个线性的统计图里用到了。我觉得echarts在这里有点大才小用了，其实我们完全可以自己用canvas，来实现这里的线性统计图的需求。而现在打开查看参考估价，我们可以感受到明显的等待时间。所以这里是可以进一步优化的。
  ### 5. mockjs脱离出开发环境下的主包
  这里我的处理方式是，新建一个node.js的服务来提供mockjs的模拟数据，代替mockjs在本地拦截http请求制造mock数据的方式。
  #### 5.1 node端的代码实现
  {% highlight javascript %}
  /***
  **  mock-server.js
  **
  ***/

const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const Mock = require('mockjs')
// 引入mock规则配置
const mockPath = path.resolve(__dirname, '../mock')
const config = require('../config')
const mockRules = require(mockPath)


// 提供一个接口，供前端同步mockServer中声明的mock配置的api。
router.get('/get_mock_rules', function (res, res, next) {
    let rules
    try {
      rules = mockRules.map((r) => ({
        regex: r.regex.toString(),
        method: r.method
      }))
    } catch (e) {
      console.log(e)
      res.send({
        code: 500,
        message: 'mock服务异常'
      })
    }
    res.send({
      code: 0,
      message: 'ok',
      rules: rules
    })
})


// 匹配到的api都会在这里处理，返回对应的mock数据。
router.use((req, res, next) => {
    const reqUrl = req.url
    const method = req.method
    const rule = mockRules.find((r) => {
      return r.regex.test(reqUrl) && method === r.method.toLocaleUpperCase()
    })
    if (!rule) {
      next()
      return
    }
    if (rule.mockData instanceof Function) {
      res.send(Mock.mock(rule.mockData(req)))
      return
    }
    res.send(Mock.mock(rule.mockData))
})

// 这里对path中前缀为/_mock_req_的接口做处理
app.use('/_mock_req_', router)

app.listen(config.dev.mockServerPort, 'localhost', function() {
    console.log('mock 服务运行在端口' + config.dev.mockServerPort)
})
{% endhighlight %}
在mockServer中主要有两个逻辑，一个是获取在mockServer中配置的api列表，前端拿到这个列表会在ajax中对列表中的api加上 **/_mock_req_** 的前缀。为系统的网络代理提供转发的标识。
  {% highlight javascript %}
/***
** mock数据配置文件示例
** mock/my.js
***/

module.exports = [
  /**
   * 个人信息
   */
  [/my\/profile/, 'get', {
    'code': 0,
    'message': 'ok',
    'data': {
      'store_name': '测试门店',
      'store_id': 11,
      'user_name': '张三',
      'roles': [ "二手车经理", "二手车评估师", "财务"],
      'cbs_balance': '1000000',
      'invite_code': 'ABCDDD'
    }
  }],

  /**
   * 我的收车
   */
  [/my\/statistics/, 'get', {
    'code': 0,
    'message': 'ok',
    'data': {
      'tickets': {
        'day': '111',
        'month': '112'
      },
      'evaluates': {
        'day': '111',
        'month': '112'
      },
      'self_brand_stock_ins': {
        'day': '100',
        'month': '111'
      },
      'other_stock_ins': {
        'day': '122',
        'month': '133'
      }
    }
  }]
]

// 配置文件的风格尽量贴合之前前端使用的Mock的api方法
// Mock.mock(url<regex>, method<string>, mockConfig<object>),
// 这样要复用原先的mock数据，也不会有太大的修改成本


/***
** mock配置最终的导出文件
** mock/index.js
***/
const connectMockRules = function() {
  const total = []
  Array.prototype.forEach.call(arguments, (next) => {
    total.push(...next.map((rule) => {
      const [regex, method, mockData] = rule
      return {
        regex,
        method,
        mockData
      }
    }))
  })
  return total
}

module.exports = connectMockRules(
  /**
   * all mock data
   */
  // 登陆态验证
  require('./auth/auth'),

  // 车辆列表
  require('./usedCar/carList'),
  // 评估车辆照片
  require('./evaluate/carPhoto'),
  // 评估车辆信息
  require('./evaluate/carInfo'),
  // 车辆拍卖
  require('./auction'),
  // 我的
  require('./my/my')
)

{% endhighlight %}
  #### 5.2 前端的代码实现
  {% highlight javascript %}
// 项目中封装的小程序http
this.$http = (url, data, options) => {
  let isMocking
  let mockRules
  try {
    // mock的控制开关
    isMocking = wx.getStorageSync('isMocking')
    // 需要进行转发的mock接口，在mockServer中的/get_mock_rules接口中获取
    mockRules = wx.getStorageSync('mockRules') || []
  } catch (e) {
    console.log(e)
  }
  // mock 状态时处理方式
  this.setInterceptors(options)
  if (isMocking && process.env.NODE_ENV !== 'production' && mockRules.find((r) => {
    var parts = /\/(.*)\/(.*)/.exec(r.regex)
    var restoredRegex = new RegExp(parts[1], parts[2])
    return restoredRegex.test(url) && r.method.toUpperCase() === options.method.toUpperCase()
  })) {
    const urlArr = url.split('/')
    // 为匹配的接口path加上_mock_req_前缀
    urlArr.splice(3, 0, '_mock_req_')
    return this.fly.request(urlArr.join('/'), data, options)
  }
  // 获取需要mock的url数组
  return this.fly.request(url, data, options)
}
{% endhighlight %}

#### 5.3 MacOs环境下代理工具charls的配置
配置如下
![charls](http://ninico.top/img/minipro-package-size-optizition/charls-config.png)
#### 5.4 使用时候的注意事项
1. 微信开发者工具： 设置-代理设置-使用系统代理
2. charls代理已开启
3. 小程序在开发模式下，点击标题栏的mock按钮开启mock，如有新增匹配接口，点击同步mock配置。

### 6 自有组件库wxapp-lui的地址组件大小优化
在我们的项目中使用到了一个自有的小程序组件库wxapp-lui，在webpack的打包构成中也会引入进来，在项目中则是打入到static目录中，和项目中使用的静态图片一起。其中打包进地址数据的address组件大小有324kb，有很大的优化空间。再者因为wxapp-lui项目编译并不支持npm包的引入，所以address组件引入的地址数据是单独以文件的方式引入的，和公司其他项目中使用city-data的npm包管理地址数据的方式不同。这次一并做了修改。
#### 6.1 npm包引入的支持
这里先是按照小程序上对npm支持的方式做了一次npm引入，发现并不理想，管理起来也不方便，这个方案被废弃掉了。这里具体的原因不做赘述。最后我决定用[rollup](https://github.com/rollup/rollup)直接把npm包中的源码打入到小程序组件的源码中。配置的代码如下。
  {% highlight javascript %}
const { uglify } = require("rollup-plugin-uglify");
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const fs = require('fs');
const path = require('path');
const del = require('del')
const dependencies = require('./package.json').dependencies

const isProd = process.env.NODE_ENV === 'production'
const pathRoot = 'src/'
const pathConfig = {
  root: pathRoot,
  less: pathRoot + '**/*.less',
  wxs: pathRoot + '**/*.wxs',
  json: pathRoot + '**/*.json',
  wxml: pathRoot + '**/*.wxml',
  js: pathRoot + '**/*.js',
  output: {
    dir: isProd ? 'dist' : 'examples/dist',
    examples: 'examples/dist'
  }
}

// 遍历目录找到所有js文件，并返回路径
const mapDirJsFile = function(dir) {
    const entryConfig = {}
    const res = fs.readdirSync(dir)
    res.forEach((file) => {
        const resFile = fs.statSync(path.join(dir, file))
        if (!resFile.isDirectory()) {
          return
        }
        const resDir = fs.readdirSync(path.join(dir, file))
        resDir.forEach((f) => {
          if (!/\.js$/.test(f)) {
            return
          }
          entryConfig[file + '/' + f.replace(/.js$/, '')] = `${dir}${file}/${f}`
        })
    })
    return entryConfig
}

// 清理编译目录
export const clean = () => {
  return del([ pathConfig.output.dir ]);
}

export const compileJs = () => {
    // 这里的两个插件，用来解析js文件中的npm包引入，并打包到编译后的代码中
    let plugins = [
      resolve({
        // 为了提高编译的效率，所使用的node_modules依赖请在这里声明
        dedupe: Object.keys(dependencies).map((k) => new RegExp(k))
      }),
      commonjs({
        include: Object.keys(dependencies).map((k) => new RegExp(k))
      })
    ]
    if (isProd) {
      plugins = [
        ...plugins,
        babel({
          "plugins": [
            [
              "transform-remove-console",
              {
                "exclude": [ "error", "warn"]
              }
            ]
          ],
          "exclude": "node_modules/**"
        }),
        uglify()
      ]
    }
    return rollup.rollup({
      // 所有src下的js文件作为编译的入口
      input: mapDirJsFile(pathConfig.root),
      plugins
    }).then(bundle => {
        return bundle.write({
          dir: pathConfig.output.dir,
          // 再输出到对应的编译后的目录下
          entryFileNames: '[name].js',
          format: 'cjs'
        })
    })
};
{% endhighlight %}
更多细节和原理可以查看rollup的文档。
#### 6.2 address组件地址数据格式的修改
address的地址数据，和我们之前在企业号移动端组件库，cvux中address组件使用的格式是一样的。这套格式存在很多冗余的数据。
  {% highlight javascript %}
const cvux = [
  {
    "name": "北京市",
    "value": "110000"
  },
  {
    "name": "北京市市辖区",
    "value": "110100",
    "parent": "110000"
  },
  {
    "name": "东城区",
    "value": "110101",
    "parent": "110100"
  },
  {
    "name": "西城区",
    "value": "110102",
    "parent": "110100"
  },
  {
    "name": "朝阳区",
    "value": "110105",
    "parent": "110100"
  },
  {
    "name": "丰台区",
    "value": "110106",
    "parent": "110100"
  },
  {
    "name": "石景山区",
    "value": "110107",
    "parent": "110100"
  },
  {
    "name": "海淀区",
    "value": "110108",
    "parent": "110100"
  },
  {
    "name": "门头沟区",
    "value": "110109",
    "parent": "110100"
  },
  {
    "name": "房山区",
    "value": "110111",
    "parent": "110100"
  },
  {
    "name": "通州区",
    "value": "110112",
    "parent": "110100"
  }
  ...
{% endhighlight %}
我们可以看到```"parent": "110100"```这一条就出现了很多次。我发现wxapp-lui中的address组件，在逻辑上对与格式并不是很依赖。直接把它的数据源改成后台的源数据。
  {% highlight javascript %}
{
  86: {
      110000: '北京市',
      ...
  },
  110000: {
    110100: '北京市市辖区'
  },
  110100: {
    110101: '东城区',
    110102: '西城区',
    110105: '朝阳区',
    ...
{% endhighlight %}
显然上面的结构简洁了很多。再稍微修改一下address内部的逻辑代码就完成了。编译以后大小降到了100kb，如果觉得还是挺大的，后面我们可以直接把这个数据放到cdn上。压缩以后也只有74kb的大小了。

## 总结
经过这一系列的修改后，我们的门店小程序在开发环境下的主包大小已经降到了1580kb，正式环境下736kb。减少了将近一半体积的主包大小。

### 一个小提示
微信开发工具上面介绍的性能面板，使用开发版本打开。抓包发现扫码打开的开发版本会下载全部的代码，包括分包和主包。所以在这个场景下，上面关于小程序打开时的性能参数就没有了参考价值。