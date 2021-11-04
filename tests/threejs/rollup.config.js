import resolve from '@rollup/plugin-node-resolve'; // locate and bundle dependencies in node_modules (mandatory)
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'index.js',
	output: [
		{
			format: 'umd',
			name: 'Three.js test',
			file: 'bundle.js'
		}
	],
	plugins: [ resolve(), commonjs() ]
};