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
  var buffer, c, currentObject, i, isComment, json, key, newServer, nodes, obj, path, str, value;
  json = {};
  nodes = [];
  currentObject = json;
  buffer = '';
  isComment = false;
  for (i in data) {
    c = data[i];
    // check if we are in comment line
    if (isComment) {
      if (c === '\n' || c === '\r') {
        // we are now finished the comment
        isComment = false;
      } else {
        continue;
      }
    }
    switch (c) {
      case '{': // start block
        str = _strip(buffer);
        str = str.split(' ');
        // get first element as key
        key = str.shift();
        // handled object
        obj = {};
        // if we are in server block
        if (key === 'server') {
          // if there is already an server array get it unless create it 
          obj = currentObject.hasOwnProperty(key) ? currentObject[key] : currentObject[key] = [];
          // create new server object
          newServer = {};
          // add server to server list
          obj.push(newServer);
          // set it as current object
          obj = newServer;
        // if we are in location block
        } else if (key === 'location') {
          // check if current object has already this key unless add it
          obj = currentObject.hasOwnProperty(key) ? currentObject[key] : currentObject[key] = {};
          // location path
          path = _strip(str.join(' '));
          // add location path object
          obj = obj[path] = {};
        } else {
          // something other than server and location
          currentObject[key] = obj;
        }
        // push current object to nodes
        nodes.push(currentObject);
        // set as current object
        currentObject = obj;
        // clear buffer
        buffer = '';
        break;
      case '}': // end block
        
        // get last node as current object and remove it from nodes
        currentObject = nodes.pop();
        // clear buffer
        buffer = '';
        break;
      case ';': // line
        
        // remove tabs form the string
        str = _strip(buffer);
        str = str.split(' ');
        // get first element as key and remove it form array
        key = _strip(str.shift());
        // join the rest value with space
        value = _strip(str.join(' '));
        // if we are in include directive
        if (key === 'include') {
          obj = currentObject.hasOwnProperty(key) ? currentObject[key] : currentObject[key] = [];
          obj.push(value);
        } else {
          // add to current object
          currentObject[key] = value;
        }
        // clear buffer
        buffer = '';
        break;
      case '#': //comment
        // we are in comment line
        isComment = true; // words
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
