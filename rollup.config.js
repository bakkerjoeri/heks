import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import replace from '@rollup/plugin-replace';
import scss from 'rollup-plugin-scss';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'es',
	},
	plugins: [
		nodeResolve(),
		typescript(),
		vue(),
		scss({output: 'dist/bundle.css'}),
		replace({
			'process.env.NODE_ENV': JSON.stringify('development'),
			'process.env.VUE_ENV': JSON.stringify('browser')
		}),
	],
};
