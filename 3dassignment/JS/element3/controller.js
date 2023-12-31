var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;
var jumpPressed = false;
var jumpValue = 0;
var frontVector;
var rotationAxis;
var doubleJump;
var deltaTime;
var speedMovement = 0.006;
var leftJoystick;
var rightJoystick;
var simulatedGravity;    
var gravityMultiplier = 2000;
var jumpMultiplier = 0.26;
var jumpDivider = 20;
var onGround = false;
var onScalable = false;
var previousPosition;
var previousTime;
var velocity;
var falling = false;

const ray = new BABYLON.Ray();
const rayHelper = new BABYLON.RayHelper(ray); 
const ray2 = new BABYLON.Ray();
const rayHelper2 = new BABYLON.RayHelper(ray2); 
const ray3 = new BABYLON.Ray();
const rayHelper3 = new BABYLON.RayHelper(ray3); 
const ray4 = new BABYLON.Ray();
const rayHelper4 = new BABYLON.RayHelper(ray4); 
var pickArray = [ray, ray2, ray3, ray4];

var particleSystem;
var winFocused = true;

function updateMovement() {
    
    if (!winFocused)
    {
        jumpValue = 0;
        deltaTime = 0;
        return;
    }

    checkPlayerVelocity();

    simulatedGravity = deltaTime / gravityMultiplier;
    jumpValue -= deltaTime * simulatedGravity;

    onScalable = false; 
    pickArray.forEach((ray) => {
        var pick = scene.pickWithRay(ray);
        if (pick.hit){
           onGround = true;
           if (pick.pickedMesh.meshType && pick.pickedMesh.meshType == "scalable")
           {
                onScalable = true;
           }
        } 
    });
     
    if (onScalable) {
        jumpValue = deltaTime * simulatedGravity * 0.1;
    }

    if (jumpPressed && onGround)
    {
        bounceEnabled = true;
        onGround = false;
        jumpValue = deltaTime * jumpMultiplier;
        if (onScalable)
            jumpValue = deltaTime * jumpMultiplier*0.95;
        console.log("jumpValue: " + jumpValue.toFixed(2));
    } 

    if (onGround && falling)
    {
        jumpValue = deltaTime * jumpMultiplier * 0.32;
    }
    
    if (jumpValue > deltaTime * jumpMultiplier * 1.1)
        jumpValue = deltaTime * jumpMultiplier * 1.1;
    if (jumpValue < -deltaTime/2)
        jumpValue = -deltaTime/2;

    if (!onGround)
    {
        particleSystem.stop();
        bounceEnabled = false;
    } else {
        falling = false;
    }

    particleSystem.emitter = new BABYLON.Vector3(player.position.x, player.position.y-0.5, player.position.z);
}

function checkPlayerVelocity() {
    var currentTime = performance.now();
    var timeCheck = (currentTime - previousTime) / 1000;
    var currentPosition = player.position.clone();
    var displacement = currentPosition.subtract(previousPosition);
    velocity = displacement.scale(1 / timeCheck);
    previousPosition.copyFrom(currentPosition);
    previousTime = currentTime;
}

function resetState() { 
    onGround = true;
    falling = false;
    deltaTime = 0;
    jumpValue = 0;
    simulatedGravity = 0;
    isWPressed = false;
    isSPressed = false;
    isAPressed = false;
    isDPressed = false;
    jumpPressed = false;
    if (isTouch && leftJoystick)
    {
        leftJoystick.deltaPosition.x = 0;
        leftJoystick.deltaPosition.y = 0;
        rightJoystick.deltaPosition.x = 0;
        rightJoystick.deltaPosition.y = 0;
        leftJoystick.clearPosition();
        rightJoystick.clearPosition();
    }
    frontVector = player.getDirection(new BABYLON.Vector3(0,0,0));
    particleSystem.stop();
}

function checkFocusWindow() {  
    $(document).ready(function () {
        $(window).on('focus', function () {
            setTimeout(() => {
                winFocused = true;
                console.log('Focus');
                resetState();
            }, 500);
        });
        $(window).on('blur', function () {
            winFocused = false;
            console.log('Blur');
            resetState();
        });
    });
}

