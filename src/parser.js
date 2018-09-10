'use strict';
/**
* Parse nginx file content to javascript object
* this function take as argument an string
* @private
* @param  {String} data File content
* @return {Object}      Content as javascript object
 */
/**
* Transform key string to object structure
* @private
* @param  {Object} obj  [description]
* @param  {String} path path to resolve
* @return {Array}      [description]
 */
/**
* [_resolveSet description]
* @private
* @param  {[type]} obj  [description]
* @param  {[type]} path [description]
* @param  {[type]} val  [description]
* @return {[type]}      [description]
 */
var _parse, _resolve, _resolveSet;

/**
 * Parse nginx file content to javascript object
 * this function take as argument an string
 * @param  {String} data Date to parse
 * @return {Object}      Parsed data as javascript object
 */
module.exports = function(data) {
  // error management
  if (typeof data !== 'string') {
    throw new Error('data must be a string');
  }
  // call parse
  return _parse(data);
};

_parse = function(data) {
  var existingVal, i, json, key, len, line, lines, parent, val;
  // split data to lines
  lines = data.replace('\t', '').split('\n');
  // final json
  json = {};
  // parent key
  parent = null;
  for (i = 0, len = lines.length; i < len; i++) {
    line = lines[i];
    // remove white spaces
    line = line.trim();
    // check if line empty or a comment
    if (!line || line.startsWith('#')) {
      continue;
    }
    if (line.endsWith('{')) {
      key = line.slice(0, line.length - 1).trim();
      parent = parent ? parent += '.' + key : key;
      _resolveSet(json, parent, {});
    } else if (line.endsWith(';')) {
      line = line.split(' ');
      key = line.shift();
      val = line.join(' ').trim();
      if (key.endsWith(';')) {
        key = key.slice(0, key.length - 1);
      }
      // remove semi-colon from the val
      val = val.slice(0, val.length - 1);
      if (parent) {
        existingVal = _resolve(json, parent + '.' + key);
        if (existingVal) {
          val = Array.isArray(existingVal) ? existingVal.concat(val) : [val, existingVal];
        }
        _resolveSet(json, parent + '.' + key, val);
      } else {
        _resolveSet(json, key, val);
      }
    } else if (line.endsWith('}')) {
      parent = parent.split('.');
      parent.pop();
      parent = parent.join('.');
    }
  }
  return json;
};

_resolve = function(obj, path) {
  var cb;
  cb = function(prev, curr) {
    if ((prev != null) && typeof prev === 'object') {
      return prev[curr];
    } else {
      return void 0;
    }
  };
  return path.split('.').reduce(cb, obj);
};

_resolveSet = function(obj, path, val) {
  var components;
  components = path.split('.');
  while (components.length > 0) {
    if (typeof obj !== 'object') {
      break;
    }
    if (components.length === 1) {
      obj[components[0]] = val;
      return true;
    } else {
      obj = obj[components.shift()];
    }
  }
  return false;
};
