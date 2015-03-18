gulp-live-server
===

[![status][1]][2] [![downloads][3]][4] [![tag][5]][6] [![license][7]][8]

[1]: http://img.shields.io/travis/gimm/gulp-live-server/master.svg?style=flat-square
[2]: https://travis-ci.org/gimm/gulp-live-server

[3]: http://img.shields.io/npm/dm/gulp-live-server.svg?style=flat-square
[4]: https://www.npmjs.com/package/gulp-live-server

[5]: https://img.shields.io/github/tag/gimm/gulp-live-server.svg?style=flat-square
[6]: https://github.com/gimm/gulp-live-server/releases

[7]: http://img.shields.io/badge/license-WTFPL-blue.svg?style=flat-square
[8]: http://www.wtfpl.net

A handy, light-weight server you're going to love.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
    - [static](#staticfolderport)
    - [new](#newscript)
    - [start](#start)
    - [stop](#stop)
- [livereload.js](#livereloadjs)
- [Debug](#debug)

Install
---
[![NPM](https://nodei.co/npm/gulp-live-server.png?compact=true)](https://nodei.co/npm/gulp-live-server/)

Usage
---
- serve a static folder

	```js
    var gulp = require('gulp');
    var gls = require('gulp-live-server');
    gulp.task('serve', function() {
    	var server = gls.static();
    	server.start();
        //live reload changed resource(s)
    	gulp.watch(['static/**/*.css', 'static/**/*.html'], server.notify);
	});
    ```
- fire up your own server

	```js
    gulp.task('serve', function() {
    	var server = gls.new('myapp.js');
    	server.start();
    	gulp.watch(['static/**/*.css', 'static/**/*.html'], server.notify);
        //restart my server
        gulp.watch('myapp.js', server.start);
	});
    ```
More [examples](https://github.com/gimm/gulp-live-server/tree/master/example)

API
---
### static([folder][, port])
- `folder` - `String|Array` The folder(s) to serve.
    Use array of strings if there're multi folders to serve.
    If omitted, defaults to `public/`.
- `port` - `Number` The port to listen on. Defaults to `3000`.
- return [gls](#glsargs-options-livereload).

Config new server using the default server `script`, to serve the given `folder` on the specified `port`.

### new(script)
- `script` - `String` The script file to run.
- return [gls](#glsargs-options-livereload).

Config new server using the given `script`.

### gls(args[, options][, livereload])
- `args` - `Array` The 2nd param for [ChildProcess.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).
- `options` - `Object` The 3rd param for [ChildProcess.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options),
will be mixin into the default value:

    ```js
        options = {
            cwd: undefined
        }
        options.env = process.env;
        options.env.NODE_ENV = 'development';
    ```
- `livereload` - `Boolean|Number|Object` The option for tiny-lr server. The default value is `35729`.
    - `false` - will disable tiny-lr livereload server.
    - `number` - treated as port number of livereload server.
    - `object` - used to create tiny-lr server new tinylr.Server(livereload);

**`gls` here is a reference of `var gls = require('gulp-live-server')`**. `static` and `new` are shortcuts for this.

### start()
- return [promise](https://github.com/kriskowal/q/wiki/API-Reference) from [Q](https://www.npmjs.com/package/q)

Spawn a new child process based on the configuration.
- use [`ChildProcess.spawn`](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) to start a node process;
- use [`tiny-lr`](https://github.com/mklabs/tiny-lr) provide livereload ability;

### stop()
- return [promise](https://github.com/kriskowal/q/wiki/API-Reference) from [Q](https://www.npmjs.com/package/q)

Stop the server.

### notify([event])
- `event` - `Event` Event object passed along with [gulp.watch](https://github.com/gulpjs/gulp/blob/master/docs/API.md#cbevent).
Optional when used with `pipe`.

Tell livereload.js to reload the changed resource(s)

livereload.js
---
glup-live-server comes with [tiny-lr](https://github.com/mklabs/tiny-lr/) built in, which works as a livereload server,

In order to make livereload work with your pages, you still need `livereload.js` loaded with your page, there're 3 options to achieve this:
- [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) for Chrome;
- Use [connect-livereload](https://github.com/intesso/connect-livereload) middleware;
- Add [livereload.js](https://github.com/livereload/livereload-js) in your page mannully;

Usually, you can check `http://livereload:35729/livereload.js` to see if livereload.js is loaded with your page.

DEBUG
---
If you want more output, set the `DEBUG` environment variables to `*` or `gulp-live-server`.


