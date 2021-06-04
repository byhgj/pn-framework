module.exports = {
	setVariable: (self, name, value) => {
		self.namespace.variables[name] = value;
	},
	getVariable: (self, name) => {
		console.log(self.namespace.variables[name]);
		return self.namespace.variables[name];
	}
}
