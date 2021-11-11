async function xhrAll(url) {
    let xhr = new XMLHttpRequest();
    var reqHeader = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'binary',
        'mode': 'cors'
    });
    xhr.open('GET', url, reqHeader);
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            //alert ('Error:' + xhr.status);
            return;
        }
    }
}

function loadLocalAssetSync(scene, scene_name) {
    let asset = BABYLON.SceneLoader.LoadAssetContainer("", scene_name, scene, function (container) {
        let rootMesh = container.meshes[0];
        rootMesh.rotationQuaternion = null;
        rootMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
        let materials = container.materials;
        materials.forEach((mat, _x) => {
            mat.clearCoat.isEnabled = true;
            mat.clearCoat.intensity = 1;
            mat.clearCoat.roughness = 0.5;
        });
        container.addAllToScene();
        scene.rootNodes[0].dispose();
        scene.render(true, true);
        return container;
    });
    scene.render(true, true);
    return asset;
};


async function loadLocalAsset(scene, scene_name) {
    let old = scene.getNodeByName('__root__');
    let asset = await BABYLON.SceneLoader.LoadAssetContainerAsync("", scene_name, scene).then(container => {
        let rootMesh = container.meshes[0];
        rootMesh.rotationQuaternion = null;
        rootMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
        let materials = container.materials;
        materials.forEach((mat, _x) => {
            mat.clearCoat.isEnabled = true;
            mat.clearCoat.intensity = 1;
            mat.clearCoat.roughness = 0.5;
        });
        return container;
    });
    asset.addAllToScene();
    scene.render(true, true);
    if (old != null) {
        old.dispose();
        scene.render(true, true);
    }
};


async function prepareCamera() {
    scene.createDefaultCamera(true, true);
    let cam = scene.activeCamera;
    cam.name = "arcCam";
    cam.alpha = 3;
    cam.beta = 1;
    // Enable camera's behaviors
    cam.useFramingBehavior = true;
    let framingBehavior = cam.getBehaviorByName("Framing");
    framingBehavior.framingTime = 0;
    framingBehavior.elevationReturnTime = -1;
    cam.lowerRadiusLimit = 100;
    let worldExtends = scene.getWorldExtends();
    framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
    cam.pinchPrecision = 200 / cam.radius;
    cam.upperRadiusLimit = cam.radius;
    cam.wheelDeltaPercentage = 0.01;
    cam.pinchDeltaPercentage = 0.01;
    cam.panningSensibility = 10;
    scene.activeCamera = cam;
    scene.activeCamera.attachControl();
    let light = new BABYLON.HemisphericLight("hemi", BABYLON.Vector3(0, 1, 0), scene);
    scene.lights.push(light);
    let helper = scene.createDefaultEnvironment();
    helper.setMainColor(BABYLON.Color3.Gray());
    return cam;
};

async function main(scene, scene_names) {
    let cameraChanged = true;
    let currentSceneIndex = 0;
    let isPlaying = false;
    await loadLocalAsset(scene, scene_names[currentSceneIndex]);
    var camera = await prepareCamera();
    scene.render(true, true);
    engine.hideLoadingUI();
    await scene_names.map(file => xhrAll(file));
    scene.render(true, true);

    camera.onViewMatrixChangedObservable.add(() => {
        cameraChanged = true;
    })

    // Resize window
    engine.onResizeObservable.add(() => {
        engine.resize();
        scene.render(true, true);
    })

    //RENDER LOOP
    var renderLoop = function () {
        camera.update();
        if (cameraChanged) {
            cameraChanged = !cameraChanged;
            scene.render(true, true);
        }
    };

    //runRenderLoop inside a setTimeout is neccesary in the Playground
    //to stop the PG's runRenderLoop.
    setTimeout(function () {
        engine.stopRenderLoop();
        engine.runRenderLoop(renderLoop);
    }, 500);

    // GUI generation
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let stackPanel = new BABYLON.GUI.StackPanel("stackPanel");
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
    button.onPointerDownObservable.add(() => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            button.textBlock.text = "Pause";
            this.handle = setInterval(() => {
                currentSceneIndex = ++currentSceneIndex % scene_names.length;
                slider.value = currentSceneIndex;
            }, 83);
        } else {
            button.textBlock.text = "Play";
            clearInterval(this.handle);
            scene.render(true, true);
        }
    });
    stackPanel.addControl(button);
    let slider = new BABYLON.GUI.Slider("FrameSlider");
    slider.value = currentSceneIndex;
    slider.minimum = 0;
    slider.maximum = scene_names.length - 1;
    slider.step = 1;
    slider.isThumbCircle = true;
    slider.isThumbClamped = true;
    slider.height = "20px";
    slider.width = "200px";
    slider.onValueChangedObservable.add(value => {
        loadLocalAssetSync(scene, scene_names[value]);
        currentSceneIndex = value;
        scene.render(true, true);
    });
    slider.onPointerDownObservable.add(() => {
        if (isPlaying) {
            button.textBlock.text = "Play";
            clearInterval(this.handle);
        }
    })
    stackPanel.addControl(slider);

    // Switch to next scene when x is pressed and previous when z is pressed
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                switch (kbInfo.event.key) {
                    case "z":
                        if (isPlaying) {
                            clearInterval(this.handle);
                            button.textBlock.text = "Play";
                            isPlaying = !isPlaying;
                        }
                        --currentSceneIndex;
                        if (currentSceneIndex < 0) {
                            currentSceneIndex = scene_names.length - 1;
                        }
                        slider.value = currentSceneIndex;
                        break;
                    case "x":
                        if (isPlaying) {
                            clearInterval(this.handle);
                            button.textBlock.text = "Play";
                            isPlaying = !isPlaying;
                        }
                        currentSceneIndex = ++currentSceneIndex % scene_names.length;
                        slider.value = currentSceneIndex;
                        break;
                }
                break;
        }
    });
};

async function createScene() {
    let scene = new BABYLON.Scene(engine);
    scene.createDefaultCamera(true, true);
    scene.cameras.pop();
    engine.displayLoadingUI();
    // Generate the files names using Array.from
    let scenes_root = "https://cdn.glitch.me/";
    let numFiles = 100; // Total number of files
    let startNum = 1; // Starting index of the files (the default is 0)
    let filePrefix = "7ce5375e-6fda-4d57-96e1-a13cdcbc8894%2Fbcell_"; // Files that are draco compressed. ~1MB per file
    let numArray = Array.from(new Array(numFiles), (_x, i) => i + startNum); //This generates the array of numbers that are attached to the filename.
    let scene_names = numArray.map(x => scenes_root + filePrefix + x + ".glb"); // Ultra compressed draco files.
    main(scene, scene_names);
    return scene;
};