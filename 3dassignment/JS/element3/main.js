document.addEventListener("DOMContentLoaded", startGame);

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true, { stencil: false }, true);
var scene = createScene(engine, canvas);
var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(-90), BABYLON.Tools.ToRadians(65), 6, BABYLON.Vector3.Zero(), scene);
var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0,0,0), scene);
var shadowGenerator = new BABYLON.ShadowGenerator(512, dirLight, true);
var hdrTexture;
var hdrRotation = 0;
var ground;
var basicMaterial;
var player;
var camera;
var idleAnim;
var walkAnim;
var runAnim;
var runBackAnim;
var currentAnim;
var aoActive = false;
var currentFov = 30;

function createScene(engine, canvas) {
    canvas = document.getElementById("renderCanvas");
    engine.clear(new BABYLON.Color3(0, 0, 0), true, true);
    var scene = new BABYLON.Scene(engine);
    return scene;
}

function startGame() {
    var toRender = function () {
        scene.render();
    }
    engine.runRenderLoop(toRender);
    scene.createDefaultCamera();
    scene.collisionsEnabled  = true;

    dirLight.intensity = 3.2;
    dirLight.position = new BABYLON.Vector3(0,10,10);
    dirLight.direction = new BABYLON.Vector3(-4, -4, 1);
    dirLight.shadowMinZ = -10;
    dirLight.shadowMaxZ = 20;
    dirLight.diffuse = new BABYLON.Color3.FromInts(234, 170, 133);

    shadowGenerator.darkness = 0.25;
    shadowGenerator.bias = 0.02;
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.filteringQuality = 1;

    var groundMaterial = new BABYLON.PBRMaterial("groundMaterial", scene);
    groundMaterial.albedoTexture = new BABYLON.Texture("./resources/textures/ground.jpg", scene);
    groundMaterial.albedoTexture.uScale = 40;
    groundMaterial.albedoTexture.vScale = 40;
    groundMaterial.bumpTexture = new BABYLON.Texture("./resources/textures/ground_normal.jpg", scene);
    groundMaterial.bumpTexture.uScale = 40;
    groundMaterial.bumpTexture.vScale = 40;
    groundMaterial.bumpTexture.intensity = 2;
    groundMaterial.roughness = 0.7;
    groundMaterial.metallic = 0;

    const ground2 = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "./resources/textures/heightMap.png", {
        width: 150, height: 150, subdivisions: 40, maxHeight: 3, minHeight: -2
    });
    ground2.position.y = -1;
    ground2.checkCollisions = true;
    ground2.isPickable = true;
    ground2.material = groundMaterial;
    ground2.meshType = "scalable";
    ground2.receiveShadows = true;

    basicMaterial = new BABYLON.PBRMaterial("groundMaterial", scene);
    basicMaterial.albedoColor = new BABYLON.Color3(0.5,0.5,0.5);
    basicMaterial.roughness = 0.81;
    basicMaterial.metallic = 0;

    importModelAsync("character.glb");
    
    var stats = document.getElementById("stats-text");
    scene.registerBeforeRender(()=>{
        stats.innerHTML = "<b>" + Math.round(engine.getFps()) + " FPS <br></b> ";
    });


    if (!isTouch)
    {
        document.getElementById("customBT").style.display = "none";
    }

    $(document).ready(function(){ 
        $('#customBT').on('click touchstart', function() {
            jumpFromBT();
        });
    });
}


async function load3DText() {  

    var fontData = await (await fetch("https://assets.babylonjs.com/fonts/Kenney Future Regular.json")).json();
    var myText = BABYLON.MeshBuilder.CreateText("myText", "Character Navigation", fontData, {
        size: 0.3,
        resolution: 32, 
        depth: 0.15
    });

    myText.position = new BABYLON.Vector3(0,2,4);

    var textMaterial = new BABYLON.PBRMaterial("textMaterial", scene);
    textMaterial.albedoTexture = new BABYLON.Texture("./resources/textures/metal.jpg", scene);
    textMaterial.albedoTexture.uScale = 1.1;
    textMaterial.albedoTexture.vScale = 1.1;
    textMaterial.roughness = 0.1;
    textMaterial.metallic = 1;
    myText.material = textMaterial;
    
    shadowGenerator.addShadowCaster(myText);
    textMaterial.reflectionTexture = hdrTexture;
    textMaterial.reflectionTexture.level = 0.6;
    textMaterial.environmentIntensity = 0.7;
    textMaterial.disableLighting = false;

    var alpha = 0;
    scene.registerBeforeRender(()=>{
        alpha += 0.01;
        myText.position.y = 0.8*Math.cos(alpha)+2.6;
    });
}

