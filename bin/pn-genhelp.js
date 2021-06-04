#!/usr/bin/env node
require('../');

const
	fs = require('fs'),
	os = require('os'),
	path = require('path'),
	cp = require('child_process'),
	program = require('commander');


let mPath = '';

// 遍历
function traverse(dir, subdir = ''){
	let _files = fs.readdirSync(dir);
	for(let _file of _files){
		let __file = path.join(dir, _file);
		let stat = fs.statSync(__file);
		if (stat.isDirectory()) {
			traverse(__file, _file);
		} else if (/\.js$/.test(__file)) {
			genHelp(__file, path.join(mPath, 'help', subdir, _file));
		}
	}
}

function genHelp(source, destination) {
	console.log(source);
	let jsdoc_cmd = 'jsdoc';
	if (os.platform() === 'win32') jsdoc_cmd = 'jsdoc.cmd';
	let template = path.join(nirvana.rootPath, 'jsdoc', 'help');

	let jsdoc = cp.spawn(jsdoc_cmd, [source, '-t', template, '-d', destination]);
	jsdoc.stderr.on('data', data => {
		nirvana.error(new Error(data.toString()));
	})
	jsdoc.on('error', err => {
		nirvana.error(err);
	})
	jsdoc.on('close', code => {
		if (code != 0) nirvana.error(new Error(`exitcode: ${code}`));
	})
}

// jsdoc huawei.me60.js -t jsdoc -d ./help
// pn genhelp dev
program
	.version('0.0.1')
	.arguments('<module> [controller]')
	.description('生成帮助文档', {
		module: '指定模块名称',
		controller: '指定控制器名称'
	})
	.option('-e, --exclude <controller>', '排除指定控制器')
	.action((mod, ctl) => {
		if (!nirvana.config.modules.hasOwnProperty(mod)) {
			console.log(mod, '模块不存在');
			process.exit();
		}

		mPath = nirvana.config.modules[mod];
		traverse(path.join(mPath, 'controller'));
	})
	.parse(process.argv);

if (program.args.length == 0){
	program.help();
	process.exit();
}

