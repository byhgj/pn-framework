# Phoenix Nirvana Framework

pn-framework是实现Module-Controller-Action架构的基础框架。提供全局nirvana对象，支持如下特性：
+ nirvana.Module: 基础模块类
+ nirvana.Controller: 基础控制器类
+ nirvana.debug: 默认false, 调试开关，打开后可显示详细错误信息
+ nirvana.log: 类似console.log
+ nirvana.assert: 断言，出现错误callback
+ nirvana.module: 调用模块，首先执行自定义模块内bootstrap.js文件初始化模块，如加载模块配置文件
+ nirvana.controller: 实例化指定模块类中实现的控制器类
+ nirvana.action: 执行指定模块、控制器的方法

## 基于此框架开发的应用架构
默认文件夹结构
\+ pn-module-demo          // 你的模块文件夹名称
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
	// testAction(param, _param) {
	testAction(param) {
		console.log(p);
	}
}
```
>此处实现了一个简单的test方法

## 调用自定义模块
```javascript
require('./nirvana');

// 方法1
let m = nirvana.module('./pn-module-demo');
let c = m.controller('controller1');

// 方法2
let c = nirvana.controller('./pn-module-demo', 'controller1');

// 使用上面两种方法调用action方法，并提供参数供testAction调用
c.action('test', {a:1, b:4});

// 方法3
nirvana.action('./pn-module-demo', 'controller1', 'test', 'test message'.toUpperCase())

// 方法4：全局方式调用，需注册模块
pn reg demo ./pn-module-demo // 请使用绝对路径
nirvana.run('demo:controller1/test?a=1&b=2').then(data => {
	nirvana.show(data);
})

// 方法5: pn命令行方式调用，同上需注册模块
pn run "demo:controller1/test?a=1&b=2"
pn "demo:controller1/test?a=1&b=2"
```

.action返回promise对象

## 附加应用
- pn-cli: pn命令行
- pn-console: 执行pn console调用，进入互动模式
- pn-server: 执行pn server调用，进入rest服务模式，默认监听9002端口