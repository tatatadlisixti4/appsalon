import path from 'path' // modulo con exportancion por defecto (1 funcion principal para aceder a todas)
import fs from 'fs'
import { glob } from 'glob' // modulo con exportancion por nombre(multiples funciones principales ¿inconexas entre si?)
import { src, dest, watch, series } from 'gulp' // modulo con exportancion por nombre(multiples funciones principales ¿inconexas entre si?)  
/* 
src: leer
dest: enviar:
watch: observar cambios en archivos
series: ejecutar tareas en serie, una tras otra en orden secuencial
*/
import * as dartSass from 'sass'  // para compilar archivos .scss y sass
import gulpSass from 'gulp-sass' // puente entre Gulp (un task runner para automatización de tareas) y Sass
import terser from 'gulp-terser' // herramienta que se usa para minificar JavaScript
import sharp from 'sharp' // libreria para el procesamiento de imagenes

const sass = gulpSass(dartSass) // indicando a Gulp que utilice Dart Sass como el motor para realizar la compilación de los archivos .scss o .sass

const paths = {
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js'
}

export function css( done ) { // done es un callback que usa gulp para saber si puede continuar con las otras tareas
    src(paths.scss, {sourcemaps: true}) // src specifica los archivos de origen que se van a procesar, el source map ayuda al navegador a mapear el codigo css que fue generado con sass
        .pipe( sass({ // pipe es un metodo de gulp que encadena flujos de trabajo, permite pasar el archivo .sass en varias operaciones como compil, mimificacion, etc.
            outputStyle: 'compressed' // se compila con el sass creado el archivo .scss, el outputstyle lo comprime(mimifica).
        }).on('error', sass.logError) ) // manejio de error para que se muestre el log en la consola
        .pipe( dest('./public/build/css', {sourcemaps: '.'}) ); // se escriben los archivos procesados en la carpeta de destino, el segundo parametro indica que los sourcemap deben guardarse en la misma carpeta de destino que los archivos css generados("." hace ref a la misma carpeta)
    done() // aqui se llama al callback pasado por gulp para indicar que la tarea fue resuelta. con esto gulp sabe que puede continuar con otros procesos
}

export function js( done ) {  
    src(paths.js)
        .pipe(terser())
        .pipe(dest('./public/build/js'))
    done()
}

export async function imagenes(done) {
    const srcDir = './src/img';
    const buildDir = './public/build/img';
    const images =  await glob('./src/img/**/*')

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {  // comprueba existencia del dir
        fs.mkdirSync(outputSubDir, { recursive: true })  // lo crea si no existe y el recurssive true permite crear dir anidados(subdir)
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)

    if (extName.toLowerCase() === '.svg') { // si el archivo ya es svg, no debería estar en este dir, deberia estar en public
        // If it's an SVG file, move it to the output directory
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        fs.copyFileSync(file, outputFile);
    } else {
        // For other image formats, process them with sharp
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
        const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);
        const options = { quality: 80 };

        sharp(file).jpeg(options).toFile(outputFile);
        sharp(file).webp(options).toFile(outputFileWebp);
        sharp(file).avif().toFile(outputFileAvif);
    }
}

export function dev() {
    watch( paths.scss, css );
    watch( paths.js, js );
    watch('src/img/**/*.{png,jpg}', imagenes)
}

export default series( js, css, imagenes, dev );
export const build =  series(js, css, imagenes);
