/*
    **************************************************

    Gulpfile creator

    **************************************************

    nickname: Dmitriy_Corty
    organization: "totonis.com"
    date: 25.06.2018
    email: dmitriy.corty@gmail.com

    **************************************************
*/

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    rename = require('gulp-rename'),
    imgmin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    htmlmin = require('gulp-htmlmin'),
    mediaGroup = require('gulp-group-css-media-queries'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    fileinclude = require('gulp-file-include'),
    reload = browserSync.reload,
    sassGlob = require('gulp-sass-glob');

var serverConfig = {
    server: {
        baseDir: "dev" // The root folder for the server
    },
    ui: {
        port: 3001 // Your port, for server settings
    },
    notify: false, // Сancel page update notifications
    port: 3000, // Your port on the server
    ghostMode: false, // Disable guest tracking
    logPrefix: "Name Project",
    host: "localhost",
    tunnel: false, // Your developer name
    open: "local" // Opens a server(local, tunnel, external)
};

var path = {
    dist: {
        html: 'dist/',
        css: 'dist/assets/css/',
        js: 'dist/assets/js/',
        img: 'dist/assets/img/',
        fonts: 'dist/assets/font/',
        video: 'dist/assets/video/',
        lib: 'dist/assets/lib/'
    },
    src: {
        html: 'src/*.html',
        css: 'src/assets/css/main.css',
        scss: 'src/assets/scss/main.scss',
        js: 'src/assets/js/main.js',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/font/**/*.*',
        video: 'src/assets/video/**/*.*',
        lib: [
            'src/assets/lib/**/*.css',
            'src/assets/lib/**/*.js'
        ]
    },
    watch: {
        html: 'src/**/*.html',
        scss: 'src/assets/scss/**/*.scss',
        js: 'src/assets/js/**/*.js',
        img: 'src/assets/img/**/*.*'
    },
    dev: {
        html: 'dev/',
        css: 'dev/assets/css/',
        js: 'dev/assets/js/',
        img: 'dev/assets/img/',
        fonts: 'dev/assets/font/',
        video: 'dev/assets/video/',
        lib: 'dev/assets/lib/'
    }
}


// **********  Clean dist repository  **********

gulp.task('rm-dist', function() {
    return gulp.src('dist')
        .pipe(clean())
});

// ********** Localhost task **********

gulp.task('webserver', function() {
    browserSync(serverConfig);
});

// ********** Clean js for watcher **********

gulp.task('clean-js', function() {
    return gulp.src(['src/assets/js/main.js', 'src/assets/js/main.js.map', 'dev/assets/js/main.js', 'dev/assets/js/main.js.map'])
        .pipe(clean())
})

// ********** Watch **********

gulp.task('js', ['clean-js'], function() {
    return gulp.src(path.watch.js)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('', {
            sourceMappingURLPrefix: ''
        }))
        .pipe(gulp.dest('./dev/assets/js/'))
        .pipe(browserSync.reload({ stream: true }));
})

gulp.task('html', function() {
    gulp.src(path.src.html)
        .pipe(fileinclude())
        .pipe(gulp.dest(path.dev.html))
        .pipe(browserSync.reload({ stream: true }));
})

gulp.task('sass', function() {
    return gulp.src(path.src.scss)
        .pipe(sassGlob())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError)) // Сompile scss to css
        .pipe(mediaGroup())
        .pipe(sourcemaps.write('', {
            sourceMappingURLPrefix: ''
        }))
        .pipe(gulp.dest('./dev/assets/css/'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('font', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dev.fonts))
});

gulp.task('lib', function() {
    gulp.src(path.src.lib)
        .pipe(gulp.dest(path.dev.lib))
})

gulp.task('img', function() {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.dev.img))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('default', ['webserver', 'html', 'font', 'lib', 'img', 'sass', 'js'], function() {
    gulp.watch(path.watch.scss, ['sass']);
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.js, ['js']);
    gulp.watch(path.watch.img, ['img']);
});


// **********  Tasks for build project  **********

gulp.task('build-html', function() {
    gulp.src(path.src.html)
        // .pipe(htmlmin({collapseWhitespace: true}))	// Minification html  // Uncomment if you need compressed HTML
        .pipe(fileinclude())
        .pipe(gulp.dest(path.dist.html))
});

gulp.task('build-js', function() {
    gulp.src('dev/assets/js/main.js') // Initialize sourcemap
        .pipe(babel({ // Change to prev version
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
});

gulp.task('build-css', function() {
    gulp.src('dev/assets/css/main.css')
        .pipe(mediaGroup()) // Collect media queris together
        .pipe(autoprefixer()) // Add lib prefixes
        .pipe(csso()) // Compretion css
        .pipe(gulp.dest(path.dist.css))
});

gulp.task('build-img', function() {
    gulp.src(path.src.img)
        .pipe(imgmin({ // Compretion image
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img))
});

gulp.task('build-fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('build-lib', function() {
    gulp.src(path.src.lib)
        .pipe(gulp.dest(path.dist.lib))
})

gulp.task('build', ['build-html', 'build-js', 'build-css', 'build-img', 'build-fonts', 'build-lib']);