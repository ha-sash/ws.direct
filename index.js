const APIManager = require('./lib/APIManager');


module.exports.APIManager = APIManager;

module.exports.getPublicPath = function() {
    return __dirname + '/public';
};