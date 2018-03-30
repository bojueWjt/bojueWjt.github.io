---
layout: post
title: 在Vue中使用Typescript体验报告
categorise: vue typescript
---

TypeScript是JavaScript的静态语言超集，配合上工具可以让我们在编译前，就发现程序中的错误。严格的语法校验可以控制代码质量，特别适合在大型、研发周期长、多人协作的项目中使用。可以有减少程序代码熵值的扩大速度。

## Boss项目的TypeScript的环境搭建
这里Vue在2.5以后的版本中，在Vue-Cli中集成了拥有Typescript环境的项目模版，可以直接生成，开箱即用还是很方便的。

## 关于Typescript的依赖库介绍
### vue-class-component
**vue-class-componet**使得我们用上更优雅的语法创建一个Vue的组件。它的风格类似React的Mobx框架使用的@修饰符。

    ``
    // 项目中用vue-class-component实现的LeftNav组件
    
    import  Component  from  'vue-class-component'
    import  Vue  from  'vue'
    @Component({
      props: {
        userInfo:  Object
        }
     })
     export  default  class  LeftNav  extends  Vue{
       go (path) {
         this.$router.push({path})
       }
       get  hasStoreManage() {
         return
           this['userInfo'].hasStoreManageAuthority
         }
       get  hasUsedCarManage() {
         return  this['userInfo'].hasUsedCarAuthority
         }
     }
``
围绕着**vue-class-component** 有许多的其他用于vue和Typescript项目中的库，像是**vue-property-decorator** 和我们下面要介绍的**vuex-class**。它们的实现都是基于**vue-class-compoent**中的自定义修饰器语法来实现的，感兴趣的同学可以去github翻翻它们的源码，内容也并不多，自己来写一套用于Vue的修饰器是不是很酷呢。

### vuex-class
**vuex-class** 是我们为了更好的搭配vuex在项目中使用的一个依赖工具。在使用到Typescript语法的时候，原来项目中使用的注入Action、和getter的mapAction、mapGetter这样的方法已经不在试用了。甚至会产生报错。**Vuex-class**就是解决这个层面的问题的。它提供给我们“@Action、@Getter、@State”等方法来帮我们注入Vuex中的状态和方法
``
	在carDetail中使用的Vuex-class
	
    import  Vue  from  'vue'
    import  Component  from  'vue-class-component'
    import  container  from '../../components/container.vue'
    import { Action, Getter } from  'vuex-class'
    @Component({
		components: {
		   container
	   }
     })
     export  default  class  carDetail  extends  Vue {
     @Action('getEnquiryCarDetail') getCarDetail
     @Getter('enquiryCarDetail') carDetail
     ``

## Typescript中的接口

在本次项目中，我们使用接口的场景是有限的。只有在实现Rest对象和Vuex中使用Interface。其实在React的项目中，Typescript的interface属性很多时候，应用在component的定义中。
在后端的世界利接口是构建大项目时，对结构解耦的重要特性，在前端的世界里接口主要还是应用在component的定义中。

## 项目中的开发体验
使用Typescript中的接口，在我们使用其他引入近来的模块和方法的时候，可以得到很完整的语法提示。
Typescript也强制着你去声明和定义使用的props, state的结构和类型。在我们编写组件的时候这点格外的重要，他的规范，节省了我们使用和理解组件的时间。很适合多人的分工协作。
而对于结构的声明，则在前端层面上避免了，访问较长路径时（this.props.detail.userinfo.name）可能会出现的错误，让我们的项目更加的安全。他在一定层面上限制了我们去犯一些低级的语法错误。

在Vuex层面，可以使用Vuex提供的types来声明和定义Vuex中的各类getters、actions等。这样在程序不符合期望的结构的时候，我们可以在代码编译前就知晓错误。

但是对于它的规范的理解还是需要成本的。像是一些Vue对象全局的混入和方法，Typescript可能无法识别它的结构，造成出错。
而且在引入Typescript也会增加你一定的代码量，因为你的一些声明的工作和代码变多。这个也无可厚非。


## 项目总结
Typescript还是有它适用的场景的，想我们前面所说的那样，当我们的项目结构比较复杂、参与人数较多、开发周期长的时候，我们可以用Typescript来管理我们的代码质量。
但是在项目中使用Typescript的意义就不大了，反而带来了很多的限制。
