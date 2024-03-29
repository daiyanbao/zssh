var fs = require('fs'),
    crypto = require('crypto');
var buffersEqual = require('buffer-equal-constant-time'),
    ssh2 = require('ssh2'),
    utils = ssh2.utils;

var pubKey = utils.genPublicKey(utils.parseKey(fs.readFileSync('./ssh_keys/user.pub')));

new ssh2.Server({
  privateKey: fs.readFileSync('./ssh_keys/host.key')
}, function(client) {
  console.log('Client connected!');

  client.on('authentication', function(ctx) {

    if (ctx.method === 'password'
        && ctx.username === 'root'
        && ctx.password === 'bar')
      ctx.accept();
    else if (ctx.method === 'publickey'
             && ctx.key.algo === pubKey.fulltype
             && buffersEqual(ctx.key.data, pubKey.public)) {
    console.log('publickey:::::::::');
    console.log(ctx);
    
      if (ctx.signature) {
        var verifier = crypto.createVerify(ctx.sigAlgo);
        verifier.update(ctx.blob);
        
        
        console.log('signature::::::::::');
        
        console.log(pubKey);
        
        if (verifier.verify(pubKey.publicOrig, ctx.signature, 'binary'))
          ctx.accept();
        else
          ctx.reject();
      } else {
        // if no signature present, that means the client is just checking
        // the validity of the given public key
        ctx.accept();
      }
    } else
      ctx.reject();
  }).on('ready', function() {
    console.log('Client authenticated!');

    client.on('session', function(accept, reject) {
      var session = accept();
      session.once('exec', function(accept, reject, info) {
        console.log('Client wants to execute: ' + inspect(info.command));
        var stream = accept();
        stream.stderr.write('Oh no, the dreaded errors!\n');
        stream.write('Just kidding about the errors!\n');
        stream.exit(0);
        stream.end();
      });
    });
  }).on('end', function() {
    console.log('Client disconnected');
  });
}).listen(process.env.PORT || 8022, process.env.IP, function() {
  console.log(process.env.IP);
  console.log(process.env.PORT|| 8022);
  console.log('Listening on port ' + this.address().port);
});