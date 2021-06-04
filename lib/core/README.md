# phoenix nirvana framework

pn-framework是实现Module-Controller-Action架构的基础框架。提供全局nirvana对象，支持如下特性：
+ nirvana.Module, 基础模块类
+ nirvana.Controller, 基础控制器类
+ nirvana.debug, 调试开关，打开后可显示详细错误信息
+ nirvana.assert, 断言，出现错误默认退出应用
+ nirvana.module, 实例化你的模块类
+ nirvana.controller, 实例化指定模块类中实现的控制器类
+ nirvana.action, 执行指定模块、控制器的方法

## 基于此框架开发的应用架构
默认文件夹结构
\+ pn-demo          // 你的模块文件夹名称
	\- bootstrap.js // 用于初始化你的模块
	\+ controller   // 默认的控制器文件夹名称
		\- controller1.js  // 控制器文件，文件名任意
	\+ config       // 框架以外，你自行定义的，里面的配置由你在bootstrap中实现读入
		\- index.js
	\+ help         // 其他自定义文件夹

### 模块初始化bootstrap.js
```javascript
module.exports = class extends nirvana.Module {
	constructor(name) {
		super(name);
		// todo: get config
		this.config = require('./config');
	}
}
```

### 控制器controller/controller1.js
```javascript
module.exports = class extends nirvana.Controller {
	constructor() {
		super();
	}
	__init() {
		super();
		// 控制器初始化，对象实例化时执行一次
	}
	// 每次执行action前调用一次
	async __before(name, param) {
		let _param = super.__before(name, param);
		return _param; // 返回更新后的param参数，供xxxxAction调用
	}
	// 每次执行action后调用一次
	async __after(data) {
		// 此处对data进行后期处理
		return data;
	}
	// _param是隐藏参数，由__before返回
	testAction(param, _param) {
		console.log(p);
	}
}
```
>此处实现了一个简单的test方法

## 调用自定义模块
```javascript
require('./nirvana');

// 方法1
let m = nirvana.module('./pn-demo');
let c = m.controller('controller1');

// 方法2
let c = nirvana.controller('./pn-demo', 'controller1');

// 使用上面两种方法调用action方法，并提供参数供testAction调用
c.action('test', {a:1, b:4});

// 方法3
nirvana.action('./pn-demo', 'controller1', 'test', 'test message'.toUpperCase())
```

.action返回promise对象

## 基于此框架的模块应用
- pn-manage 模块管理
- pn-console 交互式应用命令行, 已嵌入pn-manage
- pn-equip
- pn-httpserver

## 执行顺序
* nirvana.module
	* module/bootstrap.js // 继承自nirvana.Module，如果有，moduleInstance从此实现
	* moduleInstance = new nirvana.Module // 默认实例实现
* Module: controllerInstance = new nirvana.Controller
* Module: controllerInstance.\_\_init()
* Controller: controllerInstance.\_\_before
* Controller: controllerInstance.action
* Controller: controllerInstance.\_\_after
