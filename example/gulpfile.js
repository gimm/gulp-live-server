var gulp = require('gulp');
var gls = require('../index.js');

gulp.task('static', function() {
    var server = gls.static('static', 8000);
    server.start();
    gulp.watch(['static/**/*.css', 'static/**/*.html'], server.notify);
});

gulp.task('custom', function() {
    var server = gls('server.js');
    server.start().then(function(result) {
        console.log('Server exited with result:', result);
        process.exit(result.code);
    });
    gulp.watch(['static/**/*.css', 'static/**/*.html'], server.notify);
    gulp.watch('server.js', server.start);
});
