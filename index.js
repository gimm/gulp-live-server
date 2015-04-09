'use strict';
/**
 * Created by gimm on 3/13/2015.
 */

var util = require('util'),
    path = require('path'),
    assert = require('assert'),
    spawn = require('child_process').spawn,
    merge = require('deepmerge'),
    tinylr = require('tiny-lr'),
    es = require('event-stream'),
    Q = require('q'),
    chalk = require('chalk'),
    debug = require('debug')('gulp-live-server');

var config = {},
    server = undefined, // the server child process
    lr = undefined, // tiny-lr server
    info = chalk.gray,
    error = chalk.bold.red;

var callback = {
    processExit: function (code, sig) {
        debug(info('Main process exited with [code => %s | sig => %s]'), code, sig);
        server && server.kill();
    },

    serverExit: function (code, sig) {
        debug(info('server process exited with [code => %s | sig => %s]'), code, sig);
        if(sig !== 'SIGKILL'){
            //server stopped unexpectedly
            process.exit(0);
        }
    },

    lrServerReady: function () {
        console.log(info('livereload[tiny-lr] listening on %s ...'), config.livereload.port);
    },

    serverLog: function (data) {
        console.log(info(data.trim()));
    },

    serverError: function (data) {
        console.log(error(data.trim()));
    }
};

/**
 * set config data for the new server child process
 * @type {Function}
 */
module.exports = exports = (function() {
    var defaults = {
        options: {
            cwd: undefined
        },
        livereload: {
            port: 35729
        }
    };
    defaults.options.env = process.env;
    defaults.options.env.NODE_ENV = 'development';

    return function(args, options, livereload){
        config.args = util.isArray(args) ? args : [args];
        //deal with options
        config.options = merge(defaults.options, options || {});
        //deal with livereload
        if (livereload) {
            config.livereload = (typeof livereload === 'object' ? livereload : {port: livereload});
        }else{
            config.livereload = (livereload === false ? false : defaults.livereload);
        }
        return exports;
    };
})();

/**
* default server script, the static server
*/
exports.script = path.join(__dirname, 'scripts/static.js');

/**
* create a server child process with the script file
*/
exports.new = function (script) {
    if(!script){
        return console.log(error('script file not specified.'));
    }
    var args = util.isArray(script) ? script : [script];
    return this(args);
};

/**
* create a server child process with the static server script
*/
exports.static = function (folder, port) {
    var script = this.script;
    folder = folder || process.cwd();
    util.isArray(folder) && (folder = folder.join(','));
    port = port || 3000;
    return this([script, folder, port]);
};

/**
* start/restart the server
*/
exports.start = function () {
    if (server) { // server already running
        debug(info('kill server'));
        server.kill('SIGKILL');
        //server.removeListener('exit', callback.serverExit);
        server = undefined;
    } else {
        if(config.livereload){
            lr = tinylr(config.livereload);
            lr.listen(config.livereload.port, callback.lrServerReady);
        }
    }

    var deferred = Q.defer();
    server = spawn('node', config.args, config.options);
    server.stdout.setEncoding('utf8');
    server.stderr.setEncoding('utf8');

    server.stdout.on('data', function (data) {
        deferred.notify(data);
        callback.serverLog(data);
    });
    server.stderr.on('data', function (data) {
        deferred.notify(data);
        callback.serverError(data);
    });
    server.once('exit', function (code, sig) {
        deferred.resolve({
            code: code,
            signal: sig
        });
        callback.serverExit(code, sig);
    });

    process.listeners('exit') || process.once('exit', callback.processExit);

    return deferred.promise;
};

/**
* stop the server
*/
exports.stop = function () {
    var deferred = Q.defer();
    if (server) {
        server.once('exit', function (code) {
            deferred.resolve(code);
        });

        debug(info('kill server'));
        //use SIGHUP instead of SIGKILL, see issue #34
        server.kill('SIGKILL');
        //server.removeListener('exit', callback.serverExit);
        server = undefined;
    }else{
        deferred.resolve(0);
    }
    if(lr){
        debug(info('close livereload server'));
        lr.close();
        //TODO how to stop tiny-lr from hanging the terminal
        lr = undefined;
    }

    return deferred.promise;
};

/**
* tell livereload.js to reload the changed resource(s)
*/
exports.notify = function (event) {
    if(event && event.path){
        var filepath = path.relative(__dirname, event.path);
        debug(info('file(s) changed: %s'), event.path);
        lr.changed({body: {files: [filepath]}});
    }

    return es.map(function(file, done) {
        var filepath = path.relative(__dirname, file.path);
        debug(info('file(s) changed: %s'), filepath);
        lr.changed({body: {files: [filepath]}});
        done(null, file);
    });
};
