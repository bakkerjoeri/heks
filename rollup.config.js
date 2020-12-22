import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/example.ts',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        nodeResolve(),
		typescript(),
		vue(),
		replace({
			'process.env.NODE_ENV': JSON.stringify('development'),
			'process.env.VUE_ENV': JSON.stringify('browser')
		}),
    ],
};
