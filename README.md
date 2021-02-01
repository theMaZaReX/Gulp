# FAQ
## Обязательные для работы файлы
- ___fonts.scss__ и ___mixins.scss__ (для работы тасков fonts и fontsstyle)
## Структура проекта
- __project/__
- - __/pages/__
- - - _index.html_
- - - _*.html_
- - __/scss/__
- - - _style.scss_
- - - _*.scss_
- - __/js/__
- - - _scripts.js_
- - - _*.js_
- - __/fonts/__
- - - _*.ttf_
- - __/img/__
- - - _*.img_

### Tasks
#### 1. browser-sync
____
*__По умолчанию__* предполагается, что все html страницы будут находиться в _build/pages/_. Чтобы __browser-sync__ мог работать с этими _.html_ страницами используется необходимый код для *__task browser_sync__*:
```
function browser_sync(){
  browserSync.init({
    server: {
      baseDir: ["build/pages", "build"],
     },
    online: true
  })
}
```
Если предполагается только одна _.html_ страница, то её можно вынести в корень проекта и изменить *__task browser_sync__*:
```
function browser_sync(){
  browserSync.init({
    server: {
      baseDir: "build/"
     },
    online: true
  })
}
```
### 2. html
____
Просто копирует _html_ файлы из _path.source.html_

### 3. styles
____
Все _.scss_ файлы __должны__ подключаться в одном главном файле __style.scss__ с помощью _@import_.
____
Таск берет главный _style.scss_, конвертирует его в _style.css_, добавляет префиксы, минифицирует, создает sourcemaps, переименовывает в _style.min.css_ и помещает в _path.build.css_

Пример кода __style.scss__:
```
@import '_mixins.scss';
@import '_fonts.scss';
@import '_block.scss';

.container{
    display: flex;
    transition: all 1 ease-out;
    width:800px;
    margin: 20px auto;
    &__child{
        background-color:black;
        color:red;
    }
}
```

### 4. stylesbuild
____
Таск делает тоже самое что и таск __styles__, но не формирует sourcemaps и удаляет в _style.min.css_ все комментарии.

### 5. scripts
____
Все _.js_ файлы __объединяются__ в один файл .min.js с помощью пакета __gulp-concat__ и минифицируются с помощью __gulp-terser__.


Таск берет все скрипты по алфавитному порядку, конкатинирует, минифицирует, удаляет комментарии, создает sourcemaps, переименовывает в _scripts.min.js_ и помещает в _path.build.js_

Если нужно указать определенный порядок конкатенации скриптов, можно сделать так:
```
function scripts(){
 return src([path.source.jquery, sourceFolder + '/js/**/_*.js', sourceFolder + '/js/**/main.js'], {
        allowEmpty:true
   })
        .pipe(...)
        ...     
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream());
}
```

### 6. scriptsbuild
____
Таск делает тоже самое что и таск __scripts__, но не формирует sourcemaps, что убирает ссылку из файла _scripts.min.js_

### 3. images
____
Таск сживает только новые _img_ и помещает их в _path.build.img_

### 7. fonts & fontsstyle
____
__fonts__ конверитрует _.ttf_ файлы в _.woff_ и _.woff2_ и помещает их в _path.build.fonts_.
__fontsstyle__ подключает в _fonts.scss_ шрифты _.woff_ и _.woff2_ из path.build.fonts
```
@include font-face("AmaticSC-Regular", "AmaticSC-Regular", 400);
@include font-face("Inter-Medium-slnt=0", "Inter-Medium-slnt=0", 400);
@include font-face("Roboto-Regular", "Roboto-Regular", 400);
@include font-face("Montserrat-Bold", "Montserrat-Bold", 400);

```

__!!!!ВАЖНО__
__В__ *___fonts.scss__* __нужно__ __ручками__ __поправить__ *__font-weight__* __!!!!!!!__

### 8. startwhatch
___
Таск запускает __browser_sync__ и наблюдает за изменением файлов и запуском соответствующих тасков для файлов в папке проекта:
- *.html
- *.scss
- *.js
- *.img
- *.ttf

### 9. cleanbuild
___
Таск очищает папку _build/_
