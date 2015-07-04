
var fs = require('fs'),
    crypto = require('crypto');
var buffersEqual = require('buffer-equal-constant-time'),
    ssh2 = require('ssh2'),
    utils = ssh2.utils;

var pubKey = utils.genPublicKey(utils.parseKey(fs.readFileSync('./ssh_keys/user.pub')));
console.log(pubKey);
new ssh2.Server({
}, function(client) {
  console.log('Client connected!');

  client.on('authentication', function(ctx) {
    console.log('authentication!');
  }).on('ready', function() {
    console.log('Client authenticated!');

    client.on('session', function(accept, reject) {
      console.log("session");
    });
  }).on('end', function() {
    console.log('Client disconnected');
  }).on('error',function(err) {
    console.log("error::::");console.log(err);
    // body...
  })
}).listen(process.env.PORT || 8022, process.env.IP, function() {
  console.log(process.env.IP);
  console.log(process.env.PORT|| 8022);
  console.log('Listening on port ' + this.address().port);
});