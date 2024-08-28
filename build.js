const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./src/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outdir: 'dist',
    minify: true,
    sourcemap: false,
}).catch(() => process.exit(1));
