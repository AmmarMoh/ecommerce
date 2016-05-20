module.exports = {
    getUser : function(auth, callback) {
        var https = require('https');

        var optionsget = {
          host : 'auth.sellyx.com',
          port : 443,
          path : '/auth/validate?key=' + auth,
          method : 'GET'
        };

        var reqGet = https.request(optionsget, function(r) {

          r.setEncoding('utf8');

          var dat = "";

          r.on('data', function(d) {
            dat += d;
          });

          r.on('end', function () {
            var json = JSON.parse(dat);
            if (json.success && json.success.data.user) {
              dat = json.success.data.user;
            } else {
              dat = 'bad';
            }
            callback(dat);
          });

        });

        reqGet.end();
    }
}