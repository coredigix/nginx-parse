'use strict';
/**
* Parse nginx file content to JSON representation
* this function take as argument an string
* @private
* @param  {String} data File content
* @return {Object}      JSON representation
 */
/**
* This function remove tabs from an string and trim it
* @private
* @param  {String} str String to strip
* @return {String}     Result of striping
 */
var _parse, _strip;

//#
//# This package help to create JSON representation of an nginix file config
//#
module.exports = function(data) {
  // error management
  if (typeof data !== 'string') {
    throw new Error('data must be a string');
  }
  // call parse
  return _parse(data);
};

_parse = function(data) {
  var buffer, c, currentObject, i, isComment, json, key, nodes, obj, str, val;
  json = {};
  nodes = [];
  currentObject = json;
  buffer = '';
  isComment = false;
  for (i in data) {
    c = data[i];
    // we ignore comments
    if (isComment) {
      // if it is back to line, comment is finished
      if (c === '\n' || c === '\r') {
        isComment = false;
        buffer = '';
      } else {
        continue;
      }
    }
    switch (c) {
      case '{': // start block
        
        // strip and split buffer
        str = _strip(buffer).split(' ');
        // get first element as key
        key = str.shift();
        // join the rest as value
        val = str.join(' ').trim();
        // create or get the object with this key inside current object
        obj = {};
        if (currentObject.hasOwnProperty(key)) {
          if (Array.isArray(currentObject[key])) {
            currentObject[key].push(obj);
          } else if (!val) {
            currentObject[key] = [currentObject[key], obj];
          } else {
            obj = currentObject[key];
          }
        } else {
          currentObject[key] = obj;
        }
        // there is a value so we create two level block
        if (val) {
          Object.defineProperty(obj, '_isList', {
            value: true
          });
          obj = obj[val] = {};
        }
        // push current object to nodes
        nodes.push(currentObject);
        // set as current object
        currentObject = obj;
        // clear buffer
        buffer = '';
        break;
      case '}': // we arrived to end block
        
        // get last node as current object and remove it from nodes
        currentObject = nodes.pop();
        // clear buffer
        buffer = '';
        break;
      case ';': // it is line
        
        // strip and split buffer
        str = _strip(buffer).split(' ');
        
        // get first element as key and remove it form array
        key = _strip(str.shift());
        // join the rest values with space
        val = _strip(str.join(' '));
        // if this key already exist so we need to transform key to array if not yet
        if (currentObject.hasOwnProperty(key)) {
          // if key is not an array so we create it
          if (!Array.isArray(currentObject[key])) {
            currentObject[key] = [currentObject[key]];
          }
          // push value to existing or created array
          currentObject[key].push(val);
        } else {
          // add to current object

          // otherwise it is just a sample directive then it is transformed to key:value
          currentObject[key] = val;
        }
        // clear buffer
        buffer = '';
        break;
      case '#': // it is comment
        isComment = true; // otherwise add to buffer
        break;
      default:
        buffer += c;
    }
  }
  // return json result 
  return json;
};

_strip = function(str) {
  return str.replace(/\t/g, '').trim();
};
