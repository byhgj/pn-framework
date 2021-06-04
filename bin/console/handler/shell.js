const
	{exec} = require('child_process');

module.exports = function(cmd){
	return function(self, ...param) {
		return new Promise((resolve, reject) => {
			exec(`${cmd} ${param.join(' ')}`, (error, stdout, stderr) => {
				if (error || stderr) {
					reject(error || stderr);
					return;
				}
				console.log(stdout);
				resolve(stdout);
			});
		})
	}
}