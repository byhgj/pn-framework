#!/usr/bin/env node
require('../lib');
const
	http = require('http'),
	qs = require('querystring'),
	program = require('commander');

let debug = true;
let includes = [], excludes = [], password = null, cors = '*';

const Headers = {
	Server: 'PhoenixNirvana',
	'Access-Control-Allow-Origin': cors
}

/*
let _routes = [
	['/hello', function(ctx){ctx.res.body = 'hello pn';}],
	[/\/about\/(?<id>.*)/, function(ctx){console.log(ctx.get('id');}]
]

function get(r, f) {
	_routes.push([r, f]);
}

function execute(uri) {
	let _uri = url.parse(uri);
	for(let [r, f] of _routes){
		if (typeof r === 'string' && r === _url.path) {
			f();
			break;
		} else if (typeof r === 'object') {
			let re = new RegExp(r);
			let match = re.exec(_uri.path);
			if (match) {
				f(...Object.values(match.groups));
				break;
			}
		} else {
			console.log(404);
		}
	}
}
*/

let middles = [
	function(ctx, next){
		Object.keys(Headers).forEach(key => ctx.res.setHeader(key, Headers[key]));
		next();
	},
	function(ctx, next){
		// 如果设置了密码
		if (!!password) {
			if (ctx.req.headers['x-token'] !== password) {
				ctx.res.writeHead(403);
				ctx.log.status = 403;
			}
		}
		next();
	},
	function(ctx, next){
		// allow access module, empty is allow all
		let matches = /\/(?<module>.*?)\/(?<controller>.*?)\/(?<action>.*)/.exec(ctx.req.url.split('?')[0]);
		if (includes.length>0 && !includes.includes(matches.groups.module)) {
			ctx.res.writeHead(403);
			ctx.log.status = 403;
		}
		next();
	},
	function(ctx, next){
		// deny access module
		let matches = /\/(?<module>.*?)\/(?<controller>.*?)\/(?<action>.*)/.exec(ctx.req.url.split('?')[0]);
		if (excludes.length>0 && excludes.includes(matches.groups.module)) {
			ctx.res.writeHead(403);
			ctx.log.status = 403
		}
		next();
	}
]

function middleware(ctx, next){
	return dispatch(0);
	function dispatch(i){
		let fn = middles[i];
		if (i === middles.length) fn = next;
		if (!fn) return Promise.resolve();
		try {
			return Promise.resolve(fn(ctx, function next(){
				return (ctx.log.status === 200) ? dispatch(i+1) : null;
			}))
		} catch(err) {
			return Promise.reject(err);
		}
	}
}

function app(req, res){
	let log = {
		remote: res.socket.remoteAddress,
		ua: req.headers['user-agent'] || '-',
		token: req.headers['x-token'] || '-',
		method: req.method,
		url: req.url,
		status: 200,
		length: '-'
	};
	let body = Buffer.alloc(0);
	req.on('data', function(data){
		body = Buffer.concat([body, data]);
	});
	req.on('end', function(){
		middleware({req, res, log});

		if (log.status !== 200) {
			res.end();
			console.log(Object.values(log).join(' '));
			return;
		}

		// module list
		if (req.url === '/module') {
			res.writeHead(200, {
				'Content-Type': 'text/json',
				'Access-Control-Allow-Origin': cors
			});
			let modules = nirvana.config.modules;
			if (includes.length>0) {
				modules = Object.fromEntries(Object.entries(modules).filter(item => includes.includes(item[0])));
			}
			if (excludes.length>0) {
				excludes.map(item => {delete modules[item]});
			}
			res.write(JSON.stringify(modules));
			log.status = 200;
			log.length = JSON.stringify(modules).length;
			console.log(Object.values(log).join(' '));
			res.end();
			return;
		}
		// module/controller list
		if (/module\/(.*)/.test(req.url)) {
			let matches = /module\/(?<module>.*)/.exec(req.url);

			if (nirvana.config.modules[matches.groups.module]) {
				res.writeHead(200, {
					'Content-Type': 'text/json',
					'Access-Control-Allow-Origin': cors
				});
				res.write(JSON.stringify(nirvana.controllers(matches.groups.module)));
				log.status = 200;
				log.length = JSON.stringify(nirvana.controllers(matches.groups.module)).length;
			} else {
				res.writeHead(404);
				log.status = 404;
			}
			console.log(Object.values(log).join(' '));
			res.end();
			return;
		}
		// nirvana.run
		// check uri format
		let matches = /\/(?<module>.*?)\/(?<controller>.*?)\/(?<action>.*)/.exec(req.url.split('?')[0]);
		if (!matches || matches.groups.action === '') {
			res.writeHead(404);
			res.end();
			log.status = 404;
			console.log(Object.values(log).join(' '));
			return;
		}
		let uri = {
			module: matches.groups.module,
			controller: matches.groups.controller,
			action: matches.groups.action
		}
		if (req.url.split('?')[1]) uri.param = qs.decode(req.url.split('?')[1]);
		if (req.method === 'POST') {
			let _body = '';
			switch(req.headers['content-type']){
				case 'application/json':
					_body = JSON.parse(body.toString());
					break;
				default:
					_body = body.toString();
			}
			uri.param = Object.assign(uri.param || {}, {data:_body});
		}
		nirvana.run(uri).then(data => {
			if (typeof data === 'string') {
				res.setHeader('Access-Control-Allow-Origin', cors);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write(data);
				log.length = data.length;
			} else {
				res.writeHead(200, {
					'Content-Type': 'text/json',
					'Access-Control-Allow-Origin': cors
				});
				res.write(JSON.stringify(data));
				log.length = JSON.stringify(data).length;
			}
			console.log(Object.values(log).join(' '));
			res.end();
		}).catch(err => {
			res.writeHead(500);
			res.write(err.message);
			log.status = 500;
			console.log(Object.values(log).join(' '));
			res.end();
		})
	})
}

program
	.version(nirvana.pkg.version)
	.command('server [port] [host]')
	.option('-i, --include <module list>', '仅允许指定模块列表，逗号分割')
	.option('-e, --exclude <module list>', '排除指定模块列表，逗号分割')
	.option('-t, --token <token>', '授权码，客户端通过设置X-TOKEN头指定')
	.option('-c, --cors <cors>', '允许跨域domain, 默认*')
	.action((port = 9002, host = '127.0.0.1', opts) => {
		includes = (opts.include) ? opts.include.split(/,\s*/) : [];
		excludes = (opts.exclude) ? opts.exclude.split(/,\s*/) : [];
		password = opts.token;
		cors = (opts.cors) ? opts.cors : '*';
		http.createServer(app).listen(port, host, () => {
			console.log(`listening ${host}:${port}`)
		})
	})
	.parse(process.argv)
