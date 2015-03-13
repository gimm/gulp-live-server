# gulp-live-server

[![Build Status][1]][2] [![Live server downloads][3]][4] [![Tag][9]][8] [![WTF Licensed][5]](http://www.wtfpl.net/)

[1]: http://img.shields.io/travis/gimm/gulp-live-server/master.svg
[2]: https://travis-ci.org/gimm/gulp-live-server

[3]: http://img.shields.io/npm/dm/gulp-live-server.svg
[4]: https://www.npmjs.com/package/gulp-live-server

[5]: http://img.shields.io/badge/license-WTFPL-blue.svg

[8]: https://github.com/gimm/gulp-live-server/releases
[9]: https://img.shields.io/github/tag/gimm/gulp-live-server.svg

A gulp plugin which serve your app(static or dynamic) with livereload, internally, it does the following:
 * use [`ChildProcess.spawn`](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) to start a node process;
 * use [`tiny-lr`](https://github.com/mklabs/tiny-lr) provide livereload ability;

## Install
[![NPM](https://nodei.co/npm/gulp-live-server.png?compact=true)](https://nodei.co/npm/gulp-live-server/)

## Update notice


## API

### server.run([args][,options][,livereload])
Run/re-run the script file, which will create a http(s) server.

Start a livereload(tiny-lr) server if it's not started yet.

Use the same arguments with [ChildProcess.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with 'node' as command.

* `args` - `Array` - Array List of string arguments. The default value is `['app.js']`.
* `options` - `Object` - The third parameter for [ChildProcess.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options), the default value is:
```js
options = {
    cwd: undefined
}
options.env = process.env;
options.env.NODE_ENV = 'development';
```
* `livereload` - `Boolean|Number|Object` - The option for tiny-lr server. The default value is `35729`.
    * `false` - will disable tiny-lr livereload server.
    * `number` - treated as port number of livereload server.
    *  `object` - used to create tiny-lr server `new tinylr.Server(livereload);`.
* Returns a [ChildProcess](http://nodejs.org/api/child_process.html#child_process_class_childprocess) instance of spawned server.

### server.stop()
Stop the instantiated spawned server programmatically, and the tiny-lr server.

### server.notify([event])
Send a notification to the tiny-lr server in order to trigger a reload on page.
pipe support is added after v0.1.5, so you can also do this:
```js
gulp.src('css/*.css')
// …
.pipe(gulp.dest('public/css/'))
.pipe(server.notify())
```
* `event` (required when server.notify is invoked without pipe) - `Object` - Event object that is normally passed to [gulp.watch](https://github.com/gulpjs/gulp/blob/master/docs/API.md#cbevent) callback.
Should contain `path` property with changed file path.

## Usage

```js
// gulpfile.js
var gulp = require('gulp');
var server = require('gulp-live-server');

gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run(['app.js']);

    // Restart the server when file changes
    gulp.watch(['app/**/*.html'], server.notify);
    gulp.watch(['app/styles/**/*.scss'], ['styles:scss']);
    //gulp.watch(['{.tmp,app}/styles/**/*.css'], ['styles:css', server.notify]);
    //Event object won't pass down to gulp.watch's callback if there's more than one of them.
    //So the correct way to use server.notify is as following:
    gulp.watch(['{.tmp,app}/styles/**/*.css'], function(event){
        gulp.run('styles:css');
        server.notify(event);
        //pipe support is added for server.notify since v0.1.5,
        //see https://github.com/gimm/gulp-live-server#servernotifyevent
    });

    gulp.watch(['app/scripts/**/*.js'], ['jshint']);
    gulp.watch(['app/images/**/*'], server.notify);
    gulp.watch(['app.js', 'routes/**/*.js'], [server.run]);
});
```
```js
// app.js
var express = require('express');
var app = module.exports.app = exports.app = express();

//you won't need 'connect-livereload' if you have livereload plugin for your browser
app.use(require('connect-livereload')());
```
