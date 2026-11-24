import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const salida = path.join(raiz, 'web-dist');
const bootstrap = '/js/prototipo/main.js';
const apiUrl = (
    process.env.VITE_API_URL ?? 'https://proyectofinanzas-oqqh.onrender.com/api'
).trim();

async function copiar(origen, destino) {
    await cp(origen, destino, { recursive: true });
}

function inyectarBootstrap(html) {
    if (html.includes(bootstrap) || !html.includes('</body>')) {
        return html;
    }

    return html.replace(
        '</body>',
        `        <script type="module" src="${bootstrap}"></script>\n    </body>`,
    );
}

async function generarPaginas() {
    const origen = path.join(raiz, 'resources/views/prototipo');
    const archivos = await readdir(origen);

    for (const archivo of archivos) {
        if (!archivo.endsWith('.html')) {
            continue;
        }

        const html = await readFile(path.join(origen, archivo), 'utf8');
        await writeFile(
            path.join(salida, archivo),
            inyectarBootstrap(html),
            'utf8',
        );
    }

    const login = await readFile(path.join(origen, 'login.html'), 'utf8');
    await writeFile(
        path.join(salida, 'index.html'),
        inyectarBootstrap(login),
        'utf8',
    );
}

async function fijarApiUrl() {
    const archivo = path.join(salida, 'js/prototipo/core/config.js');
    const contenido = await readFile(archivo, 'utf8');
    const reemplazo = `const apiUrl = ${JSON.stringify(apiUrl)};\n\nexport const API_BASE_URL = apiUrl || '/api';`;
    const actualizado = contenido.replace(
        /const apiUrl = [^\n]*;\n\nexport const API_BASE_URL = [^\n]*;/,
        reemplazo,
    );

    if (actualizado === contenido) {
        throw new Error('No se pudo fijar VITE_API_URL en config.js');
    }

    await writeFile(archivo, actualizado, 'utf8');
}

await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
await copiar(path.join(raiz, 'resources/css'), path.join(salida, 'css'));
await copiar(
    path.join(raiz, 'resources/js/prototipo'),
    path.join(salida, 'js/prototipo'),
);
await generarPaginas();
await fijarApiUrl();

process.stdout.write(
    `Web estática generada en ${path.relative(raiz, salida)} con API ${apiUrl}\n`,
);
