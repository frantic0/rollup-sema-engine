// import update from './update.js';

// // even though Rollup is bundling all your files together, errors and
// // logs will still point to your original source modules
// console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

// update();

import {
  Engine,
  compile,
  Learner,
  getBlock
} from "sema-engine/sema-engine.mjs";

let engine,
    analyser = 0,
    compiledParser = {},
    grammarCompilationErrors = "",
    livecodeParseErrors,
    livecodeParseTree,
    dspCode,
    learner
    ;

const $ = (elemId, event, callback) =>
  document.getElementById(elemId).addEventListener(event, callback);
// var originURL = 'https://frantic0.github.io/sema-engine';

var originURL = document.location.origin;

$("playButton", "click", () => {
  const audioWorkletURL = originURL + "/maxi-processor.js";
  engine = new Engine();
  engine.init("maxi-processor", audioWorkletURL);
  engine.play();
});

$("stopButton", "click", () => engine.stop());

$("loadSamplesButton", "click", () => {
  engine.loadSample("909.wav",       originURL + "/audio/909.wav");
  engine.loadSample("909b.wav",      originURL + "/audio/909b.wav");
  engine.loadSample("909closed.wav", originURL + "/audio/909closed.wav");
  engine.loadSample("909open.wav",   originURL + "/audio/909closed.wav");
  engine.loadSample("crebit2.ogg",   originURL + "/audio/crebit2.ogg");
  engine.loadSample("kick1.wav",     originURL + "/audio/kick1.wav");
  engine.loadSample("snare1.wav",    originURL + "/audio/snare1.wav");
});

$("learnerButton", "click", async () => {
  learner = new Learner();
  if(engine){
    engine.addEventListener('onSharedBuffer', e => learner.createSharedBuffer(e) ); // Engine's SAB emissions subscribed by Learner
    learner.addEventListener('onSharedBuffer', e => engine.pushSharedBuffer(e) );  // Learner's SAB emissions subscribed by Engine
  }
  await learner.init(originURL); // when Learner initializes
});

const evalLiveCode = () => {
  if(engine){
    try{
      const { errors, dspCode } = compile( editorGrammar.getValue(), editorLivecode.getValue() );
      if(dspCode){
        console.info(editorLivecode.getValue());
        engine.eval(dspCode);
      }
    } catch (err) {
      console.error("ERROR: Failed to compile and eval: ", err);
    }
  }
  else throw new Error('ERROR: Engine not initialized. Please press Start Engine first.')
}

const evalJs = async () => {
  if(learner && editorJS){
    const code = getBlock(editorJS);
    console.info(code);
    learner.eval(code);
  }
  else throw new Error('ERROR: Learner not initialized. Please press Create Learner first.')
}

$("evalButton", "click", () => evalLiveCode() );
$("evalJsButton", "click", async () => evalJs() );



$("mouseButton", "click", () => {
  if(engine){
    try{
      const id = "mxy",
            ttype = "mouseXY",
            blockSize = 2;
      let sab = engine.createSharedBuffer(id, ttype, blockSize);
      const onMouseMove = e => {
        const x = e.offsetX/window.innerWidth;
        const y = e.offsetY/window.innerHeight;
        document.getElementById('outputText').innerText = `${parseFloat(x).toFixed(5)} ${parseFloat(y).toFixed(5)}`;
        engine.pushDataToSharedBuffer(id, [ x, y ]);
      }
      // Subscribe Left `Alt`-key down event to subscribe mouse move
      document.addEventListener("keydown", e => {
        if(e.keyCode === 18){
          document.addEventListener( 'mousemove', onMouseMove, true )
        }
      });
      // Subscribe Left `Alt`-key UP event to unsubscribe mouse move
      document.addEventListener("keyup", e => {
        if(e.which === 18){
          document.getElementById('outputText').innerText = ``;
          document.removeEventListener( 'mousemove', onMouseMove, true );
        }
      });
    } catch (err) {
      console.error("ERROR: Failed to create new channel for mouse data: ", err);
    }
  }
  else throw new Error('ERROR: Engine not initialized. Please press Start Engine first.')
});

(() => {
  // Subscribe Left `Alt`-key down event to subscribe mouse move
  document.addEventListener("keydown", e => {
    if ( e.keyCode == 13 && ( e.ctrlKey || e.metaKey ) ){
      evalLiveCode();
    }
    else if ( e.keyCode == 13 && e.altKey ){
      evalJs();
    }
  });
})();

    // $("minusButton", "click", () => engine.less());
    // $("plusButton", "click", () => engine.more());
    // $("createAnalyserButton", "click", () => engine.createAnalyser(analyser++, data => console.log(data)) );
