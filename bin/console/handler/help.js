const
	esprintf = require('esprintf');

module.exports = function() {
	[
		['help', '帮助'],
		['exit', '退出控制台'],
		['module [module name]', '选择指定模块，未指定模块名称则显示所有模块'],
		['controller [controller name]', '选择指定控制器，未指定控制器名称则显示所有控制器'],
		['action [action name]', '选择指定动作，未指定动作名称则显示所有动作'],
		['run', '执行动作'],
		['option', '查看参数'],
		['set <key> <value>', '设置变量值'],
		['unset <key>', '删除变量'],
		['cache', '查看缓冲区变量'],
		['cache get <key>', '获取缓冲变量'],
		['cache set <key> <value>', '存储到缓冲'],
		['cache unset <key>', '删除缓冲变量'],
		['<module>:', '直达指定模块'],
		['<module>:<controller>', '直达指定控制器'],
		['<module>:<controller>/<action>', '直达指定动作'],
		['payload <module>:<controller>', '加载payload'],
	].map(item => {
		console.log(esprintf('%-40s %s', item[0], item[1]));
	})
}