var fs = require('fs'),
	path = require('path'),
	xmldom = require('xmldom');

module.exports = Tiapp;

/**
 * Creates a new Tiapp object
 * @constructor
 *
 * @example
 * // Create a Tiapp object.
 * var tiapp = new Tiapp();
 *
 * @example
 * // Create a Tiapp object from an explicit file path.
 * var tiapp = new Tiapp('/path/to/tiapp.xml');
 *
 * @param {String} [file] Path to the tiapp.xml file to load. If one is not provided,
 *                        {@link Tiapp#find|find()} will attempt to find and load one automatically.
 *
 * @property {Object} doc XML document object, generated by {@link Tiapp#parse|parse()}. Generally you'll
 *                        use the Tiapp API and won't access this directly. If you need it, though, it is
 *                        available. Its usage can be found at https://github.com/jindw/xmldom.
 * @property {String} file Path to the tiapp.xml file. Setting `file` will call {@link Tiapp#parse|parse()}.
 *
 * @returns {Tiapp} An instance of Tiapp
 */
function Tiapp(file) {

	// get and validate file
	if (typeof file !== 'undefined' && !isString(file)) {
		throw new TiappError('Bad argument. If defined, file must be a string.', file);
	}
	file = file || this.find();

	// define file
	Object.defineProperty(this, 'file', {
		configurable: true,
		enumerable: true,
		writable: false,
		value: file
	});

	// load file, if we have one
	if (this.file) {
		this.load(this.file);
	}
}

/**
 * Parses the given file as a tiapp.xml file and updates the Tiapp object. If a file is not
 * provided, {@link Tiapp#find|find()} will attempt to find one automatically. The file is
 * validated, read, and then {@link Tiapp#parse|parse()} is called.
 *
 * @param {String} [file] Path to the tiapp.xml file
 *
 * @returns {Tiapp} the current Tiapp object (i.e., `this`)
 */
Tiapp.prototype.load = function parse(file) {

	// make sure we have a file
	if (typeof file !== 'undefined' && !isString(file)) {
		throw new TiappError('Bad argument. If defined, file must be a string.', file);
	}
	file = file || this.find();
	if (!file || (file && !fs.existsSync(file))) {
		throw new TiappError('tiapp.xml not found', file);
	}

	// redefine file
	Object.defineProperty(this, 'file', {
		configurable: true,
		enumerable: true,
		writable: false,
		value: file
	});

	// parse the file
	return this.parse(fs.readFileSync(file, 'utf8'));
};

/**
 * Parses the given string as xml and updates the current Tiapp object.
 *
 * @param {String} [xml] XML string to be parsed, presumedly a tiapp.xml
 *
 * @returns {Tiapp} the current Tiapp object (i.e., `this`)
 */
Tiapp.prototype.parse = function parse(xml) {

	// make sure xml is a string
	if (!xml || !isString(xml)) {
		throw new TiappError('Bad argument. xml must be a string.', xml);
	}

	// parse the xml
	this.doc = new xmldom.DOMParser().parseFromString(xml);
	return this;
};

/**
 * Determines the location of the tiapp.xml file. It will search the current directory,
 * and all other directories higher in the view hierarchy, in order. If it does not find
 * a tiapp.xml in any of these directories, null is returned.
 *
 * @returns {String|null} The location of the tiapp.xml file, or null if not found.
 */

Tiapp.prototype.find = function find() {
	var cwd = process.cwd(),
		parts = cwd.split(path.sep);

	// remove empty element
	if (parts[0] === '') {
		parts.shift();
	}

	// iterate up through hierarchy to try and find a tiapp.xml
	for (var i = 0, len = parts.length; i < len; i++) {
		var p = (/^win/.test(process.platform) ? '' : path.sep) +
			path.join.apply(path, parts.slice(0, len-i).concat('tiapp.xml'));
		if (fs.existsSync(p) && fs.statSync(p).isFile()) {
			return p;
		}
	}

	return null;
};

function isString(o) {
	return Object.prototype.toString.call(o) === '[object String]';
}
function TiappError(msg, data) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.message = msg;
	this.name = 'TiappError';
	this.data = data;
}
TiappError.prototype = Object.create(Error.prototype);
TiappError.prototype.constructor = TiappError;