function demoObjects() {

    load3DText();
    const box2 = BABYLON.MeshBuilder.CreateBox("box2", {
        size: 5,
        width: 5,
        height: 0.4
    }, scene);
    box2.material = basicMaterial;
    box2.position.x = -7;
    box2.position.y = 0;
    box2.position.z = -2;
    box2.checkCollisions = true;
    box2.isPickable = true;
    box2.receiveShadows = true;
    box2.meshType = "scalable";

    const box3 = BABYLON.MeshBuilder.CreateBox("box3", {
        size: 3,
        width: 3,
        height: 0.4
    }, scene);
    box3.material = basicMaterial;
    box3.position.x = -3;
    box3.position.y = 0;
    box3.position.z = 12;
    box3.checkCollisions = true;
    box3.isPickable = true;
    box3.receiveShadows = true;
    box3.meshType = "scalable";

    const box4 = BABYLON.MeshBuilder.CreateBox("box4", {
        size: 3,
        width: 3,
        height: 0.4
    }, scene);
    box4.material = basicMaterial;
    box4.position.y = 0.5;
    box4.position.x = 4;
    box4.checkCollisions = true;
    box4.isPickable = true;
    box4.receiveShadows = true;
    box4.meshType = "scalable";

    const box5 = BABYLON.MeshBuilder.CreateBox("box5", {
        size: 4,
        width: 4,
        height: 0.4
    }, scene);
    box5.material = basicMaterial;
    box5.position.x = -5;
    box5.position.y = 0.7;
    box5.position.z = 6;
    box5.checkCollisions = true;
    box5.isPickable = true;
    box5.receiveShadows = true;
    box5.meshType = "scalable";

    const ramp = BABYLON.MeshBuilder.CreateBox("ramp", {
        size: 5,
        width: 6,
        height: 1
    }, scene);
    ramp.position.x = 5;
    ramp.position.y = 0.5;
    ramp.position.z = -7;
    ramp.checkCollisions = true;
    ramp.isPickable = true;
    ramp.receiveShadows = true;
    ramp.rotation.x += Math.PI / 5;
    ramp.meshType = "scalable";

    const ramp2 = BABYLON.MeshBuilder.CreateBox("ramp2", {
        size: 8,
        width: 6,
        height: 1
    }, scene);
    ramp2.position.x = 0;
    ramp2.position.y = 1;
    ramp2.position.z = -10;
    ramp2.checkCollisions = true;
    ramp2.isPickable = true;
    ramp2.receiveShadows = true;
    ramp2.rotation.x += Math.PI / 5;
    ramp2.meshType = "scalable";

    var stairsArray = [];
    for (let index = 0; index < 10; index++) {
        
        var stairs0 = BABYLON.MeshBuilder.CreateBox("stair", {size: 1, width: 5, height: 0.4}, scene);
        stairs0.position.y = -0.22 + 0.2*index;
        stairs0.position.z = 0.5*index;
        stairsArray.push(stairs0);
    }

    var mergeStairs = new BABYLON.Mesh.MergeMeshes(stairsArray, true);
    mergeStairs.name = "stairs_1";
    mergeStairs.checkCollisions = true;
    mergeStairs.isPickable = true;
    mergeStairs.position.x = 4;
    mergeStairs.position.y = -1.5;
    mergeStairs.position.z = 10;
    mergeStairs.receiveShadows = true;
    mergeStairs.meshType = "scalable";

    var mergeStairs2 = mergeStairs.clone();
    mergeStairs2.name = "stairs_2";
    mergeStairs2.checkCollisions = true;
    mergeStairs2.isPickable = true;
    mergeStairs2.position.x = -1;
    mergeStairs2.position.y = -2;
    mergeStairs2.position.z = 15;   
    mergeStairs2.scaling.y = 1.5;
    mergeStairs2.receiveShadows = true;
    mergeStairs2.meshType = "scalable";

    var groundMaterial = new BABYLON.PBRMaterial("groundMaterial", scene);
    groundMaterial.albedoTexture = new BABYLON.Texture("./resources/textures/ground.jpg", scene);
    groundMaterial.albedoTexture.uScale = 1.5;
    groundMaterial.albedoTexture.vScale = 1.5;
    groundMaterial.roughness = 0.7;
    groundMaterial.metallic = 0;
    ramp.material = groundMaterial;
    ramp2.material = groundMaterial;
    box2.material = groundMaterial;
    box3.material = groundMaterial;
    box4.material = groundMaterial;
    box5.material = groundMaterial;
    mergeStairs.material = groundMaterial;
    mergeStairs2.material = groundMaterial;
}

