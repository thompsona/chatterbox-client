
var makeTemplate = function(str, obj) {
  var regex = /{{[A-z]+}}/gi;
  return str.replace(regex, function(match){
    match = "" + match;
    match = match.slice(2, match.length-2);
    return obj[match];
  })
};