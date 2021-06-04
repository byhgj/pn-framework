module.exports = {
	module: (self, v) => {
		self.module(v);
	},
	controller: (self, v) => {
		self.controller(v);
	},
	action: (self, v) => {
		self.action(v);
	},
	parameter: (self, v) => {
		self.option(v);
	},
	payload: (self, v) => {
		self.namespace.payload = v;
	},
	set: (self, n, ...v) => {
		if (self.namespace.module === null || self.namespace.controller === null || self.namespace.action === null) {
			console.log('Please first setup module, controller, action');
		} else {
			if (n && v)
				self.namespace.actionParameter[n] = v.join(' ');
		}
	},
	unset: (self, n) => {
		if (n) delete self.namespace.actionParameter[n];
	},
	run: (self) => {
		self.run();
	}
}