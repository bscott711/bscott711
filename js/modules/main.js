// import * as GUI from "babylonjs-gui";
// import "babylonjs-loaders";
// import {SceneLoader, Axis, Space} from "babylonjs";
import {prepareCamera} from "./prepareCamera.js";

async function main(engine,scene, scenes_root, scenes, startSlices, endSlices) {
  // Load all scenes one by one and display the first one
  let start = performance.now();
  let currentSceneIndex = 0;
  let isPlaying = false;
  let advancedTexture = await BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  let stackPanel = await new BABYLON.GUI.StackPanel("stackPanel");
  let asset = await BABYLON.SceneLoader.LoadAssetContainerAsync(
    scenes_root,
    scenes[0],
    scene
  ).then(container => {
    let rootMesh = container.meshes[0];
    rootMesh.rotationQuaternion = null;
    rootMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
    let materials = container.materials;
    materials.forEach((mat, _x) => {
      mat.clearCoat.isEnabled = true;
      mat.clearCoat.intensity = 0.5;
      mat.clearCoat.roughness = 0.5;
    });
    return container;
  });
  asset.addAllToScene();
  prepareCamera(scene);
  engine.hideLoadingUI();
  let interactivity = performance.now();
  console.log(
    "Time to interaction: ",
    (interactivity - start) / 1000,
    "seconds"
  );
  let assetContainers = [];
  // Load in the rest of the images (reload the first frame for ease of implementation)
  for (let i = 0; i < startSlices.length; i++) {
    let subScene = scenes.slice(startSlices[i], endSlices[i]);
    let assets = subScene.map(file =>
      BABYLON.SceneLoader.LoadAssetContainerAsync(
        scenes_root,
        file,
        scene
      ).then(container => {
        let rootMesh = container.meshes[0];
        rootMesh.rotationQuaternion = null;
        rootMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
        let materials = container.materials;
        materials.forEach((mat, _x) => {
          mat.clearCoat.isEnabled = true;
          mat.clearCoat.intensity = 0.5;
          mat.clearCoat.roughness = 0.5;
        });
        return container;
      })
    );
    assets = await Promise.all(assets);
    if (i == 0) {
      assetContainers = assets;
      assetContainers[currentSceneIndex].addAllToScene();
      asset.removeAllFromScene();
      let chunk = performance.now();
      console.log("Chunk loaded: ", (chunk - interactivity) / 1000, "seconds");
      // GUI generation
      stackPanel.isVertical = false;
      stackPanel.height = "100px";
      stackPanel.fontSize = "14px";
      stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      let stackOutside = new BABYLON.GUI.StackPanel("stackOutside");
      stackOutside.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      stackOutside.addControl(stackPanel);
      advancedTexture.addControl(stackOutside);
      let button = BABYLON.GUI.Button.CreateSimpleButton("Play", "Play");
      button.width = "50px";
      button.height = "25px";
      button.color = "white";
      button.background = "gray";
      button.enabled = false;
      button.onPointerDownObservable.add(() => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          button.textBlock.text = "Pause";
          button.handle = setInterval(() => {
            assetContainers[currentSceneIndex].removeAllFromScene();
            currentSceneIndex = ++currentSceneIndex % assetContainers.length;
            assetContainers[currentSceneIndex].addAllToScene();
            slider.value = currentSceneIndex;
          }, 100);
        } else {
          clearInterval(button.handle);
          button.textBlock.text = "Play";
        }
      });
      stackPanel.addControl(button);
      let slider = new BABYLON.GUI.Slider("FrameSlider");
      slider.minimum = 0;
      slider.maximum = scenes.length - 1;
      slider.step = 1;
      slider.isThumbCircle = true;
      slider.isThumbClamped = true;
      slider.value = currentSceneIndex;
      slider.height = "20px";
      slider.width = "200px";
      stackPanel.addControl(slider);
      slider.onValueChangedObservable.add(value => {
        assetContainers[currentSceneIndex].removeAllFromScene();
        assetContainers[value].addAllToScene();
        currentSceneIndex = value;
      });
      // Switch to next scene when x is pressed and previous when z is pressed
      document.onkeydown = e => {
        switch (e.key) {
          case "z":
            if (isPlaying) {
              clearInterval(button.handle);
              button.textBlock.text = "Play";
              isPlaying = !isPlaying;
            }
            assetContainers[currentSceneIndex].removeAllFromScene();
            --currentSceneIndex;
            if (currentSceneIndex < 0) {
              currentSceneIndex = assetContainers.length - 1;
            }
            assetContainers[currentSceneIndex].addAllToScene();
            slider.value = currentSceneIndex;
            break;
          case "x":
            if (isPlaying) {
              clearInterval(button.handle);
              button.textBlock.text = "Play";
              isPlaying = !isPlaying;
            }
            assetContainers[currentSceneIndex].removeAllFromScene();
            currentSceneIndex = ++currentSceneIndex % assetContainers.length;
            assetContainers[currentSceneIndex].addAllToScene();
            slider.value = currentSceneIndex;
            break;
        }
      };
    } else {
      assetContainers = assetContainers.concat(assets);
    }
  }
  let end = performance.now();
  console.log(
    "All files loaded. Total Time: ",
    (end - start) / 1000,
    "seconds"
  );
}

export {main}