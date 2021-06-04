#!/usr/bin/env node
require('../');
const path = require('path');
const fs = require('fs');
const qs = require('querystring');
const readline = require('readline');

const pnConsoleVersion = `Phoenix Nirvana Framework Console Version ${nirvana.version}`;

const help = {
	help: 'help [module] | [modulename [controller [action]]]',
	run: '执行命令，格式：run <module>:<controller>/action?paramlist',
	exit: '退出系统'
}

let app = {
	module: null,
	controller: null,
	action: null
}

function alias(cmd){
	const aliasList = {
		'?': 'help'
	}
	return Object.keys(aliasList).includes(cmd) ? aliasList[cmd] : cmd;
}

const func = {
	help(args='', callback){
		if (args !== '') {
			const param = args.split(/[ ]+/);
			if (param.length === 1) {
				// module list
				if (param[0] === 'module') {
					console.log('模块'.padRight(20), '路径');
					console.log('-'.repeat(80));
					for(let item of Object.keys(nirvana.config.modules)){
						console.log(item.padRight(20), path.normalize(nirvana.config.modules[item]));
					}
				} else {
					// controller list
					const mPath = path.normalize(nirvana.config.modules[param[0]]);
					console.log('模块名称:'.cyan, param[0]);
					console.log('模块位置:'.cyan, mPath);
					console.log('-'.repeat(80));

					console.log('控制器：'.cyan);
					let _dirs = fs.readdirSync(path.join(mPath, 'controller'||nirvana.options.controller_path));
					let controllerlist = [];
					for(let _dir of _dirs){
						let stat = fs.statSync(path.join(mPath, 'controller'||nirvana.options.controller_path, _dir));
						if (/\.js$/.test(_dir) && stat.isFile()) {
							let f = _dir.replace(/\.js$/, '');
							if (f !== 'base') console.log('    ' + f);
						}
					}
					console.log('\n详细帮助:'.cyan, `pn ${param[0]}:<controller>/help`);					
				}
			}
			if (param.length === 2) {
				// action list
				nirvana.run(`${param[0]}:${param[1]}/help`).then(result => {
					nirvana.help(result, {module: param[0], controller: param[1]});
					rl.prompt();
				})
			}
			if (param.length === 3) {
				// action parameter
				nirvana.run(`${param[0]}:${param[1]}/help?a=${param[2]}`).then(result => {
					nirvana.help(result, {module: param[0], controller: param[1], param: {a: param[2]}});
					rl.prompt();
				})
			}
			return;
		} else {
			// console help
			console.log(pnConsoleVersion.cyan);
			Object.keys(this).forEach(item => {
				console.log(item.padEnd(20), help[item] || '');
			})
		}
	},
	run(args, callback){
		nirvana.run(args).then(result => {
			process.stdout.clearLine(-1);
			process.stdout.cursorTo(0);
			const u = nirvana.parse(args);
			if (u.action === 'help') nirvana.help(result, u);
			else nirvana.show(result);
			if (typeof callback === 'function') callback(result);
		})
	},
	exit(){
		process.exit();
	}
}
func.help();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: '> ',
	tabSize: 4,
	completer(line){
		const completions = Object.keys(func);
		const hits = completions.filter((c) => c.startsWith(line));
		return [hits.length ? hits : completions, line];
	}
});

rl.prompt();
rl.on('line', line => {
	if (line.trim() === '') {
		rl.prompt();
		return;
	}
	const match2 = /^(.*?):(.*?)\/(.*)/.exec(line.trim());
	if (match2) {
		// 直接执行module:controller/action?paramlist格式
		func.run(line.trim(), function(){
			rl.prompt();
		});
		// rl.prompt();
		return;
	}
	const match = /(\S+)\s*(.*)/.exec(line.trim());
	if (!match){
		console.log('命令格式不对');
		rl.prompt();
		return;
	}
	const _cmd = alias(match[1]);
	if (!Object.keys(func).includes(_cmd)) {
		console.log('不支持的命令');
		rl.prompt();
		return;
	}
	if (typeof func[_cmd] === 'function') func[_cmd](match[2], function(){rl.prompt()});
	else console.log(func[_cmd]);
	rl.prompt();
})
rl.on('SIGINT', function () {
	rl.question('Are you Sure exit? (y/N)', (answer) => {
		if (answer.match(/^y(es)?$/i)) {
		    console.log('用户请求中断退出!');
			process.exit();
		}
		rl.prompt();
	});
});

process.on('uncaughtException',function(err){
	process.stdout.clearLine(-1);
	process.stdout.cursorTo(0);
	console.error(err.message);
});
process.on('unhandledRejection',function(err,promise){
	process.stdout.clearLine(-1);
	process.stdout.cursorTo(0);
	console.error(err.message);
	rl.prompt();
});
