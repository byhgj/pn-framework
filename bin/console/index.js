const Console = require('./Console');

process.on('uncaughtException', function (err) {
	nirvana.error(err);
});

module.exports = new Console({
	handler: require('./handler'),
	customParser: require('./handler/customparser')
});
