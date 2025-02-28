import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';
import typescript from '@rollup/plugin-typescript';
import { readdirSync } from 'fs';

// Automatically discover components in src/components directory
const componentFiles = readdirSync('./src/components')
  .filter(file => file.endsWith('.ts'))
  .map(file => `./src/components/${file}`);

export default [
  // Bundle all components together
  {
    input: './src/index.ts',
    output: {
      file: 'dist/bundle.js',
      format: 'es'
    },
    plugins: [
      resolve(),
      typescript({ 
        compilerOptions: { 
          declaration: true,
          declarationDir: 'dist',
          outDir: 'dist' 
        } 
      }),
      terser({
        ecma: 2020,
        module: true
      }),
      summary()
    ]
  },
  // Individual component bundles
  ...componentFiles.map(file => {
    const componentName = file.split('/').pop().replace('.ts', '');
    return {
      input: file,
      output: {
        file: `dist/components/${componentName}.js`,
        format: 'es'
      },
      plugins: [
        resolve(),
        typescript({ 
          compilerOptions: { 
            declaration: true,
            declarationDir: 'dist/components',
            outDir: 'dist/components' 
          } 
        }),
        terser({
          ecma: 2020,
          module: true
        }),
        summary()
      ]
    };
  })
];
