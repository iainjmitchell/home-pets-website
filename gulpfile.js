const gulp = require('gulp')
const s3_user = require('./aws_security.json')
const awspublish = require('gulp-awspublish')

gulp.task('deploy', ()=> {
  const publisher = awspublish.create({
    region: 'eu-west-2',
    params: {
      Bucket: 'homepetsuk.com'
    },
    accessKeyId: s3_user.key,
    secretAccessKey: s3_user.secret
  });
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };
  return gulp.src('public/**/*')
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync())
    .pipe(awspublish.reporter());
})