const gulp = require('gulp')
const s3_user = require('./aws_security.json')
const awspublish = require('gulp-awspublish')
const sass = require('gulp-sass')
const w3cjs = require('gulp-w3cjs')
const mustache = require('gulp-mustache')
const rename = require('gulp-rename')
const clean = require('gulp-clean')

gulp.task('deploy', ['w3c-validation'], ()=> {
  const publisher = awspublish.create({
    region: 'eu-west-2',
    params: {
      Bucket: 'purrsandpawsuk.com'
    },
    accessKeyId: s3_user.key,
    secretAccessKey: s3_user.secret
  })
  const headers = {
    'Cache-Control': 'max-age=3600, no-transform, public'
  }
  return gulp.src('public/**/*')
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync())
    .pipe(awspublish.reporter())
})

gulp.task('sass', ['copy-fonts'], () => {
  return gulp.src(['./sass/*.scss'])
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
})
 
gulp.task('w3c-validation', ['build-pages'], () =>  {
  return gulp.src('public/*.html')
    .pipe(w3cjs())
    .pipe(w3cjs.reporter())
})

gulp.task('build-pages', ['sass'], () => {
  const parameters = require('./page-templates/page-parameters.json')

  return gulp.src('./page-templates/*.html')
    .pipe(mustache(parameters))
    .pipe(rename(function (path) {
      path.extname = ''
    }))
    .pipe(gulp.dest('./public'))
})

gulp.task('copy-fonts', ['clean'], () => {
  return gulp.src(['fonts/**/*'], { base: 'fonts' })
    .pipe(gulp.dest('public/fonts'))
})

gulp.task('clean', () => {
  return gulp.src('public', {read: false})
    .pipe(clean({force: true}))
})

gulp.task('watch', function() {
    gulp.watch(['./sass/**/*', './page-templates/**/*'], ['w3c-validation'])
})

gulp.task('default', ['w3c-validation'])