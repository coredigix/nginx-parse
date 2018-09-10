var _toConf;

module.exports = function(data) {
  // error management
  if (typeof data !== 'object') {
    throw new Error('data must be a string');
  }
  return _toConf(data);
};

_toConf = function(json) {
  var recurse;
  recurse = function(obj, depth) {
    var i, indent, key, keyValIndent, keyValSpacing, len, longestKeyLen, retVal, subVal, val;
    retVal = '';
    longestKeyLen = 1;
    indent = '    '.repeat(depth);
    for (key in obj) {
      longestKeyLen = Math.max(longestKeyLen, key.length);
    }
    for (key in obj) {
      val = obj[key];
      keyValSpacing = (longestKeyLen - key.length) + 4;
      keyValIndent = ' '.repeat(keyValSpacing);
      if (Array.isArray(val)) {
        for (i = 0, len = val.length; i < len; i++) {
          subVal = val[i];
          retVal += indent + (key + keyValIndent + subVal).trim() + ';\n';
        }
      } else if (typeof val === 'object') {
        retVal += indent + key + ' {\n';
        retVal += recurse(val, depth + 1);
        retVal += indent + '}\n\n';
      } else {
        retVal += indent + (key + keyValIndent + val).trim() + ';\n';
      }
    }
    return retVal;
  };
  return recurse(json, 0);
};
