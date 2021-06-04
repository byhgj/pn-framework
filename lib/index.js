require('./core');
require('./string');

nirvana.show = require('./show');

const
	path = require('path'),
	os = require('os'),
	fs = require('fs'),
	qs = require('querystring');

let userConfig = require(path.join(os.homedir(), '.userconfig.js')); //user config
nirvana.config = Object.assign(nirvana.config, userConfig);

nirvana.help = require('./help');
nirvana.pkg = JSON.parse(fs.readFileSync(path.join(nirvana.rootPath, 'package.json')));
nirvana.version = nirvana.pkg.version;

// 解析为对象格式: {module, controller, action, param}
nirvana.parse = function(u){
	let match = /^(.*?):(.*?)\/(.*)/.exec(nirvana.route(u));
	if (match) {
		let [, module, controller, _action] = match;
		let [action, param] = _action.split('?');
		if (param && param.indexOf('=') !== -1) param = qs.parse(param);
		return {module, controller, action, param};
	} else throw new Error('URI格式不符合要求: module:controller/action?paramlist');
}

// new_module = {path, name}
nirvana.modules = function(new_module) {
	if (!new_module.name) throw new Error('缺少模块名称');
	if (new_module.path === null) delete userConfig.modules[new_module.name];
	else {
		if (!new_module.path) throw new Error('缺少模块路径');
		if (!fs.existsSync(new_module.path)) throw new Error(`模块${new_module.name}路径${new_module.path}不存在`);
		if (userConfig.modules[new_module.name]) nirvana.log(`原路径是${userConfig.modules[new_module.name]}\n将更改到${new_module.path}`);
		userConfig.modules[new_module.name] = new_module.path;
	}
	Object.assign(nirvana.config, userConfig);
	fs.writeFileSync(path.join(os.homedir(), '.userconfig.js'), 'module.exports = ' + JSON.stringify(userConfig, null, 4));
}
nirvana.controllers = function(mod){
	const mPath = path.normalize(nirvana.config.modules[mod]);
	let _dirs = fs.readdirSync(path.join(mPath, 'controller'||nirvana.options.controller_path));
	let controllerlist = [];
	for(let _dir of _dirs){
		let stat = fs.statSync(path.join(mPath, 'controller'||nirvana.options.controller_path, _dir));
		if (/\.js$/.test(_dir) && stat.isFile()) {
			let f = _dir.replace(/\.js$/, '');
			if (f !== 'base') controllerlist.push(f);
		}
	}
	return controllerlist;
}
// 路由解析，解析为内部可识别格式: module:controller/action?params
nirvana.route = function(uri){
	for(let key in nirvana.config.route) {
		let route = nirvana.config.route[key];
		let _route = '';
		if (typeof route === 'string') _route = route;
		else if (typeof route === 'function') _route = route();
		else continue;
		uri = uri.replace(new RegExp(key), _route);
	}
	return uri;
}
// 快捷执行，无需module/controller/action分步骤实例化再执行
// 不采用回调，返回promise对象
nirvana.run = async function(uri){
	try {
		let u = (typeof uri === 'object') ? uri : nirvana.parse(uri);
		let modulePath = nirvana.config.modules[u.module];
		// if (data) {u.param = Object.assign({}, u.param, {data: data})}
		return await nirvana.action(modulePath, u.controller, u.action, u.param);
	} catch(err) {
		throw err;
	}
}
// 批量执行, param: [{uri: 'xxx', host: 'x.x.x.x', pon: '1/2/1'}, ...], 无返回值
nirvana.batch = async function(params, uri, callback){
	if (!(params instanceof Array)) params = [params];
	if (!callback) {
		callback = uri;
		uri = {};
	}
	for(let param of params) {
		try {
			param = Object.assign({uri}, param);
			let u = (typeof param.uri === 'object') ? param.uri : nirvana.parse(param.uri);
			let modulePath = nirvana.config.modules[u.module];
			delete param['uri'];
			let data = await nirvana.action(modulePath, u.controller, u.action, param);
			if (typeof callback === 'function') callback(data);
		} catch(err) {
			throw err;
		}
	}
	return null;
}
