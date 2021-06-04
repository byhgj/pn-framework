const qs = require('querystring');

module.exports = function(self, line){
	let match = null;
	if (match = /^([^\/\? ]+):$/.exec(line)) {
		self.module(match[1]);
		// self.rl.setPrompt(`${self.namespace.module}${self.prompt}`);
		return false;
	}
	else if (match = /^([^\/\? ]+):([^\/\?]+)$/.exec(line)) {
		self.module(match[1]);
		self.controller(match[2]);
		return false;
	}
	else if (match = /^([^\/\? ]+):([^\/\?]+)\/([^\/\?]+)(?:\?(.*))*$/.exec(line)){
		self.module(match[1]);
		self.controller(match[2]);
		self.action(match[3]);
		if (match[4]) self.option(qs.parse(match[4]));

		// self.rl.setPrompt(`${self.namespace.module}:${self.namespace.controller}/${self.namespace.action}${self.prompt}`);
		return false;
	}
	return true; // 未处理，需要继续默认处理流程
}