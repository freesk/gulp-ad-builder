const gulp = require('gulp');

/* default */
const fs = require('fs');

/* Zip */
const zip = require('gulp-zip');

/* mixed */
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const watch = require('gulp-watch');
const del = require('del');
const runSequence = require('run-sequence');
const path = require('path');
const argv = require('yargs').argv;
const mergeStream = require('merge-stream');
const columnify = require('columnify');
const readlineSync = require('readline-sync');

/* css */
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-minify-css');

/* js */
const jsuglify = require('gulp-uglify');

/* images */
const base64 = require('gulp-base64');
const sprity = require('sprity');
const image = require('gulp-image');

const excludedFolders = ['.git', '.sass-cache', 'node_modules', 'upload', '.workspace', 'lib', 'static'];
let folders;
let targetFolder;
let toDelete = [];
let scssProcess;
let imgProcess;
let jsProcess;
let watchProcess;
let nonRetina;

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

function getWorkingFolders() {
  // get all folder in the root
  folders = getFolders('./');
  // remove skipped folders
  excludedFolders.map(function(item) {
    const index = folders.indexOf(item);
    if (index > -1)
      folders.splice(index, 1);
  });
}

function getUserInput() {
  // get all possible flags from the console input
  nonRetina = argv['non-retina'] ? true : false;
  scssProcess = argv.s ? true : false;
  imgProcess = argv.i ? true : false;
  jsProcess = argv.j ? true : false;
  watchProcess = argv.w ? true : false;
}

function processUserInput() {
  if (!(imgProcess || scssProcess || imgProcess || jsProcess)) {
    toDelete = [targetFolder + '/src/.TEMP/\*'];
    imgProcess = true;
    scssProcess = true;
    imgProcess = true;
    jsProcess = true;
    return;
  }

  if (imgProcess)
    toDelete.push('*.png', 'sprite.css');
  if (scssProcess)
    toDelete.push('style.css');
  if (imgProcess || scssProcess)
    toDelete.push('bundle.css');
  if (jsProcess)
    toDelete.push('bundle.js');

  // apply the target folder path
  for (let i = 0; i < toDelete.length; i++)
    toDelete[i] = targetFolder + '/src/.TEMP/' + toDelete[i];
}

function selectFolder(callback) {
  getUserInput();
  getWorkingFolders();
  // create an object for a good looking output
  let data = {};
  for (let i = 0; i < folders.length; i++) data[folders[i]] = i;
  console.log('\r');
  // log the table
  console.log(columnify(data, {
    columns: ['FOLDER', 'INDEX']
  }));
  console.log('\r');
  // ask user for a folder index
  const n = readlineSync.questionInt('Please enter the index: ');
  console.log('\r');
  // check for an error
  if (!isNumeric(n) || n > folders.length)
    return callback(new Error("Oops. That does not work.."));
  // point to the target folder
  targetFolder = folders[n];
  // notify about the selected folder name
  console.log('The target folder is ' + '\"' + targetFolder + '\"');
  console.log("\r");
  console.log(nonRetina ? 'css1x.hbs' : 'css2x.hbs');
  // process user input once target folder is found
  processUserInput();
  // debug processes
  // console.log("-w", watchProcess);
  // console.log("-j", jsProcess);
  // console.log("-s", scssProcess);
  // console.log("-i", imgProcess);
  console.log('\r');
  // call the callback
  callback(null);
}

// check if it's a number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// define "deploy" task
gulp.task('deploy', function() {
  runSequence('deploy-clean', 'zip');
});

// clean "upload" folder
gulp.task('deploy-clean', function() {
  return del('upload');
});

// zip all folders
gulp.task('zip', function() {
  let tasks = [];
  getWorkingFolders();
  for (let i = 0; i < folders.length; i++) {
    const targetFolder = folders[i];
    tasks.push(gulp.src([(targetFolder + '/index.html'), (targetFolder + '/default.jpg')])
      .pipe(zip(targetFolder + '.zip'))
      .pipe(gulp.dest('upload'))
    );
  }
  return mergeStream(tasks);
});

