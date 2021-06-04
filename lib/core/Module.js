/**
 * bootstrap 继承于此
 */
const path = require('path');
module.exports = class {
	constructor(module_path, opts) {
		nirvana.assert(module_path, '模块实例化时缺少参数');
		this.options = Object.assign({
			controller_extname: '.js',
			controller_path: 'controller'
		}, opts);
		this.path = module_path;
		this.config = {};
	}
	controller(name) {
		let controllerInstance = null;
		let controller_filename = path.resolve(this.path, this.options.controller_path, name) + this.options.controller_extname;
		try {
			controllerInstance = nirvana.getInstance(controller_filename);
			nirvana.assert(controllerInstance instanceof nirvana.Controller, `${name}没有正确继承nirvana.Controller`);
			controllerInstance.module = this;
			controllerInstance.className = name;
			controllerInstance.config = this.config;
			controllerInstance.__init();
		} catch(err) {
			throw err;
			// nirvana.error(err);
			// process.exit();
		}
		return controllerInstance;
	}
	help(){
		let controllers = [];
		let _dirs = fs.readdirSync(path.join(this.path, 'help'));
		let controllerlist = [];
		for(let _dir of _dirs){
			let stat = fs.statSync(path.join(this.path, 'help', _dir));
			if (/\.js$/.test(_dir) && stat.isFile()) {
				let f = _dir.replace(/\.js$/, '');
				if (f !== 'base') controllers.push({name: f, path: _dir});
			}
		}
		return controllers;
	}
}