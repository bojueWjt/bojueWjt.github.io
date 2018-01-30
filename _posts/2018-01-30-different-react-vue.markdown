---
layout: post
title: Vue和React的写法差异
categorise: react vue
---

## 引言
这里先上一篇文章
[React 和 Vue 特性和书写差异](https://juejin.im/entry/5922b23d128fe1005c3053b4 "React 和 Vue 特性和书写差异")
这篇文章介绍了，React和Vue的一些基本的特性的书写差异。不过文章中的React组件的代码段使用的是TypeScript的语法。和ECMA5差异也不是很多，大家可以先看一下。

此外Vue还提供了一些像是Computed、watch、mixins等特性，来提高开发者的开发效率。而React向来比较简介，下面主要说computed、watch、mixins这三个特性使用React的语法如何实现。

### 计算属性（computed）
```
<!-- Vue -->
<template>
 <div>
 	{{ fullName }}
 </div>
</template>

<script>
export default {
  computed: {
  	fullName: function() {
	   return this.firstName + this.LastName
    }
  }

  props: {
  	firstName: String
  }
}
</script>


<!-- React -->

class MyComponent extends React.Component {
	getFirstName() {
	   const {
	      firstName,
		  lastName
	   } = this.props

       return firstName + lastName
    }

	render() {
		return (
			<div>{ this.firstName() }<div>
		)
	}
}
```
在React里没有Computed和Methods这样的分别，每次Props的值或者State的值改变的时候，都回去触发Render方法的重现渲染


### 观察者（watch）
```
<!-- Vue -->
<template>
	<div id="watch-example">
  		<p>
    		Ask a yes/no question:
    		<input v-model="question">
  		</p>
  		<p>{{ answer }}</p>
	</div>
</template>

<script>
var watchExampleVM = new Vue({
  el: '#watch-example',
  data: {
    question: '',
    answer: 'I cannot give you an answer until you ask a question!'
  },
  watch: {
    // 如果 `question` 发生改变，这个函数就会运行
    question: function (newQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.getAnswer()
    }
  },
  methods: {
    // `_.debounce` 是一个通过 Lodash 限制操作频率的函数。
    // 在这个例子中，我们希望限制访问 yesno.wtf/api 的频率
    // AJAX 请求直到用户输入完毕才会发出。想要了解更多关于
    // `_.debounce` 函数 (及其近亲 `_.throttle`) 的知识，
    // 请参考：https://lodash.com/docs#debounce
    getAnswer: _.debounce(
      function () {
        if (this.question.indexOf('?') === -1) {
          this.answer = 'Questions usually contain a question mark. ;-)'
          return
        }
        this.answer = 'Thinking...'
        var vm = this
        axios.get('https://yesno.wtf/api')
          .then(function (response) {
            vm.answer = _.capitalize(response.data.answer)
          })
          .catch(function (error) {
            vm.answer = 'Error! Could not reach the API. ' + error
          })
      },
      // 这是我们为判定用户停止输入等待的毫秒数
      500
    )
  }
})
</script>

<!-- React -->
class Question extends React.Component {

	state = {
		question: '',
    	answer: 'I cannot give you an answer until you ask a question!'
	}

	componentWillUpdate(newProps, newState) {
		const newQuestion = newState.question
		if (this.state.question !== newState.question) {
			this.setState({
				answer: 'Waiting for you to stop typing...'
			})
			this.getAnswer()
		}
	}

	getAnswer () {
		// ...
		// 同上
	}

	handleOnChangeQuestion = (e) => {
		this.setState({
			question: e.target.value
		})
   }

	render() {
		const {
			answer,
			question
		} = this.state
		return (
		<div id="watch-example">
			<p>
				Ask a yes/no question:
				<input value={question} onChange={this.handleOnChangeQuestion}>
			</p>
			<p>{ answer }</p>
		</div>
    }
}
```

### 混合（mixins）

```
// Vue的Mixins

var mixin = {
  methods: {
    foo: function () {
      console.log('foo')
    },
    conflicting: function () {
      console.log('from mixin')
    }
  }
}

var vm = new Vue({
  mixins: [mixin],
  methods: {
    bar: function () {
      console.log('bar')
    },
    conflicting: function () {
      console.log('from self')
    }
  }
})
vm.foo() // => "foo"
vm.bar() // => "bar"
vm.conflicting() // => "from self"


// React原来有提供Mixins的功能，但是在后来的版本中废弃掉了，我们可以通过高阶组件的方式来实现相同的功能

function connectToMixins(Component) {
  const StoreConnection = React.createClass({

	mixin = {
		foo: function () {
		  console.log('foo')
		}
	}

    render() {
      return <Component {...mixin} />;
    }
  });
  return StoreConnection;
};


// 使用方式：

class Todolist extends React.Component {
    render() {
		const {
			foo,
			conflicting
		} = this.props

		foo() // => foo
		...
    }
}
TodolistContainer = connectToMixin(Todolist)
```
当然Vue也可以使用高阶组件的方式来实现Mixin啦，有兴趣的同学可以自己做一些，这里就不累述了。还有一点就是React不存在想全局注册Mixin这样的操作。
