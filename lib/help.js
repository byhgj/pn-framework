function controller(data){
	console.log(`${'动作'.padRight(15)}\t描述`.cyan);
	console.log('-'.repeat(80));
	for(let item in data) {
		if (item === 'default') continue;
		let helpitem = data[item];
		if (typeof helpitem != 'object') continue;
		console.log(`${item.padEnd(15)}\t${helpitem.description||''}`)
	}			
}
function action(data){
	let helpitem = data;
	console.log(helpitem.description);

	console.log(`${'参数'.padRight(15)}\t${'必须?'.padRight(10)}\t${'值'.padRight(20)}\t描述`.cyan);
	console.log('-'.repeat(80));

	for(let item of helpitem.params){
		let required = (item.required || typeof item.required === 'undefined') ? '是' : '否';
		let value = item.value || '';

		console.log(`${item.name.padRight(15)}\t${required.padRight(10)}\t${value.toString().padRight(20)}\t${item.description}`);
	}
}

module.exports = function(data, u) {
	if (!data) {
		console.log('没有发现帮助文档\n使用pn genhelp <module>自动生成，支持jsdoc文档语法');
		return;
	}
	if (u.param && u.param.a) {
		process.stdout.write(u.param.a+': ');
		action(data);
		if (data.usage) console.log(`\n用法: ${u.module}:${u.controller}/${u.param.a}${data.usage}`);
	} else {
		controller(data);
		console.log(`\n详细帮助:\n    ${u.module}:${u.controller}/help?a=<动作>`)
	}
}