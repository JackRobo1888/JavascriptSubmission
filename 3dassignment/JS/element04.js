const buildScene = (scene) => {

    const skybox = basicScene.createSkyBox("Resources/Env/blue sky.env")

    const terrain = BasicScene.importMesh("Resources/Models/", "Environment.glb", scene.scene, scene.shadowGenerator);

    const ground = BABYLON.Mesh.CreateGround("ground", 600, 600, 32, scene.scene);
    ground.position.y = 6;

    const waterMaterial = new BABYLON.WaterMaterial("water_material", scene.scene);
    waterMaterial.bumpTexture = new BABYLON.Texture("Resources/Textures/water 0342normal.jpg", scene.scene);

    ground.material = waterMaterial;
    ground.checkCollisions = true

    waterMaterial.windForce = 10;
    waterMaterial.waveHeight = 0.4;
    waterMaterial.bumpHeight = 0.3;
    waterMaterial.windDirection = new BABYLON.Vector2(1.0, 1.0);
    waterMaterial.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
    waterMaterial.colorBlendFactor = 0.5;
    waterMaterial.waveLength = 0.05;

    waterMaterial.addToRenderList(skybox);

    scene.camera.radius = 400;

    terrain.then( function(result){

        result.meshes[0].scaling.x = 10;
        result.meshes[0].scaling.y = 10;
        result.meshes[0].scaling.z = 10;
        result.meshes[0].checkCollisions = true;

        result.meshes[1].material = BasicScene.createPBRMaterial("ground Mat", "Resources/Textures/forrest_ground_01_diff_1k.png", "Resources/Textures/forrest_ground_01_nor_gl_1k.png", true, "Resources/Textures/forrest_ground_01_arm_1k.png", scene.scene);

        result.meshes[1].material.albedoTexture.uScale = 50;
        result.meshes[1].material.albedoTexture.vScale = 50;
        result.meshes[1].material.bumpTexture.uScale = 50;
        result.meshes[1].material.bumpTexture.vScale = 50;
        result.meshes[1].material.metallicTexture.uScale = 50;
        result.meshes[1].material.metallicTexture.vScale = 50;
        result.meshes[1].checkCollisions = true;
        result.meshes[1].isPickable = true;
        waterMaterial.addToRenderList(result.meshes[1]);
    });

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene.scene);

    var button = BABYLON.GUI.Button.CreateSimpleButton("Play Button", "Play");

    button.height = "40px";
    button.width = "140px";
    button.color = "white";
    button.background = "grey";
    button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button.left = "100px";
    button.onPointerUpObservable.add(function (){

        button.isVisible = false;
        button.isEnabled = false;

        const airplane = BasicScene.importMesh("Resources/Models/", "Airplane.glb", scene.scene, scene.shadowGenerator);

        const donat = BasicScene.importMesh("Resources/Models/", "Donat.glb", scene.scene, scene.shadowGenerator);

        donat.then(function(result){
            result.meshes[0].position = new BABYLON.Vector3(30, 80, 90);
            result.meshes[0].scaling = new BABYLON.Vector3(1, 4, 4);;
        })

        let inputMap = {};

        scene.scene.actionManager = new BABYLON.ActionManager(scene.scene);

        scene.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt){
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"
        }));

        scene.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt){
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"
        }));

        airplane.then(function(result){
            result.meshes[0].position.y = 80;
            scene.camera.setTarget(result.meshes[0], true, true, true);
            scene.camera.radius = 15;
            result.meshes[0].rotation = new BABYLON.Vector3(0, -1, 0);
            result.meshes[0].computeWorldMatrix(true);
            waterMaterial.addToRenderList(result.meshes[1]);
            var speed = 1;
            var score = 0;

            var text1 = new BABYLON.GUI.TextBlock();
            text1.text = "";
            text1.color = "white";
            text1.fontSize = 16;
            text1.color = "white";
            text1.outlineColor = "black";
            text1.outlineWidth = 5;
            text1.top = "150px";
            text1.textVerticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(text1);
            

            var slider = new BABYLON.GUI.Slider();
            slider.minimum = 0.8;
            slider.maximum = 2;
            slider.value = 1;
            slider.height = "150px";
            slider.width = "20px";
            slider.color = "#ccb0ad";
            slider.background = "black";
            slider.left = "120px";
            slider.isVertical = true;
            slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            slider.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            slider.onValueChangedObservable.add(function (value) {
                speed = value;
            });
            advancedTexture.addControl(slider);

            const music = new BABYLON.Sound("bgmusic", "Resources/Audio/engine sound.mp3", scene.scene, null, {
                autoplay : true,
                loop : true
            });

            music.setVolume(0.1);

            const explosion = new BABYLON.Sound("gunshot", "Resources/Audio/explosion.mp3", scene.scene);

            explosion.setVolume(0.5);

            const coinSound = new BABYLON.Sound("coin sound", "Resources/Audio/CoinSound.mp3", scene.scene);

            coinSound.setVolume(0.1);

            scene.scene.onBeforeRenderObservable.add(() => {
                let keydown = false;
                let meshes = result.meshes[0];

                meshes.position.x += meshes.forward.x * speed / scene.gameEngine.getDeltaTime();
                meshes.position.y += meshes.forward.y * speed / scene.gameEngine.getDeltaTime();
                meshes.position.z += meshes.forward.z * speed / scene.gameEngine.getDeltaTime();

                var altitude = meshes.position.y;

                text1.text = "Altitude above sea level " + (altitude - 6).toFixed(2) + "m    Score: " + score;

                if (inputMap["w"]){
                    meshes.rotation.x = BABYLON.Scalar.Lerp(meshes.rotation.x, meshes.rotation.x + 0.5 / 180 * Math.PI, 7 / scene.scene.deltaTime);
                    keydown = true;

                }
                if (inputMap["q"]){
                    meshes.rotation.y = BABYLON.Scalar.Lerp(meshes.rotation.y, meshes.rotation.y - 0.5 / 180 * Math.PI, 7 / scene.scene.deltaTime);
                    keydown = true;
                }
                if (inputMap["s"]){
                    meshes.rotation.x = BABYLON.Scalar.Lerp(meshes.rotation.x, meshes.rotation.x - 0.5 / 180 * Math.PI, 7 / scene.scene.deltaTime);
                    keydown = true;
                }
                if (inputMap["e"]){
                    meshes.rotation.y = BABYLON.Scalar.Lerp(meshes.rotation.y, meshes.rotation.y + 0.5 / 180 * Math.PI, 7 / scene.scene.deltaTime);
                    keydown = true;
                }
                if (inputMap["a"]){
                    meshes.rotation.z = BABYLON.Scalar.Lerp(meshes.rotation.z, meshes.rotation.z - 0.5 / 180 * Math.PI, 7 / scene.scene.deltaTime);
                    keydown = true;
                }
                if (inputMap["d"]){
                    meshes.rotation.z = BABYLON.Scalar.Lerp(meshes.rotation.z, meshes.rotation.z + 0.5 / 180 * Math.PI, 7 / scene.scene.deltaTime);
                    keydown = true;
                }
                if (result.meshes[1].intersectsMesh(ground)){
                    explosion.play();
                    meshes.position = new BABYLON.Vector3(0, 80, 0);
                    meshes.rotation = new BABYLON.Vector3(0, -1, 0);
                    console.log("Impacted with water");
                }

                donat.then(function(donatMeshes){
                    if(result.meshes[1].intersectsMesh(donatMeshes.meshes[1])){
                        coinSound.play();
                        score += 1;
                        donatMeshes.meshes[1].dispose();
                        donatMeshes.meshes[1] = null;
                        return;
                    }
                })


            });
        });
    });



    advancedTexture.addControl(button);


}
