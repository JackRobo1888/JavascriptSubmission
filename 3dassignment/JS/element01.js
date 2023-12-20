const buildScene = (scene) => {

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 15, height: 15});
    ground.receiveShadows = true
    
    ground.material = BasicScene.createPBRMaterial("ground Mat", "Resources/Textures/asphalt_02_diff_1k.png", "Resources/Textures/asphalt_02_nor_gl_1k.png", true, "Resources/Textures/asphalt_02_arm_1k.png", scene.scene);
    const table = BasicScene.importMesh("Resources/Models/", "round_wooden_table_01_2k.glb", scene.scene, scene.shadowGenerator);
    const table1 = BasicScene.importMesh("Resources/Models/", "round_wooden_table_01_2k.glb", scene.scene, scene.shadowGenerator);
    const television = BasicScene.importMesh("Resources/Models/", "Television_01_2k.glb", scene.scene, scene.shadowGenerator);
    const  barrel = BasicScene.importMesh("Resources/Models/", "barrel_03_2k.glb", scene.scene, scene.shadowGenerator);
    const  barrel1 = BasicScene.importMesh("Resources/Models/", "barrel_03_2k.glb", scene.scene, scene.shadowGenerator);
    const  barrel2 = BasicScene.importMesh("Resources/Models/", "barrel_03_2k.glb", scene.scene, scene.shadowGenerator);
    const  barrel3 = BasicScene.importMesh("Resources/Models/", "barrel_03_2k.glb", scene.scene, scene.shadowGenerator);
    const  food = BasicScene.importMesh("Resources/Models/", "russian_food_cans_01_2k.glb", scene.scene, scene.shadowGenerator);
    const  food1 = BasicScene.importMesh("Resources/Models/", "russian_food_cans_01_2k.glb", scene.scene, scene.shadowGenerator);
    
    food.then( function(result){
        result.meshes[0].position.y = 1;
        result.meshes[0].position.x = 0.53;
        result.meshes[0].rotate(BABYLON.Vector3.Up(), Math.PI / 1.5);
    });

    food1.then( function(result){
        result.meshes[0].position.y = 1;
        result.meshes[0].position.x = -0.53;
        result.meshes[0].rotate(BABYLON.Vector3.Up(), -Math.PI / 2.3);
    });

    table1.then( function(result){
        result.meshes[0].position.x = -3;
        result.meshes[0].position.z = -2.2;
        result.meshes[0].position.y = 1;
        result.meshes[0].rotate(BABYLON.Vector3.Forward(), -Math.PI / 1);
    });

    television.then( function(result){
        result.meshes[0].position.y = 1;
    });

    barrel.then(function(result){
        result.meshes[0].position.x = 4;
        result.meshes[0].position.z = 4;
    });

    barrel1.then(function(result){
        result.meshes[0].position.x = 4.45;
        result.meshes[0].position.z = 4.45;
    });

    barrel2.then(function(result){
        result.meshes[0].position.x = 3.9;
        result.meshes[0].position.z = 4.7;
    });

    barrel3.then(function(result){
        result.meshes[0].position.x = 4.3;
        result.meshes[0].position.z = 4.3;
        result.meshes[0].position.y = 0.9;
    });

}