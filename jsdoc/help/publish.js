const 
	fs = require('fs'),
	path = require('path');

exports.publish = (data, {destination, query}) => {
    let docs;
    const root = {};

    data({undocumented: true}).remove();
    docs = data().get(); // <-- an array of Doclet objects

	//console.log(docs);
	
	let helpList = {};
	for(let item of docs){
		if (item.comment != '') {
			let match = null;
			if (match = /^(.*?)Action$/.exec(item.name)){
				let params = [];
				for(let p of item.params) {
					let p0 = {
						name: p.name, 
						description: p.description||'', 
					};
					if (p.optional === true) p0.required = false;
					if (typeof p.defaultvalue != 'undefined') p0.value = p.defaultvalue;
					params.push(p0);
				}
				let p1 = {
					description: item.description||'',
					params: params,
				}
				let tag = (item.tags instanceof Array) && item.tags.find(function(item){return item.title == 'usage'});
				if (tag) p1.usage = tag.value;
				helpList[match[1]] = p1;
			}
		}
	}
	
	let out = '';
	if (docs[0].augments) {
		out += `const base = require('./${docs[0].augments}');`;
		out += '\nlet help = ' + JSON.stringify(helpList, null, 4);
		out += '\nmodule.exports = Object.assign(base, help);';
	}
	else if (Object.keys(helpList).length > 0){
		out = 'module.exports = ' + JSON.stringify(helpList, null, 4);
	}
	
	if (destination === 'console') {
		console.log(out);
	} else {
		// fs.writeFileSync(path.join(destination, docs[0].meta.filename), out);
		let destination_path = path.dirname(destination);
		if (!fs.existsSync(destination_path)) fs.mkdirSync(destination_path, {recursive: true});
		console.log(destination);
		fs.writeFileSync(destination, out);
	}
}
