const buildScene = (scene) => {

    const skybox = basicScene.createSkyBox("Resources/Env/blue sky.env")
    const ground = BABYLON.Mesh.CreateGround("ground", 600, 600, 32, scene.scene);
    ground.position.y = 6;
    var canvas = document.getElementById("renderCanvas");
    var camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene.scene);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 20;
    camera.attachControl(canvas, true);

    const waterMaterial = new BABYLON.WaterMaterial("water_material", scene.scene);
    waterMaterial.bumpTexture = new BABYLON.Texture("Resources/Textures/water 0342normal.jpg", scene.scene);

    ground.material = waterMaterial;

    waterMaterial.windForce = 10;
    waterMaterial.waveHeight = 0.4;
    waterMaterial.bumpHeight = 0.3;
    waterMaterial.windDirection = new BABYLON.Vector2(1.0, 1.0);
    waterMaterial.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
    waterMaterial.colorBlendFactor = 0.5;
    waterMaterial.waveLength = 0.05;

    waterMaterial.addToRenderList(skybox);
    var box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

    scene.scene.registerBeforeRender(function () {
        var angle = Math.PI / 180;
        camera.alpha += angle;
    });
    scene.camera.radius = 400;
}

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min)) + min;