module.exports = function(self, cmd, n, v){
	switch(cmd) {
		case 'set':
			self.namespace.cache[n] = v;
			break;
		case 'get':
			console.log(self.namespace.cache[n]);
			break;
		case 'unset':
			delete self.namespace.cache[n];
			break;
		default:
			console.log('usage: cache <get|set|unset> <key> [value]');
			break;
	}
}