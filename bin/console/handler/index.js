const
	varHandler = require('./variables'),
	mcapHandler = require('./mcap'),
	cacheHandler = require('./cache'),
	shellHandler = require('./shell');

let handler = {
	'namespace': function(self){console.log(self.namespace)},
	'help': require('./help'),
	//'set': varHandler.setVariable,
	//'get': varHandler.getVariable,
	// pn
	'module': mcapHandler.module,
	'controller': mcapHandler.controller,
	'action': mcapHandler.action,
	'option': mcapHandler.parameter,
	'set': mcapHandler.set,
	'unset': mcapHandler.unset,
	'run': mcapHandler.run,
	// cache
	'cache': cacheHandler,
	// shell
	'!ls': shellHandler('ls'),
	'!pwd': shellHandler('pwd'),
	'!cat': shellHandler('cat')
}

handler.ns = handler.namespace;
/*
handler.m = handler.module;
handler.c = handler.controller;
handler.a = handler.action;
handler.o = handler.param;
*/
module.exports = handler;