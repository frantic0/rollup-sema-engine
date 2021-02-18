import format from 'date-fns/format';
import Controller from "./engine/controller";
import { Engine } from "sema-engine/sema-engine.mjs";

var span = document.querySelector('#time-now');

export default function update() {
	span.textContent = format(new Date(), 'h:mm:ssa');
	setTimeout(update, 1000);
}



// $unsupportedBrowser
let unsupportedBrowser,
    controller;

/**
 * This async IIFE tests the browser Sema is loading in for WAAPI Audio Worklet support
 * It either succeeds and dynamically imports the sema-engine, or graciously fails
 * */
(async () => {
	// Detect Firefox early otherwise audio engine needs to be initialised for a fail to be detected [Firefox fix]
	if (/firefox/i.test(navigator.userAgent)) unsupportedBrowser = true;
	else {
		controller = new Controller(new Engine());

		// Need a dynamic import to prevent the AudioWorkletNode inside the audioEngine module from loading [Safari fix]
		// import('sema-engine/dist/sema-engine.mjs')
		import("sema-engine/sema-engine.js")
			.then((module) => {
				// Apply in Inversion of Control with constructor injection
				controller = new Controller(new module.Engine());
			})
			.catch((err) => (unsupportedBrowser = true));
	}
})();

