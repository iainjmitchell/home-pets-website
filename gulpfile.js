const gulp = require('gulp')
const s3_user = require('./aws_security.json')
const awspublish = require('gulp-awspublish')
const sass = require('gulp-sass')
const w3cjs = require('gulp-w3cjs')

gulp.task('deploy', ['sass', 'w3c-validation'], ()=> {
  const publisher = awspublish.create({
    region: 'eu-west-2',
    params: {
      Bucket: 'homepetsuk.com'
    },
    accessKeyId: s3_user.key,
    secretAccessKey: s3_user.secret
  })
  const headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  }
  return gulp.src('public/**/*')
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync())
    .pipe(awspublish.reporter())
})

gulp.task('sass', () => {
  return gulp.src(['./sass/*.scss'])
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
})
 
gulp.task('w3c-validation', () =>  {
    gulp.src('public/*.html')
        .pipe(w3cjs())
        .pipe(w3cjs.reporter());
})