function setPlayerMovement() {

    checkFocusWindow();
    
    rayHelper.attachToMesh(player, new BABYLON.Vector3(-1, -0.98, 0.7), new BABYLON.Vector3(0, -0.2, 0.2), 0.35);
    rayHelper2.attachToMesh(player, new BABYLON.Vector3(-1, -0.98, -0.7), new BABYLON.Vector3(0, -0.2, -0.2), 0.35);
    rayHelper3.attachToMesh(player, new BABYLON.Vector3(1, -0.98, 0.7), new BABYLON.Vector3(0, -0.2, 0.2), 0.35);
    rayHelper4.attachToMesh(player, new BABYLON.Vector3(1, -0.98, -0.7), new BABYLON.Vector3(0, -0.2, -0.2), 0.35);
    previousPosition = player.position.clone();
    previousTime = performance.now();

    createSmokeParticles(player);

    if (isTouch) {
        setJoystickController();
    } else {
        setKeyboardController();
    }
    
    jumpFromBT();
}

var keyboardIncrementalSpeed = 0;
function setKeyboardController() {

    $(document).keypress(function (event) {
        event.preventDefault();

        if (event.key == 'w' || event.key == 'W' || event.key == "ArrowUp") {
            isWPressed = true;
        }
        else if (event.key == 's' || event.key == 'S' || event.key == "ArrowDown") {
            isSPressed = true;
        }
        else if (event.key == 'a' || event.key == 'A' || event.key == "ArrowLeft") {
            isAPressed = true;
        }
        else if (event.key == 'd' || event.key == 'D' || event.key == "ArrowRight") {
            isDPressed = true;
        }
        else if (event.code == 'Space') {
            jumpPressed = true;
        }  
    });

    $(document).keyup(function (event) {
        event.preventDefault();

        if (event.key == 'w' || event.key == 'W' || event.key == "ArrowUp") {
            isWPressed = false;
        }
        else if (event.key == 's' || event.key == 'S' || event.key == "ArrowDown") {
            isSPressed = false;
        }
        else if (event.key == 'a' || event.key == 'A' || event.key == "ArrowLeft") {
            isAPressed = false;
        }
        else if (event.key == 'd' || event.key == 'D' || event.key == "ArrowRight") {
            isDPressed = false;
        }
        else if (event.code == 'Space') {
            jumpPressed = false;
        }  
    });

    scene.registerBeforeRender(()=>{
   
        deltaTime = engine.getDeltaTime();

        updateMovement();
        
        frontVector = player.getDirection(new BABYLON.Vector3(0,jumpValue/jumpDivider,0));

        if (isWPressed) {

            if (keyboardIncrementalSpeed < 1)
            {
                keyboardIncrementalSpeed += deltaTime / 500;
            }
            if (onGround)
            {
                scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, runAnim, 1.2, 0.03));
                if (velocity.z != 0 && velocity.y > 0)
                    particleSystem.start();
                else
                    particleSystem.stop();
            }
            currentAnim = runAnim;
            frontVector = player.getDirection(new BABYLON.Vector3(0,jumpValue/jumpDivider,speedMovement*deltaTime * keyboardIncrementalSpeed));
        }
        if (isSPressed) {

            if (keyboardIncrementalSpeed < 1)
            {
                keyboardIncrementalSpeed += deltaTime / 500;
            }
            if (onGround)
            {
                scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, runBackAnim, 1.5, 0.03));
                if (velocity.z != 0 && velocity.y > 0)
                    particleSystem.start();
                else
                    particleSystem.stop();
            }
            
            currentAnim = runBackAnim;
            frontVector = player.getDirection(new BABYLON.Vector3(0,jumpValue/jumpDivider,-speedMovement*deltaTime * keyboardIncrementalSpeed));
        }
        if (isAPressed) {
            rotationAxis = new BABYLON.Vector3(0, -1, 0);
        }
        if (isDPressed) {
            rotationAxis = new BABYLON.Vector3(0, 1, 0);
        }
        
        if (isAPressed || isDPressed)
        {
            player.rotate(rotationAxis, speedMovement*deltaTime*0.4, BABYLON.Space.LOCAL);
            player.frontVector = new BABYLON.Vector3(Math.sin(player.rotation.z), jumpValue, Math.cos(player.rotation.z))

            if (isSPressed == false && isWPressed == false && onGround) {
                currentAnim = walkAnim;
                scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, walkAnim, 0.9, 0.03));
            }
        }
        if (! isWPressed && ! isSPressed && ! isAPressed && ! isDPressed) {
            currentAnim = idleAnim;
            scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, idleAnim, 1.0, 0.03));
        }

        if (!isWPressed && !isSPressed)
        {
            particleSystem.stop();
            keyboardIncrementalSpeed = 0;
        }

        if (!jumpPressed && !onGround && Math.round(velocity.y) == 0 && !falling)
        {
            falling = true;
        }

        player.moveWithCollisions(frontVector);
    });
}

