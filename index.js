'use strict';
/**
 * Created by gimm on 3/13/2015.
 */

var util = require('util'),
    path = require('path'),
    spawn = require('child_process').spawn,
    merge = require('deepmerge'),
    tinylr = require('tiny-lr'),
    es = require('event-stream'),
    Q = require('q'),
    chalk = require('chalk'),
    debug = require('debug')('gulp-live-server');

var server_script = 'index.js',
    static_script = path.join(__dirname, 'scripts/static.js'),
    static_folder = 'public';


var config = {
        args: [static_script],
        options: { cwd: undefined },
        livereload: {
            port: 35729
        },
        static: false
    },
    server = undefined, // the server child process
    lr = undefined, // tiny-lr server
    info = chalk.gray,
    error = chalk.bold.red;

// config.options.cwd = process.cwd();
config.options.env = process.env;
config.options.env.server_ENV = 'development';

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
 * Config the server process
 * @type {Function}
 */
module.exports = exports = (function() {
    return function(args, options, livereload, isstatic){
        if(isstatic === true){
            //arguments list should be [folder(s), port, livereload]
            config.static = true;
            config.args = [static_script ,args, options];
        }else {
            config.static = false;
            if (typeof args === 'string' && args.length) {
                args = [args];
            }
            if (util.isArray(args) && args.length) {
                config.args = args;
            } else {
                config.args = [server_script];
            }

            config.options = merge(config.options, options || {});
        }
        //deal with livereload
        if (livereload === false) {   //livereload disabled
            config.livereload = false;
        } else if (livereload) {
            if (typeof livereload === 'object') {
                config.livereload = livereload;
            } else {
                config.livereload.port = livereload;
            }
        }
        return exports;
    };
})();

exports.static = function (folder, port, livereload) {
    folder = folder || process.cwd();
    port = port || 3000;
    return exports(folder, port, livereload, true);
};

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
    server = spawn('node', config.args, config.options);
    server.stdout.setEncoding('utf8');
    server.stderr.setEncoding('utf8');

    server.stdout.on('data', function(code, sig){
        callback.serverLog(code, sig);
        deferred.resolve(code);
    });
    server.stderr.on('data', callback.serverError);
    server.once('exit', callback.serverExit);

    process.listeners('exit') || process.once('exit', callback.processExit);

    var deferred = Q.defer();
    return deferred.promise;
};

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