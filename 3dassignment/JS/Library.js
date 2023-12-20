class BasicScene{

    constructor(canvisName, engine = null){
        this.canvas = document.getElementById(canvisName);

        if (engine == null){
            this.engine = new BABYLON.Engine(document.getElementById("renderCanvas"), true);
        }
        else{
            this.engine = engine
        }   

        this.scene = new BABYLON.Scene(this.engine);
        this.basicCamera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), this.scene);
        this.basicCamera.attachControl(this.canvas, true);
        this.basicCamera.speed = 0.25;
        this.light = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0, -1, 1), this.scene);
        this.light.position = new BABYLON.Vector3(0, 15, -30);
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);
    }

    static createPBRMaterial(name, albidoTex, normalTex, invertNormals, ARMTex, scene){
        const pbr = new BABYLON.PBRMaterial(name, scene);
        pbr.roughness = 1;

        pbr.albedoTexture = new BABYLON.Texture(albidoTex, scene);
        pbr.bumpTexture = new BABYLON.Texture(normalTex, scene);

        pbr.invertNormalMapX = invertNormals;
        pbr.invertNormalMapY = invertNormals;

        pbr.useAmbientOcclusionFromMetallicTextureRed = true;
        pbr.useRoughnessFromMetallicTextureGreen = true;
        pbr.useMetallnessFromMetallicTextureBlue = true;

        pbr.metallicTexture = new BABYLON.Texture(ARMTex, scene);

        return pbr;
    }

    static async importMesh(modelPath, name, scene, shadowGenerator){
    
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", modelPath, name, scene);

        result.meshes.forEach(element => {
            element.getChildren(
                (mesh) => {
                    console.log(mesh)
                    shadowGenerator.addShadowCaster(mesh, true);
                    mesh.receiveShadows = true;
                }
            )  
        })

        return result;
    }


    createSkyBox(path){

        this.envTex = BABYLON.CubeTexture.CreateFromPrefilteredData(path, this.scene);
        this.scene.environmentTexture = this.envTex;
        this.skybox = this.scene.createDefaultSkybox(this.envTex, true);

        return this.skybox;
    }

    get camera(){
        return this.basicCamera;
    }

    get currentScene(){
        return this.scene;
    }

    get gameEngine(){
        return this.engine;
    }

    instancedRender(){
        this.engine.runRenderLoop(function() {
            this.scene.render();
            });

            window.addEventListener("resize", function() {
            this.engine.resize();
        });
    }

    static staticRender(engine, scene){
        engine.runRenderLoop(function() {
            scene.render();
            });

            window.addEventListener("resize", function() {
            engine.resize();
        });
    }

    static renderMultiple(engine, scenes){
        engine.runRenderLoop(function() {
            scenes[activeScene].render();
            })

            window.addEventListener("resize", function() {
            engine.resize();
        });
    }

}