// inject CSS and JS files into ./*/src/index.html and move to ./*/index.html
gulp.task('build-html', function() {
  return gulp.src(targetFolder + '/src/index.html')
    .pipe(replace(/<!-- CSS injection -->/, function() {
      const style = fs.readFileSync(targetFolder + '/src/.TEMP/bundle.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(replace(/<!-- JS injection -->/, function() {
      const script = fs.readFileSync(targetFolder + '/src/.TEMP/bundle.js', 'utf8');
      return '<script>\n' + script + '\n</script>';
    }))
    .pipe(gulp.dest(targetFolder + '/'))
});

// clean .TEMP folder
gulp.task('build-clean', function() {
  return del(toDelete);
});

// convert the png sprite to base64 and inject into a css file
gulp.task('base64', function() {
  return gulp.src(targetFolder + '/src/.TEMP/sprite.css')
    .pipe(base64({
      baseDir: targetFolder + '/src/.TEMP/',
      extensions: ['png'],
      maxImageSize: 1000000, // bytes
      debug: true
    }))
    .pipe(gulp.dest(targetFolder + '/src/.TEMP'));
});

// compress the png sprite
gulp.task('compress-img', function(cb) {
  return gulp.src(targetFolder + '/src/.TEMP/' + (nonRetina ? 'sprite.png' : 'sprite@2x.png')) // sprite.png no longer used
    .pipe(image())
    .pipe(gulp.dest(targetFolder + '/src/.TEMP'));
});

// collect all css files and make one
gulp.task('build-css', function() {
  return gulp.src(targetFolder + '/src/.TEMP/*.css')
    .pipe(concat('bundle.css'))
    .pipe(minify())
    .pipe(gulp.dest(targetFolder + '/src/.TEMP'));
});

// compile sass/scss files
gulp.task('build-scss', function() {
  return gulp.src(targetFolder + '/src/scss/*.scss')
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(targetFolder + '/src/.TEMP'));
});

// create the png sprite
gulp.task('build-img', function() {
  return sprity.src({
      src: targetFolder + '/src/images/*.png',
      style: 'sprite.css',
      cssPath: '/',
      margin: 5,
      template: (nonRetina ? 'css1x.hbs' : 'css2x.hbs'),
      dimension: [
        { ratio: 1, dpi: 72 }, // for css1x
        { ratio: 2, dpi: 192 } // for css2x
      ]
    })
    .pipe(gulp.dest(targetFolder + '/src/.TEMP'));
});

// minify JS file(s)
gulp.task('build-js', function() {
  return gulp.src(targetFolder + '/src/js/*.js')
    .pipe(concat('bundle.js'))
    .pipe(jsuglify())
    .pipe(gulp.dest(targetFolder + '/src/.TEMP'));
});

gulp.task('move', function() {
  // define files to move
  const filesToMove = [targetFolder + '/*.*'];

  gulp.src(filesToMove, {
      base: './' + targetFolder
    })
    .pipe(gulp.dest('./.workspace'));
});

gulp.task('default', function() {
  selectFolder(function(err) {
    if (err) return console.log(err);
    // define files to watch
    const filesToWatch = [
      targetFolder + '/src/js/*.js',
      targetFolder + '/src/scss/*.scss',
      targetFolder + '/src/images/*.png',
      targetFolder + '/src/index.html'
    ];

    // first run
    runSequence(
      'build-clean',
      ['build-js', 'build-img', 'build-scss'],
      'compress-img',
      'base64',
      'build-css',
      'build-html',
      'move'
    );

    if (watchProcess) {
      // customize the watch task depending on the user input
      eval(
        "watch(filesToWatch, function() {" +
        "runSequence(" +
        "'build-clean'," +
        "[" +
        (jsProcess ? "'build-js'," : "") + //
        (imgProcess ? "'build-img'," : "") + // these are running at the same time
        (scssProcess ? "'build-scss'" : "") + //
        "]," +
        (imgProcess ? "'compress-img'," : "") +
        (imgProcess ? "'base64'," : "") +
        ((imgProcess || scssProcess) ? "'build-css'," : "") +
        "'build-html'," +
        "'move'" +
        ");" +
        "});"
      );
    }

  });
});
