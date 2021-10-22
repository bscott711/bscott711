// This is needed to run in Glitch.
//npm install --save babylonjs babylonjs-loaders babylonjs-gui
import {createScene} from "/js/modules/createScene.js";
// Get the canvas element from the HTML above
const canvas = document.getElementById("renderCanvas");
// Load BABYLON 3D engine
const engine = new BABYLON.Engine(canvas, true);
var scene = createScene(engine,"7ce5375e-6fda-4d57-96e1-a13cdcbc8894%2F","srbcRough_",".glb?",1,102,10);

// This is required for the scene to be generate outside of the Babylon.js playground //
engine.runRenderLoop(async function() {
  if (scene.activeCamera) {
    scene.render();
  }
});
window.addEventListener("resize", async function() {
  engine.resize();
});
