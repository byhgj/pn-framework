#!/usr/bin/env node
require('../lib');
const
	path = require('path'),
	fs = require('fs'),
	program = require('commander'),
	colors = require('colors'),
	CronJob = require('cron').CronJob;

process.on('uncaughtException', function (err) {
	nirvana.error(err);
    process.exit();
});

program.version(nirvana.pkg.version)

program
	.command('run <uri>', {isDefault: true})
	.description('运行, 默认')
    .usage('<module:controller/action?param1=value1&param2=value2&...> [options] ')
    .option('-d, --debug', '调试')
    .option('-s, --silent', '不显示结果')
    .option('-f, --format <format>', '格式化输出: default, raw, json')
    // .option('-o, --output <format>', '输出到文件: json, csv, xlsx')
	.action((uri, opts) => {
		nirvana.debug = opts.debug;
		nirvana.run(uri).then(data => {
			const u = nirvana.parse(uri);
			if (u.action === 'help') {
				nirvana.help(data, u);
			}
			// else if (typeof data == 'object') console.log(JSON.stringify(data, null, 4));
			// else console.log(data);
			else {
				if (!opts.silent) {
					if (data) {
						switch(opts.format) {
							case 'json':
								// const filename = new Date().getTime().toString(36);
								// fs.writeFileSync(filename+'.json', JSON.stringify(data, null, 4));
								// console.log(`saved to ${filename}.json`.yellow);
								console.log(JSON.stringify(data, null, 4));
								break;
							case 'raw':
								console.log(data);
								break;
							default:
								nirvana.show(data);
								break;
						}
					} else console.log('no data');
				}
			}
			process.exit();
		}).catch(err => {
			nirvana.error(err);
			process.exit();
		});
	})

program
	.command('batch <filename>')
	.description('批量执行, 文件内容格式：[{"uri": "xxx", host: "x.x.x.x", pon: "1/2/1"}, ...]')
	.option('-u, --uri <uri>', '如果文件中没有配置uri时默认操作')
	.option('--notitle', '不显示标题')
	.option('--oncetitle', '仅显示一次标题')
	.action(async (paramfn, opts) => {
		let showTitle = opts.notitle ? false : true;
		let param = eval(fs.readFileSync(paramfn).toString()); // unsafe
		// let param = JSON.parse(fs.readFileSync(opts.param).toString()); // exception if json format of param file not standard
		await nirvana.batch(param, opts.uri, function(data){
			nirvana.show(data, {showTitle: showTitle});
			showTitle = opts.oncetitle ? false : (opts.notitle ? false : true);
		});
		process.exit();
	})

program
	.command('list [module]')
	.description('模块列表')
	.action((mod) => {
		const modules = nirvana.config.modules;

		if (!mod) {
			console.log('模块'.padRight(20), '路径');
			console.log('-'.repeat(80));
			for(let item of Object.keys(modules)){
				console.log(item.padRight(20), path.normalize(modules[item]));
			}
		} else if (!modules.hasOwnProperty(mod)) console.log('没有帮助文档');
		else {
			const mPath = path.normalize(modules[mod]);
			console.log('模块名称:'.cyan, mod);
			console.log('模块位置:'.cyan, mPath);
			console.log('-'.repeat(80));

			console.log('控制器：'.cyan);
			nirvana.controllers(mod).map(item => console.log('    ' + item));
			console.log('\n详细帮助:'.cyan, `pn ${mod}:<controller>/help`)
		}
	})

program
	.command('reg <module> <path>')
	.description('注册模块')
	.action((mod, p) => {
		try {
			let manage = new Manage();
			nirvana.modules = {name: mod, path: p}
		} catch(err){
			nirvana.error(err);
		}
	})

program
	.command('unreg <module>')
	.description('取消注册模块')
	.action((mod) => {
		nirvana.modules = {name: mod, path: null}
	})

program
	.command('cron <file>')
	.description('定时执行')
	.action((cronfile) => {
		if (!path.isAbsolute(cronfile)) cronfile = path.join(__dirname, '..', cronfile);
		let f = require(cronfile);
		if (f instanceof Array) {
			f.forEach(item => {
				console.log('执行任务:', item.cron);
				new CronJob(item.cron, function(){item.handle()}, null, true, 'Asia/Shanghai');
			})
		} else if (f instanceof Object) {
			console.log('执行任务:', f.cron);
			new CronJob(f.cron, function(){f.handle()}, null, true, 'Asia/Shanghai');
		} else console.log('cron file format not property.');
	})

program
	.command('genhelp <module> [controller]', '生成指定模块帮助文档')
	.command('server [port] [host]', 'simple server')
	.command('console', 'CLI控制台')

program
	.helpOption('-h, --help', '输出帮助信息')
	.on('--help', () => {
		console.log('\nExamples:');
		console.log('\tpn code:hash/md5?text=123456');
		console.log('\tpn run code:hash/md5?text=123456');
		console.log('\tpn list');
		console.log('\tpn list code');
	})

if (process.argv.length<3) program.help();
program.parse(process.argv);
