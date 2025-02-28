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
      file: 'lib/bundle.js',
      format: 'es'
    },
    plugins: [
      resolve(),
      typescript({ 
        compilerOptions: { 
          declaration: true,
          declarationDir: 'lib',
          outDir: 'lib' 
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
        file: `lib/components/${componentName}.js`,
        format: 'es'
      },
      plugins: [
        resolve(),
        typescript({ 
          compilerOptions: { 
            declaration: true,
            declarationDir: 'lib/components',
            outDir: 'lib/components' 
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
