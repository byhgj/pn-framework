const
	readline = require('readline'),
	fs = require('fs'),
	path = require('path'),
	qs = require('querystring'),
	colors = require('colors'),
	esprintf = require('esprintf'),
	pn = new (require('../../Manage'));

module.exports = class {
	#version = '0.1.0';
	title = `Console v${this.#version}`;
	handler = {};
	prompt = '> ';
	namespace = {variables:{}};
	customParser = null;
	#module = null;
	#controller = null;
	constructor(opts){
		this.namespace = {
			module: null,
			controller: null,
			action: null,
			actionParameter: {},
			payload: null,
			variables: {},
			cache: {}
		}
		if (opts.title) this.title = opts.title;
		this.handler = Object.assign(this.handler, opts.handler);
		if (opts.prompt) this.prompt = opts.prompt;
		if (typeof opts.customParser === 'function') this.customParser = opts.customParser;

		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			// 按TAB自动完成
			completer: (line) => {
				const completions = Object.keys(this.handler).sort();
				const hits = completions.filter((c) => c.startsWith(line));
				return [hits.length ? hits : null, line];
			},
			prompt: this.prompt,
			crlfDelay: Infinity
		});

		this.rl.on('line', async (line) => {
			if (line.trim() === '') {
				this.rl.prompt();
				return;
			}
			if (typeof this.customParser === 'function' && (!this.customParser(this, line))){
				this.rl.prompt();
				return;
			}
			line = line.trim().split(' ');
			if (this.handler[line[0]]) {
				await this.handler[line[0]](this, ...line.slice(1));
			} else {
				switch(line[0]){
					case 'exit':
						this.rl.close();
						break;
					default:
						console.log('该命令不支持');
						break;
				}
			}
			this.rl.prompt();
		}).on('SIGINT', () => {
			this.rl.question('exit?(y/N) ', (answer) => {
				if (answer.toLowerCase() === 'y') process.exit();
				else this.rl.prompt();
			})
		}).on('close', () => {
			console.log('BYE.');
			process.exit();
		})
	}
	get version(){return this.#version}
	setPrompt(v){
		this.rl.setPrompt(v.blue);
	}
	module(v){
		let self = this;
		if (v) {
			if (pn.config.modules[v]) {
				self.#module = new nirvana.Module(pn.config.modules[v]);

				self.namespace.module = v;
				self.namespace.controller = null;
				self.#controller = null;
				self.namespace.action = null;
				self.namespace.actionParameter = {};

				self.setPrompt(`${self.namespace.module}${self.prompt}`);
			} else console.error(`模块${v}不存在`.red.bold);
		} else {
			for(let item in pn.config.modules){
				console.log(esprintf('%-20s %s', item, pn.config.modules[item]))
			}
		}
	}
	controller(v){
		let self = this;
		if (self.#module === null) {
			console.error('请先装载模块');
			return;
		}
		if (v) {
			let _p = path.join(pn.config.modules[self.namespace.module], 'controller', v + '.js');
			if (fs.existsSync(_p)) {
				self.namespace.controller = v;
				self.#controller = this.#module.controller(self.namespace.controller);
				self.namespace.action = null;
				self.namespace.actionParameter = {};

				self.setPrompt(`${self.namespace.module}:${self.namespace.controller}${self.prompt}`);
			} else console.error(`控制器${v}不存在`.red.bold);
		} else {
			this.#module.help().forEach(item => {
				console.log('\t' + item.name);
			})
		}		
	}
	action(v){
		let self = this;
		if (self.#module === null || self.#controller === null) {
			console.log('请先装载模块和控制器');
			return;
		}
		if (v) {
			let _a = null, _p = {};
			if (v != null) [_a, _p] = v.split('?');
			self.namespace.action = _a;
			self.setPrompt(`${self.namespace.module}:${self.namespace.controller}/${self.namespace.action}${self.prompt}`);
			self.namespace.payload = null;

			self.option(_p?qs.parse(_p):{});

		} else self.#controller.action('help');
	}
	option(v){
		let self = this;
		if (self.#module === null || self.#controller === null || self.namespace.action === null) {
			console.log('请先装载模块、控制器和动作');
			return;
		}
		if (v) {
			Object.assign(self.namespace.actionParameter, v);
		} else {
			console.log('');
			let helpitem = self.#controller.help(self.namespace.action, true);
			console.log(`${'参数'.padRight(15)}\t${'必须?'.padRight(10)}\t${'值'.padRight(20)}\t描述`.cyan);
			console.log('-'.repeat(80));
			for(let item of helpitem.params){
				let required = (item.required || typeof item.required === 'undefined') ? '是' : '否';
				let value = self.namespace.actionParameter[item.name] || item.value || '';
				console.log(`${item.name.padRight(15)}\t${required.padRight(10)}\t${value.toString().padRight(20)}\t${item.description}`);
			}
			console.log('');
		}
	}
	run(){
		let self = this;
		if (self.#module === null || self.#controller === null || self.namespace.action === null) {
			console.log('请先装载模块、控制器和动作');
			return;
		}
		let params = Object.assign({}, self.namespace.actionParameter);
		self.#controller.action(self.namespace.action, params)
			.then(async r => {
				let _result;
				if (r) {
					if (self.namespace.payload) {
						let [m,c] = namespace.payload.split(':');
						_result = await nirvana.controller(m, c)
							.action('run', {data: r});
					} else _result = r;
					
					//self.rl.clearLine(process.stdout, 0);
					process.stdout.write('\n');
					if (typeof _result === 'object') {
						console.log('');
						nirvana.util.show(_result, {type: 'json'});
						console.log('');
					} else console.log(_result);
					
					self.rl.prompt();
				}
			})
			.catch(err => nirvana.error(err))
	}
	start(){
		console.log(this.title);
		this.rl.prompt();
	}
}
