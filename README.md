# gulp-live-server

[![status][1]][2] [![downloads][3]][4] [![tag][5]][6] [![license][7]](http://www.wtfpl.net/)
[1]: http://img.shields.io/travis/gimm/gulp-live-server/master.svg?style=flat-square
[2]: https://travis-ci.org/gimm/gulp-live-server
[3]: http://img.shields.io/npm/dm/gulp-live-server.svg?style=flat-square
[4]: https://www.npmjs.com/package/gulp-live-server
[5]: https://img.shields.io/github/tag/gimm/gulp-live-server.svg?style=flat-square
[6]: https://github.com/gimm/gulp-live-server/releases
[7]: http://img.shields.io/badge/license-WTFPL-blue.svg?style=flat-square
gulp-live-server is a light-weight and easy-to-use server you're going to love.
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


```js

```

## Install
[![NPM](https://nodei.co/npm/gulp-live-server.png?compact=true)](https://nodei.co/npm/gulp-live-server/)