function setJoystickController() {

    leftJoystick = new BABYLON.VirtualJoystick(true);
    rightJoystick = new BABYLON.VirtualJoystick(false);
    leftJoystick.setJoystickColor("#b3dbbf30");
    rightJoystick.setJoystickColor("#b3dbbf30");
    leftJoystick.clearPosition();
    rightJoystick.clearPosition();
    BABYLON.VirtualJoystick.Canvas.style.zIndex = "4";
   
    scene.registerBeforeRender(()=>{

        deltaTime = engine.getDeltaTime();

        updateMovement();
        
        frontVector = player.getDirection(new BABYLON.Vector3(0,jumpValue/jumpDivider,0));

        if (leftJoystick.pressed && leftJoystick.deltaPosition.y != 0) {

            if (leftJoystick.deltaPosition.y > 0)
                frontVector = player.getDirection(new BABYLON.Vector3(0,jumpValue/jumpDivider,leftJoystick.deltaPosition.y*speedMovement*deltaTime));
            else
                frontVector = player.getDirection(new BABYLON.Vector3(0,jumpValue/jumpDivider,-leftJoystick.deltaPosition.y*speedMovement*deltaTime * -1));

            if (leftJoystick.deltaPosition.y > 0)
            {
                if (onGround)
                {
                    scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, runAnim, 1.5, 0.03));
                    if (velocity.z != 0 && velocity.y > 0)
                        particleSystem.start();
                    else
                        particleSystem.stop();
                }
                currentAnim = runAnim;
            } else if (leftJoystick.deltaPosition.y < 0) {
                scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, runAnim, 1.2, 0.03));
                if (onGround)
                {
                    scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, runBackAnim, 1.5, 0.03));
                    if (velocity.z != 0 && velocity.y > 0)
                        particleSystem.start();
                    else
                        particleSystem.stop();
                }

                currentAnim = runBackAnim;
            }
            
        } else {
            leftJoystick.deltaPosition.y = 0;
            particleSystem.stop();
        }

        if (rightJoystick.pressed) {

            var rotationAxis = new BABYLON.Vector3(0, 1, 0)
            player.rotate(rotationAxis, rightJoystick.deltaPosition.x*speedMovement*deltaTime*0.4, BABYLON.Space.LOCAL);
            player.frontVector = new BABYLON.Vector3(Math.sin(player.rotation.z), jumpValue, Math.cos(player.rotation.z))

            if (!leftJoystick.pressed && rightJoystick.deltaPosition.x != 0)
            {
                currentAnim = walkAnim;
                scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, walkAnim, 1.0, 0.03));
            }
        } 

        if (!leftJoystick.pressed && !rightJoystick.pressed) {
            currentAnim = idleAnim;
            scene.onBeforeRenderObservable.runCoroutineAsync(animationBlending(currentAnim, idleAnim, 1.0, 0.03));
        }

        if (!jumpPressed && !onGround)
        {
            particleSystem.stop();
        } 

        if (!jumpPressed && !onGround && Math.round(velocity.y) == 0 && !falling)
        {
            falling = true;
        }

        player.moveWithCollisions(frontVector);
    });
}
function jumpFromBT() {
    if (onGround)
        jumpPressed = true;
    setTimeout(() => {
        jumpPressed = false;
    }, 20);
}
function* animationBlending (fromAnim, toAnim, speed, blendingSpeed) {
    toAnim.start(false, speed, toAnim.from, toAnim.to, false);
    let currentWeight = 1;
    let newWeight = 0;
    while (newWeight < 1) {
        newWeight += blendingSpeed;
        currentWeight -= blendingSpeed;
        toAnim.setWeightForAllAnimatables(newWeight);
        fromAnim.setWeightForAllAnimatables(currentWeight);
        yield;
    }
}
function createSmokeParticles() { 
    particleSystem = new BABYLON.ParticleSystem("particles", 100, scene);
    particleSystem.particleTexture = new BABYLON.Texture("./resources/images/smoke.png", scene);
    particleSystem.emitter = new BABYLON.Vector3(player.position.x, 0, player.position.z);
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.1, -0.2);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particleSystem.gravity = new BABYLON.Vector3(0,-3,0);
    particleSystem.minSize = 0.15;
    particleSystem.maxSize = 0.35;
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 0.6;
    particleSystem.emitRate = 200;
    particleSystem.addSizeGradient(0, 0.1, 0.3);
    particleSystem.addSizeGradient(1.0, 1, 2);
    particleSystem.addColorGradient(0, new BABYLON.Color4(0.52, 0.3, 0.2, 0.2));
    particleSystem.addColorGradient(1, new BABYLON.Color4(1, 0.9, 0.9, 0));
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
}