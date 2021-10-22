//import { Color3, CubeTexture, HemisphericLight } from "babylonjs";

function prepareCamera(scene) {
  scene.createDefaultCamera(true, true);
  let camera = scene.activeCamera;
  camera.name = "arcCam";
  camera.alpha = 3;
  camera.beta = 1;
  // Enable camera's behaviors
  camera.useFramingBehavior = true;
  let framingBehavior = camera.getBehaviorByName("Framing");
  framingBehavior.framingTime = 0;
  framingBehavior.elevationReturnTime = -1;
  let worldExtends = scene.getWorldExtends();
  framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
  camera.pinchPrecision = 200 / camera.radius;
  camera.lowerRadiusLimit = 50;
  camera.upperRadiusLimit = 1.5 * camera.radius;
  camera.radius = 800;
  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.01;
  scene.activeCamera = camera;
  scene.activeCamera.attachControl();
  let light = new BABYLON.HemisphericLight("hemi", (0, 1, 0), scene);
  scene.lights.push(light);
  let helper = scene.createDefaultEnvironment();
  scene.environmentTexture = new BABYLON.CubeTexture(
    "https://assets.babylonjs.com/environments/studio.env",
    scene
  );
  helper.setMainColor(BABYLON.Color3.Gray());
}

export {prepareCamera}
