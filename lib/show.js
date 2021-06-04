const moment = require('moment');

// 返回object类型: Array, Object, Number, String, Date
function objectType(n) {
	const type = Object.prototype.toString.call(n);
	let match = /\[object (.*?)\]/.exec(type);
	return match ? match[1] : ('Unknown: ' + type);
}

module.exports = function(data, opts){
	if (!data || Object.keys(data).length === 0) return;
	if (objectType(data) === 'String') {
		console.log(data);
		return;
	}
	let options = Object.assign({
		hasTitle: true, // 仅二维是数组时有效，json默认有标题
		lineNumber: false, // 显示行号
		showTitle: true
	}, opts);

	if ((objectType(data) === 'Object' && Object.keys(data).length===0) ||
		(objectType(data) === 'Array' && data.length === 0)) {
		console.log('no data');
		return;
	}

	// json数组化
	let head = [], body = [];
	if (data instanceof Array) {
		if (objectType(data[0]) === 'Array') {
			if (options.hasTitle) head = data.shift();
			body = data;
		} else if (objectType(data[0]) === 'Object') {
			head = Object.keys(data[0]);
			body = data.map(item => {return Object.values(item)});
		} else {
			console.log(data);
			return;
		}
	} else if (typeof data === 'object') {
		head = Object.keys(data);
		body = [Object.values(data)];
	}

	let fieldLength = [];

	// 计算字段长度
	head.map((v, k) => {
		if (!fieldLength[k]) fieldLength[k] = 0;
		if (fieldLength[k] < String(v).byteLength) fieldLength[k] = String(v).byteLength;				
	})
	body.map(item => {
		item.map((v, k) => {
			if (v instanceof Date) {
				item[k] = moment(v).format('YYYY-MM-DD HH:mm:ss').toString();
				v = item[k];
			}
			if (fieldLength[k] < String(v).byteLength) fieldLength[k] = String(v).byteLength;
		});
	});
	// 显示
	if (options.showTitle && head.length>0) {
		head.map((v, k) => {
			process.stdout.write(String(v).padRight(fieldLength[k]));
			process.stdout.write(' ');		
		})
		process.stdout.write('\n');
	}
	body.map((item, idx) => {
		if (options.lineNumber){
			process.stdout.write(String(idx+1).padRight(4));
			process.stdout.write(' ');
		}
		item.map((v, k) => {
			process.stdout.write(String(v).padRight(fieldLength[k]));
			process.stdout.write(' ');
		});
		process.stdout.write('\n');
	})
}
