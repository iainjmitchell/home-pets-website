const gulp = require('gulp')
const s3_user = require('./aws_security.json')
const awspublish = require('gulp-awspublish')
const sass = require('gulp-sass')
const w3cjs = require('gulp-w3cjs')
const mustache = require('gulp-mustache')
const rename = require('gulp-rename')
const clean = require('gulp-clean')
const vinylPaths = require('vinyl-paths')
const del = require('del')

gulp.task('deploy', ['removeHtmlExt'], ()=> {
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

gulp.task('removeHtmlExt', ['createHtmlWithoutExt'], () => {
  return gulp.src('public/*.html')
    .pipe(vinylPaths(del))
})

gulp.task('createHtmlWithoutExt', ['w3c-validation'],  () => {
  return gulp.src('public/*.html')
    .pipe(rename(function (path) {
      path.extname = ''
    }))
    .pipe(gulp.dest('./public'))
})

gulp.task('sass', ['copy-gel'], () => {
  return gulp.src(['./sass/*.scss'])
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
})

gulp.task('copy-gel', ['copy-images'],() => {
  return gulp.src('./node_modules/gel-grid/gel-grid.css/gel-grid.min.css')
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
    .pipe(gulp.dest('./public'))
})

gulp.task('copy-fonts', ['copy-supporting-files'], () => {
  return gulp.src(['fonts/**/*'], { base: 'fonts' })
    .pipe(gulp.dest('public/fonts'))
})

gulp.task('copy-supporting-files', ['clean'], () => {
  return gulp.src(['supporting-files/**/*'], { base: 'supporting-files' })
    .pipe(gulp.dest('public'))
})

gulp.task('copy-images', ['copy-fonts'], () => {
  return gulp.src(['images/**/*'], { base: 'images' })
    .pipe(gulp.dest('public/images'))
})

gulp.task('clean', () => {
  return gulp.src('public', {read: false})
    .pipe(clean({force: true}))
})

gulp.task('watch', function() {
    gulp.watch(['./sass/**/*', './page-templates/**/*'], ['w3c-validation'])
})

gulp.task('default', ['w3c-validation'])
