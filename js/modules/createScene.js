import { main } from "./main.js";

function createScene(engine,sp="b12df82c-ed15-473a-b9aa-f1ccd97600ac%2F",ident="Eat_",id=".glb?v=1610559236379",startNum=2,numFiles=99,chunkSize=10) {
  let scenes_root = "https://cdn.glitch.com/";
  let filePrefix = sp + ident;
  let scene = new BABYLON.Scene(engine);
  scene.createDefaultCamera(true, true);
  scene.cameras.pop();
  engine.displayLoadingUI();
  // Generate the files names using Array.from
  let loadLoops = Math.ceil(numFiles / chunkSize); // Required number of loading loops.
  let startSlices = Array.from(new Array(loadLoops), (_x, i) => i * chunkSize);
  let endSlices = startSlices.slice(1, startSlices.length);
  endSlices.push(numFiles);
  let numArray = Array.from(new Array(numFiles), (_x, i) => i + startNum); //This generates the array of numbers that are attached to the filename.
  let scenes = numArray.map(x => filePrefix + x + id); // Ultra compressed draco files.
  main(engine,scene, scenes_root, scenes, startSlices, endSlices);
  return scene;
}
export {createScene}