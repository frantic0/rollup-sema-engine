import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { wasm } from "@rollup/plugin-wasm";
import workerLoader from "rollup-plugin-web-worker-loader";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import copy from "rollup-plugin-copy";
import sourcemaps from 'rollup-plugin-sourcemaps';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const buildDir = `public`;


// Silence warning
const onwarn = (warning, warn) =>  {
	// suppress eval warnings
	if (warning.code === 'EVAL') return
	warn(warning)
}

export default {
	input: "src/main.js",
  onwarn,
	output: {
		format: "es",
		sourcemap: true,
		dir: buildDir,
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		// {
		// 	transform(code, id) {
		// 		// debug the Rollup bundling process by injecting a hook in the plugin chain!
		// 		console.log(id);
		// 		console.log(code);
		// 	}, // not returning anything, so doesn't affect bundle
		// },
		dynamicImportVars({
			// options
		}),
		workerLoader(),
		wasm(),
		copy({
			targets: [
				{
					src: "node_modules/sema-engine/maxi-processor.js",
					dest: "public",
				},
				{
					src: "node_modules/sema-engine/sema-engine.wasmmodule.js",
					dest: "public",
				},
				{
					src: "node_modules/sema-engine/open303.wasmmodule.js",
					dest: "public",
				},
				{
					// ringbuf version to be imported by learner worker
					src: "node_modules/sema-engine/mlworkerscripts.js",
					dest: ["public"],
				},
				{
					// ringbuf is imported by both the Engine (AW node) and maxi-processor (AWP) so needs to be both bundled AND copied!
					src: "node_modules/sema-engine/ringbuf.js",
					dest: ["public"],
				},
				{
					// transducers is imported by Engine maxi-processor (AWP) so needs to be both bundled AND copied!
					src: "node_modules/sema-engine/transducers.js",
					dest: ["public"],
				},
				{
					src: "assets/*",
					dest: "public",
				},
				{
					// lalolib is imported dynamically (importScripts) by the ml.worker, needs to be served in 'dist'
					src: "node_modules/sema-engine/lalolib.js",
					dest: "public",
				},
				{
					// svd is imported dynamically (importScripts) by the ml.worker, needs to be served in 'dist'
					src: "node_modules/sema-engine/svd.js",
					dest: ["public"],
				},
			],
		}),
    sourcemaps(),
		production && terser(), // minify, but only in production
	],
	watch: {
		skipWrite: true,
	},
};
