var app = require('connect')();
var path = require('path');

var args = Array.prototype.slice.call(process.argv, 2, 4);
var root = args[0] || 'public/';
var port = args[1] || 3000;


app.use(require('connect-livereload')());
app.use(require('serve-static')(path.join(process.cwd(), root)));

app.listen(port, function () {

    var host = 'localhost';

    console.log('folder "%s" serving at http://%s:%s', root, host, port);
});