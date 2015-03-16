var gulp = require('gulp');
var gls = require('../index.js');

gulp.task('static', function() {
    var server = gls.static('static', 8888);
    server.start();
    gulp.watch(['static/**/*.css', 'static/**/*.html'], server.notify);
    gulp.watch(['static/**/*.html'], server.stop);
});

gulp.task('custom', function() {
    var server = gls('server.js');
    server.start();
    gulp.watch(['static/**/*.css', 'static/**/*.html'], server.notify);
    gulp.watch('server.js', server.start);
});