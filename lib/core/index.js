/**
 * 框架核心，不是类文件，全局变量nirvana
 * 基类: nirvana.Module, nirvana.Controller
 * nirvana.getInstance 从类文件生成实例
 * 方法: debug, log, error, assert, 
 *      nirvana.module, nirvana.controller, nirvana.action,
 *      
 */
const
	path = require('path'),
	fs = require('fs'),
	colors = require('colors');

global.nirvana = {
	rootPath: path.join(__dirname, '../../'),
	Module: require('./Module'),
	Controller: require('./Controller'),
	config: require('../../config'), // system config
	debug: false,
	log: console.log,
	error(err){
		if (this.debug) console.error(err.stack);
		else console.error(err.message.red);
	},
	assert(cond, message, callback) {
		if (!cond) {
			// console.log('断言:', message);
			if (typeof callback === 'function') callback();
			else throw new Error(`断言: ${message}`)
				// process.exit();
		}
	},
	// 获取模块实例
	getInstance(classname, opts) {
		const _Class = require(classname);
		let instance = new _Class(opts);
		instance.app = this;
		return instance;
	},
	/**
	 * 调用模块，首先执行自定义模块内bootstrap.js文件初始化模块，如读入模块配置文件
	 */
	module(module_path) {
		let _module = null;
		const bootstrap_filename = path.resolve(module_path, 'bootstrap.js');
		try {
			if (fs.existsSync(bootstrap_filename)) {
				_module = this.getInstance(bootstrap_filename, module_path);
				if (!(_module instanceof this.Module)) {
					_module = null;
					throw new Error('bootstrap没有正确继承nirvana.Module');
				}
			} else _module = new this.Module(module_path);
		} catch(err) {
			this.error(err);
		}
		return _module;
	},
	controller(module_path, controller_name) {
		const m = this.module(module_path);
		return m.controller(controller_name);
	},
	async action(module_path, controller_name, action_name, action_param) {
		const c = this.controller(module_path, controller_name);
		return await c.action(action_name, action_param);
	}
}
