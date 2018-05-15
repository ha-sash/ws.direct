const APIManager = require('./dist/APIManager').APIManager;


module.exports.APIManager = APIManager;

module.exports.getPublicPath = function() {
    return __dirname + '/public';
};