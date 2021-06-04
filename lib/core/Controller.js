/**
 * 调用action顺序
 * module/bootstrap.js // 仅在初始化模块实例时
 * controller/__init  // 仅在初始化controller实例时
 * controller/__before // 每次调用action前
 * controller/xxxAction
 * controller/__after // 每次调用action后
 * controller/__final // 仅在析构controller实例时
 */
const path = require('path');
module.exports = class {
	constructor() {
	}
	// sync, called by module
	__init() {

	}
	__final() {

	}
	// called by action
	async __before(action, param) {
		return param;
	}
	// called by action
	async __after(action, data) {
		return data;
	}
	// 调用继承类的xxxAction方法
	async action(name, param) {
		let method = `${name}Action`;
		nirvana.assert(this[method], `方法${method}不存在`);

		let _param = await this.__before(name, param);
		// let data = await this[method](param, _param);
		let data = await this[method](_param);
		let _data = await this.__after(name, data);

		return _data;
	}
	// 没有在初始化时导入help，仅在调用help时才require
	async helpAction(param = {a: ''}){
		try {
			const _help = require(path.join(this.module.path, 'help', this.className));
			return (param.a === '') ? _help : (_help[param.a] || null);
		} catch(err) {
			return null;
		}
	}
}