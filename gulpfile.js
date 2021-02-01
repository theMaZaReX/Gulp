const { notify } = require('browser-sync');
const { src, dest, parallel, series, watch } = require('gulp');

const buildFolder = 'build',
    sourceFolder = 'src';

const sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCss     = require('gulp-clean-css'),
    rename       = require('gulp-rename'),
    sourceMaps   = require('gulp-sourcemaps'),
    browserSync  = require('browser-sync').create(),
    imagemin     = require('gulp-imagemin'),
    newer        = require('gulp-newer'),
    ttf2woff     = require('gulp-ttf2woff'),
    ttf2woff2    = require('gulp-ttf2woff2'),
    fs           = require('fs'),
    del          = require('del'),
    terser       = require("gulp-terser"),
    concat       = require('gulp-concat');


const path = {
    source:{
        html: './pages/*.html',
        scss: sourceFolder + '/scss/style.scss',
        js: sourceFolder + '/js/**/*.js',
        jquery: 'node_modules/jquery/dist/jquery.min.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: sourceFolder + '/fonts/**/*.ttf'
    },
    build:{
        html: buildFolder + '/pages/',
        styles: buildFolder + '/' + sourceFolder + '/css/',
        js: buildFolder + '/' + sourceFolder + '/js/',
        img: buildFolder + '/' + sourceFolder + '/img/',
        fonts: buildFolder + '/' + sourceFolder + '/fonts/'
    },
    whatch:{
        html: './pages/*.html',
        styles: sourceFolder + '/scss/**/*.scss',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.img',
        fonts: sourceFolder + '/fonts/**/*.ttf'
    }
}

function browser_sync(){
    browserSync.init({
        server: {
            baseDir: ["build/pages", "build"],
        },
        online: true
    })

}

function html(){
    return src(path.source.html)
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function styles(){
    return src(path.source.scss)
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(sass({
            errLogToConsole: true
        })).on('error', console.error.bind(console))
        .pipe(autoprefixer())
        .pipe(cleanCss())
        .pipe(rename({
            suffix:'.min'
        }))
        .pipe(sourceMaps.write('map'))
        .pipe(dest(path.build.styles))
        .pipe(browserSync.stream({match: '**/*.css'}));
}

function stylesbuild(){
    return src(path.source.scss)
        .pipe(sass({
            sourceMap: 'scss',
            errLogToConsole: true
        })).on('error', console.error.bind(console))
        .pipe(autoprefixer())
        .pipe(rename({
            suffix:'.min'
        }))
        .pipe(cleanCss( {level: {1: {specialComments: 0}}}))
        .pipe(dest(path.build.styles))
        .pipe(browserSync.stream());
}

function scripts(){
    //Если нужно чтобы файлы конкатенировались в опеределенном порядке

//   return src([path.source.jquery, sourceFolder + '/js/**/_*.js', sourceFolder + '/js/**/main.js', sourceFolder + '/js/**/*.js'], {
//        allowEmpty:true
//    })

    return src(path.source.js, {
        allowEmpty:true
    })
        .pipe(sourceMaps.init({largeFile: true}))
        .pipe(concat('scripts.min.js'))
        .pipe(terser())
        .pipe(sourceMaps.write('map'))
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream());
}


function scriptsbuild(){
    return src([path.source.jquery, path.source.js], {
        allowEmpty:true
    })
        .pipe(concat('scripts.min.js'))
        .pipe(terser({
            output:{
                comments:false
            }
        }))
        .pipe(dest(path.build.js))
}

function images(){
    return src(path.source.img)
        .pipe(newer(path.build.img))
        .pipe(imagemin({
            optimizationLevel: 5
        }))
        .pipe(dest(path.build.img))
}

const fonts = () => {
    src(path.source.fonts)
        .pipe(newer(path.build.fonts))
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts))
    return src(path.source.fonts)
        .pipe(newer(path.build.fonts))
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

const cb = () => {}

let srcFonts = './src/scss/_fonts.scss';
let buildFonts = path.build.fonts;

const fontsstyle = (done) => {
    let file_content = fs.readFileSync(srcFonts);

    fs.writeFile(srcFonts, '', cb);
    fs.readdir(buildFonts, function (err, items) {
        if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
                let fontname = items[i].split('.');
                fontname = fontname[0];
                if (c_fontname != fontname) {
                    fs.appendFile(srcFonts, '@include font-face("' + fontname + '", "' + fontname + '", 400);\r\n', cb);
                }
                c_fontname = fontname;
            }
        }
    })

    done();
}


function startWatch(){
    browser_sync();
    watch(path.whatch.styles, styles);
    watch([sourceFolder + '/js/**/*.js', '!'+buildFolder+sourceFolder+'/js/scripts.min.js'], scripts);
    watch(path.whatch.html, html);
    watch(path.source.img, images);
    watch(path.whatch.fonts, series(fonts, fontsstyle));
}

function cleanbuild(){
    return del(buildFolder + '/**/*', {force: true});
}


exports.startWatch = startWatch;
exports.browser_sync = browser_sync;
exports.html = html;
exports.styles = styles;
exports.stylesbuild = stylesbuild;
exports.scripts = scripts;
exports.scriptsbuild = scriptsbuild;
exports.images = images;
exports.fonts = fonts;
exports.fontsstyle = fontsstyle;
exports.cleanbuild = cleanbuild;
exports.default =  series(cleanbuild, parallel(scripts, styles, images, html, fonts), fontsstyle, startWatch);
exports.build = series(cleanbuild, parallel(scriptsbuild, stylesbuild, images, html, fonts), fontsstyle);