function createFollowCamera(target) {
    scene.activeCamera.dispose();
    camera = new BABYLON.FollowCamera("playerFollowCamera", target.position, scene, target);
    camera.radius = 8;
    camera.heightOffset = 4;
    camera.rotationOffset = 180; 
    camera.cameraAcceleration = 0.02;
    camera.maxCameraSpeed = 1;
    scene.backgroundColor = new BABYLON.Color3(0, 0, 0);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    camera.lockedTarget = target;
    scene.activeCamera = camera;

    if (isTouch)
    {
        if ($(window).width() > $(window).height())
        {
            currentFov = 30;
        } else {
            currentFov = 50;
        }
        scene.activeCamera.fov = BABYLON.Tools.ToRadians(currentFov);
    }

    return camera;
}

function importModelAsync(model) {
    Promise.all([

        BABYLON.SceneLoader.ImportMeshAsync(null, "./resources/models/" , model, scene).then(function (result) {
            result.meshes.forEach((mesh)=>{
                mesh.receiveShadows = true;
                mesh.isPickable = false;
            });
            player = BABYLON.MeshBuilder.CreateCapsule("player", { width: 0.3, height: 1, size:0.3}, scene);
            player.visibility = 0;
            player.ellipsoid = new BABYLON.Vector3(0.4, 0.48, 0.4);
            player.position.y = 0.5;
            player.isPickable = false;
            player.checkCollisions = true;
            player.addChild(result.meshes[0]);

            scene.getMaterialByName("Metal").roughness = 0.6;

            idleAnim = scene.getAnimationGroupByName("Idle");
            walkAnim = scene.getAnimationGroupByName("Walk");
            runAnim = scene.getAnimationGroupByName("Run");
            runBackAnim = scene.getAnimationGroupByName("RunBack");

            idleAnim.setWeightForAllAnimatables(1.0);
            walkAnim.setWeightForAllAnimatables(0);
            runAnim.setWeightForAllAnimatables(0);
        }),

        ]).then(() => {
            console.log("ALL Loaded");

            demoObjects();

            createFollowCamera(player);

            setLighting();    
            setReflections();
            setShadows();
            setPostProcessing();
            optimizeScene();
            
            setTimeout(() => {
                hideLoadingView(); 
                setPlayerMovement();
            }, 2000);
        });
}

function optimizeScene() {
    var options = new BABYLON.SceneOptimizerOptions(60, 500);
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1.25));
    options.targetFrameRate = 60;
    var optimizer = new BABYLON.SceneOptimizer(scene, options);
    optimizer.start();
}

function setLighting() {
    hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./resources/env/environment_19.env", scene);
    hdrTexture.rotationY = BABYLON.Tools.ToRadians(hdrRotation);
    hdrSkybox = BABYLON.MeshBuilder.CreateBox("skybox", {size: 1024}, scene);
    var hdrSkyboxMaterial = new BABYLON.PBRMaterial("skybox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone();
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    hdrSkyboxMaterial.microSurface = 0.5;
    hdrSkyboxMaterial.disableLighting = true;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;
}

function setShadows() {
    scene.meshes.forEach(function(mesh) {
        if (mesh.name != "skybox" 
        && mesh.name != "ground")
        {
            shadowGenerator.addShadowCaster(mesh);
        }
    });
}

function setReflections() {
    scene.materials.forEach(function (material) {
        if (material.name != "skybox") {
            material.reflectionTexture = hdrTexture;
            material.reflectionTexture.level = 0.6;
            material.environmentIntensity = 0.7;
            material.disableLighting = false;
        }
    });
}

function setPostProcessing() {
    var pipeline = new BABYLON.DefaultRenderingPipeline(
        "defaultPipeline",
        false, 
        scene, 
        [scene.activeCamera]
    );
    pipeline.samples = 1;
}

function hideLoadingView() {
    document.getElementById("loadingDiv").style.display = "none";
}

window.addEventListener("resize", function () {
    engine.resize();

    if (isTouch)
    {
        if ($(window).width() > $(window).height())
        {
            if (scene.activeCamera)
                currentFov = 30;
        } else {
            if (scene.activeCamera)
                currentFov = 50;
        }
        scene.activeCamera.fov = BABYLON.Tools.ToRadians(currentFov);
    }

});