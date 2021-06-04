/**
 * 扩展String类库
 * padLeft: 类似PadStart, 支持中文字节长度
 * padRight: 类似PadEnd，支持中文字节长度
 */
const util = require('util');

// String类扩展, 支持中文多字节
class customString {
	constructor() {
		this.letters = 'abcdefghijklmnopqrstuvwxyz';
		this.digits = '0123456789';
		this.specials = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
		this.whitespace = ' \t\n\r\x0b\x0c';
	}
	get byteLength() {
		return this.replace(/[^\x00-\xff]/g, '01').length;
	}
	padRight(n, char = ' '){
		return this.padEnd(n - (this.byteLength - this.length), char);
	}
	padLeft(n, char = ' '){
		return this.padStart(n - (this.byteLength - this.length), char);
	}
	pad(n, char = ' '){
		if (n<=this.byteLength) return this;
		let n0 = Math.floor((n - this.byteLength)/2);
		return char.repeat(n0) + this + char.repeat(n-n0-this.byteLength);
	}
}

util.inherits(String, customString);
