import * as CANNON from 'cannon/build/cannon'
import { AudioSource, AvatarAnchorPointType, AvatarAttach, CameraMode, CameraType, ColliderLayer, Entity, GltfContainer, InputAction, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, PBGltfContainer, PBMaterial_PbrMaterial, PointerEventType, PointerEvents, Schemas, Texture, TextureUnion, Transform, TransformType, TransformTypeWithOptionals, VisibilityComponent, engine, inputSystem, pointerEventsSystem } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color3, Color4 } from "@dcl/sdk/math"
import { addPhysicsConstraints } from './physicsConstraints'
import * as utils from "@dcl-sdk/utils"
import { displayBasketballUI, hideBasketballUI, hideStrenghtBar, scoreDisplay, setStrengthBar } from '../../../ui'
import { BasketballHoop } from './hoop'
import { PhysicsWorldStatic } from './physicsWorld'
import { bounceSource, bounceVolume, pickupSource, pickupVolume, throwBallSource, throwBallVolume } from './sounds'
import { moveLineBetween, realDistance } from './utilFunctions'

export const Throwable = engine.defineComponent('throwable-id', {
    index: Schemas.Number,
    isFired: Schemas.Boolean,   
    strength: Schemas.Number,
    maxStrength: Schemas.Number,
    holdScale: Schemas.Vector3,
    originalScale:Schemas.Vector3,
    anchorOffset: Schemas.Vector3,
    lastPos: Schemas.Vector3,
    lastDir: Schemas.Vector3,    
    
})

export const Carried = engine.defineComponent('carried-id', {          
})

export const HasTrail = engine.defineComponent('hastrail-id', {     
  lastPos: Schemas.Vector3,
  saveTimer:Schemas.Number,
  saveFreq: Schemas.Number  
})

export const TrailObject = engine.defineComponent('trail-id', {    
  fadeFactor: Schemas.Number      
})
//utils.triggers.enableDebugDraw(true)

const X_OFFSET = 0
const Y_OFFSET = -0.5
const Z_OFFSET = 1.5




const FIXED_TIME_STEPS = 1.0/60 // seconds
const MAX_TIME_STEPS = 3
//const RECALL_SPEED = 10
const SHOOT_VELOCITY = 45

// const shootSound = new Sound(new AudioClip('sounds/shoot.mp3'))
// const recallSound = new Sound(new AudioClip('sounds/recall.mp3'))

const ballShape:PBGltfContainer =  {
  src:"models/basketball/ball.glb",
  invisibleMeshesCollisionMask: ColliderLayer.CL_NONE,
  visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
}

const ballHighlightShape:PBGltfContainer =  {src:"models/basketball/ball_outline.glb"}



export class PhysicsManager {

  balls:Entity[]
  cannonBodies:CANNON.Body[]
  playerCollider:CANNON.Body
  world: CANNON.World
  playerHolding:boolean
  carriedIndex:number
  strengthHold:boolean
  avatarHandRoot:Entity
  hoops:BasketballHoop[]
  staticWorld:PhysicsWorldStatic
  ballHighlight:Entity
  forceMultiplier:number
  trails:Entity[]
  trailCount:number
  ballZoneCenter:Vector3
  

  constructor(ballCount:number){

    this.balls = []
    this.cannonBodies = []
    this.hoops = []
    this.trails = []
    this.trailCount = 16

    
    this.playerHolding = false
    this.carriedIndex = 0
    this.strengthHold = false
    this.forceMultiplier = 20
    
    this.ballZoneCenter = Vector3.create(32,0,38)
   
    this.world = new CANNON.World()
    this.world.quatNormalizeSkip = 0
    this.world.quatNormalizeFast = false
    this.world.gravity.set(0, -9.82 *2, 0) // m/s²

    const groundMaterial = new CANNON.Material('groundMaterial')
    const groundContactMaterial = new CANNON.ContactMaterial(      
      groundMaterial,
      groundMaterial,
      { friction: 0.1, restitution: 0.8}
    )
    this.world.addContactMaterial(groundContactMaterial)

    this.playerCollider = new CANNON.Body({
      mass: 10, // kg
      position: new CANNON.Vec3(
        0,-1,0
      ), // m
      shape: new CANNON.Box(new CANNON.Vec3(1,0.5,1))
      
    })   


    const translocatorPhysicsMaterial: CANNON.Material = new CANNON.Material(
      'translocatorMaterial',
    )   
    translocatorPhysicsMaterial.friction = 0.2
    translocatorPhysicsMaterial.restitution = 0.5
    this.playerCollider.material = translocatorPhysicsMaterial // Add bouncy material to translocator body
    this.playerCollider.linearDamping = 0.24 // Round bodies will keep translating even with friction so you need linearDamping
    this.playerCollider.angularDamping = 0.4 // Round bodies will keep rotating even with friction so you need angularDamping
    
    //this.world.addBody(this.playerCollider) 
    
    //ground plane collider
    const planeShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({
      mass: 0, // mass == 0 makes the body static
    })
    groundBody.addShape(planeShape)
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    ) // Reorient ground plane to be in the y-axis
    groundBody.position.y = 0.2 // Thickness of ground base model
    groundBody.material = translocatorPhysicsMaterial
    this.world.addBody(groundBody)
    
    //add initial balls
    for(let i=0; i< ballCount; i++){
      this.addObject(Vector3.create(24+Math.random()*2,4 + Math.random()*4,35+Math.random()*8))
    }

    // START INCREASING THE STRENGTH OF THE THROW
    engine.addSystem(() => {
      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN)){
        this.strengthHold = true
      }
    })
    // THROW THE BALL ON RELEASE
    engine.addSystem(() => {
      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP)){      
        if(this.strengthHold){
          this.throw()
          this.strengthHold = false
        }  
        
      }
    })

    this.avatarHandRoot = engine.addEntity()
    Transform.create(this.avatarHandRoot)
    AvatarAttach.create(this.avatarHandRoot,{
      anchorPointId: AvatarAnchorPointType.AAPT_RIGHT_HAND,
    })

    this.hoops.push(new BasketballHoop(this.world, Vector3.create(32, 6, 30.4), Quaternion.fromEulerDegrees(0,0,0)))
    this.hoops.push(new BasketballHoop(this.world, Vector3.create(41.6, 5.2, 40), Quaternion.fromEulerDegrees(0,-90,0)))
    this.hoops.push(new BasketballHoop(this.world, Vector3.create(22.4, 5.2, 40), Quaternion.fromEulerDegrees(0,90,0)))

   
    // add imported static cannon colliders
    this.staticWorld = new PhysicsWorldStatic(this.world)
     
    this.ballHighlight = engine.addEntity()
    Transform.create(this.ballHighlight, { 
      position: Vector3.create(8,-8,8)
     })
    GltfContainer.create(this.ballHighlight, ballHighlightShape)

    
    engine.addSystem((dt:number) => {
      this.update(dt)
    })

    // create pool of trail lines
    for(let i=0; i< this.trailCount; i++){
      let trailLine = engine.addEntity()
      Transform.create(trailLine, {scale: Vector3.create(0, 0, 0)})
      MeshRenderer.setCylinder(trailLine, 0.9, 1)

      Material.setPbrMaterial(trailLine, {
        albedoColor: Color4.fromHexString("#FFFFFF44"),
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
        emissiveColor: Color4.fromHexString("#FFFFFF44")
        
        
      })
      TrailObject.create(trailLine, {fadeFactor:0})

      this.trails.push(trailLine)
    }
    


    //this.addObject(Vector3.create(32,10,32))
  }
  addObject(pos:Vector3){

    let cannonBody = new CANNON.Body({
      mass: 0.8, // kg
      position: new CANNON.Vec3(
        pos.x,
        pos.y,
        pos.z
      ), // m
      shape: new CANNON.Sphere(0.35),
     //shape: new CANNON.Box(new CANNON.Vec3(0.35, 0.35, 0.35)),
    })


    let ball = engine.addEntity()
    Transform.create(ball, {})
    GltfContainer.create(ball, ballShape)
    VisibilityComponent.create(ball, {visible:true})
   

    // ball triggers the score zone
    utils.triggers.addTrigger(ball, utils.LAYER_2, utils.NO_LAYERS, 
      [{type: "sphere", position: Vector3.Zero(), radius: 0.8}],
      ()=>{             
      },
      undefined,
      Color3.Blue()
    )
    utils.triggers.enableTrigger(ball,false)

    const translocatorPhysicsMaterial: CANNON.Material = new CANNON.Material(
      'translocatorMaterial'
      
    )

    cannonBody.material = translocatorPhysicsMaterial // Add bouncy material to translocator body
    cannonBody.linearDamping = 0.1 // Round bodies will keep translating even with friction so you need linearDamping
    cannonBody.angularDamping = 0.4 // Round bodies will keep rotating even with friction so you need angularDamping
    
    // ball collision event (bounce)
    cannonBody.addEventListener('collide', ()=>{    
      
      const velocity = Vector3.length(Vector3.create(cannonBody.velocity.x, cannonBody.velocity.y, cannonBody.velocity.z ))

      if(velocity > 2){
        AudioSource.createOrReplace(ball, {
          audioClipUrl: bounceSource,
          playing: true,
          loop:false,
          volume: bounceVolume
        })
      }
        
    })

    translocatorPhysicsMaterial.restitution = 1
    this.world.addBody(cannonBody) 
    this.balls.push(ball)
    this.cannonBodies.push(cannonBody)
    let index = this.balls.length-1

    Throwable.create(ball, {
      index: index,
      strength:0.2, 
      isFired:false, 
      maxStrength:1,
      holdScale: Vector3.create(0.5, 0.5, 0.5),
      originalScale: Vector3.One(),
      anchorOffset: Vector3.create(-0.0,0.2,0),
     
    } )



    


    // pointerEventsSystem.onPointerDown(ball,
    //   (e) => {      
    //       this.pickUpBall(index)
    //   },         
    //   { hoverText: 'Pick up', button: InputAction.IA_PRIMARY, maxDistance:10 }
    // )    

    PointerEvents.create(ball, { pointerEvents: [
      {
        eventInfo: {button: InputAction.IA_POINTER, maxDistance: 10},
        eventType: PointerEventType.PET_HOVER_ENTER
      },
      {
        eventInfo: {button: InputAction.IA_POINTER, maxDistance: 100},
        eventType: PointerEventType.PET_HOVER_LEAVE
      },
      {
        eventInfo: {button: InputAction.IA_PRIMARY, maxDistance: 10, hoverText: "Pick Up"},
        eventType: PointerEventType.PET_DOWN
      },
     
    ]})

    engine.addSystem(() => {
      const meshEntities = engine.getEntitiesWith(Throwable)
      for (const [entity] of meshEntities) {
        
        if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_HOVER_ENTER, entity)) {
          // don't highlight if player is holding the ball
          if(!Carried.has(entity)){
            const transform = Transform.getMutable(this.ballHighlight)
            transform.parent = entity
            transform.position = Vector3.Zero()
          }         
        }
    
         if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_HOVER_LEAVE, entity)) {
          const transform = Transform.getMutable(this.ballHighlight)
          transform.parent = engine.RootEntity
          transform.position = Vector3.create(8,-10,8)
        }
    
         if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {
          this.pickUpBall(Throwable.get(entity).index)
        }
      }
    })
    

  }

  pickUpBall(index:number){
   
    if(!this.playerHolding){

      const throwableInfo = Throwable.get(this.balls[index])
      Carried.createOrReplace(this.balls[index])
      Transform.createOrReplace(this.balls[index], {
        position: Vector3.create(throwableInfo.anchorOffset.x, throwableInfo.anchorOffset.y, throwableInfo.anchorOffset.z),
        scale: throwableInfo.holdScale,
        parent: this.avatarHandRoot
      })
      HasTrail.deleteFrom(this.balls[index])
      this.playerHolding = true
      AudioSource.createOrReplace(this.balls[index], {
        audioClipUrl: pickupSource,
        playing: true,
        loop:false,
        volume: pickupVolume
      })

    //   AvatarAttach.create(this.balls[index],{
    //     anchorPointId: AvatarAnchorPointType.AAPT_RIGHT_HAND,
    // })
      this.carriedIndex = index
      displayBasketballUI()
    }
  }

  resetBall(index:number){
    if(this.playerHolding){
      let ball = this.balls[this.carriedIndex]
      hideStrenghtBar()
      hideBasketballUI()
      Carried.deleteFrom(ball)
      const ballTransform = Transform.getMutable(ball)
      const throwableInfo = Throwable.getMutable(ball)
      ballTransform.parent = engine.RootEntity
      ballTransform.scale = throwableInfo.originalScale

      this.cannonBodies[this.carriedIndex].position.set(22+ Math.random(), 5, 34 + Math.random())
      
      this.playerHolding = false
      throwableInfo.strength = 0.2

      //ball only triggers the score zone once it is thrown
      utils.triggers.enableTrigger(ball,true)
      setStrengthBar(0.2)

    }
  }

  throw(){

    if(this.playerHolding){
      hideStrenghtBar()
      //lock the bottom of each hoop
      for ( let i=0; i< this.hoops.length; i++){
        this.hoops[i].enableLock()
      }
     
      const playerPos = Transform.get(engine.PlayerEntity).position
      const ball = this.balls[this.carriedIndex]
      const throwableInfo = Throwable.getMutable(ball)      

     

      AudioSource.createOrReplace(ball, {
        audioClipUrl: throwBallSource,
        playing: true,
        loop:false,
        volume: throwBallVolume
      })
     // AvatarAttach.deleteFrom(ball)
      const ballTransform = Transform.getMutable(ball)
      ballTransform.parent = engine.RootEntity
      ballTransform.scale = throwableInfo.originalScale
      const cameraDir =  Vector3.rotate(Vector3.Forward(), Transform.get(engine.CameraEntity).rotation)

      let dropPos =  Vector3.add( cameraDir, playerPos ) 
      dropPos.y = dropPos.y + 0.5

      let cameraEntity = CameraMode.get(engine.CameraEntity)

      // in third person the throw is offset to match the crosshair
      if(cameraEntity.mode ==  CameraType.CT_THIRD_PERSON){

        //calcualte a vector that is perpendicular to the camera dir and points to the right
        let rightDir = Vector3.cross(Vector3.Up(), cameraDir )

        //scale it to match the crosshair position roughly
        rightDir = Vector3.scale(rightDir, 0.6)

        // add this offset vector to the original drop position
        dropPos = Vector3.add(dropPos, rightDir)
        
      }
      

      
      // ADD TRAIL to the thrown ball for 4 seconds
      // HasTrail.createOrReplace(ball,{
      //   lastPos: Vector3.create(dropPos.x, dropPos.y, dropPos.z),
      //   saveFreq: 0.05,
      //   saveTimer: 0        
      // })

      utils.timers.setTimeout(()=>{
        HasTrail.createOrReplace(ball,{
          lastPos: Vector3.create(dropPos.x, dropPos.y, dropPos.z),
          saveFreq: 0.05,
          saveTimer: 0        
        })
      }, 50)
      utils.timers.setTimeout(()=>{
        HasTrail.deleteFrom(ball)
      }, 4000)
      
      Carried.deleteFrom(ball)


      this.cannonBodies[this.carriedIndex].position.set(dropPos.x, dropPos.y, dropPos.z)
      this.cannonBodies[this.carriedIndex].applyImpulse(
        new CANNON.Vec3(
          cameraDir.x * throwableInfo.strength * this.forceMultiplier, 
          cameraDir.y * throwableInfo.strength * this.forceMultiplier, 
          cameraDir.z * throwableInfo.strength * this.forceMultiplier), 
        new CANNON.Vec3(
          dropPos.x, 
          dropPos.y, 
          dropPos.z))
      this.playerHolding = false
      throwableInfo.strength = 0.2

      //ball only triggers the score zone once it is thrown
      utils.triggers.enableTrigger(ball,true)
      setStrengthBar(0.2)
    }
    
  }

  update(dt:number){
   this.world.step(FIXED_TIME_STEPS, dt, MAX_TIME_STEPS)

   // UPDATE THE TRAILS ON EVERY FRAME (FADE + SIZE DECREASE)
   for(let j = 0; j < this.trails.length; j++){  
    const trailTransform = Transform.getMutable( this.trails[j])
    const trailInfo = TrailObject.getMutable( this.trails[j])
    
     trailTransform.scale.x -= dt * 0.05
     trailTransform.scale.z -= dt * 0.05
    // trailTransform.scale.z -= dt * 0.4
    trailInfo.fadeFactor += dt
    if(trailInfo.fadeFactor > 1) trailInfo.fadeFactor = 1
    if(trailTransform.scale.x < 0) trailTransform.scale.x = 0
    if(trailTransform.scale.z < 0) trailTransform.scale.z = 0

    Material.setPbrMaterial(this.trails[j], {
      albedoColor: Color4.fromInts(255,255 *(1-trailInfo.fadeFactor) * 2, 255 *(1-trailInfo.fadeFactor) * 0.1, 255 * (1-trailInfo.fadeFactor) *0.5 ),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
      emissiveColor: Color3.fromInts(255,255 *(1-trailInfo.fadeFactor) * 2, 255 *(1-trailInfo.fadeFactor) * 0.4),
      emissiveIntensity: (1-trailInfo.fadeFactor) *2
      
      
    })

    
    
    // if(trailTransform.scale.y < 0) trailTransform.scale.y = 0
    // if(trailTransform.scale.z < 0) trailTransform.scale.z = 0
  }
  
  // ONLY ADD NEW TRAIL LINES AT A GIVEN FREQUENCY
   for(let i = 0; i < this.balls.length; i++){    

    if(HasTrail.getOrNull(this.balls[i]) != null){
      const transformBall = Transform.getMutable(this.balls[i])
      let trailInfo = HasTrail.getMutable(this.balls[i])

      trailInfo.saveTimer += dt

      if(trailInfo.saveTimer > trailInfo.saveFreq){
        trailInfo.saveTimer = 0    
            

        let trailLine = this.trails.shift()
        //const trailTransform = Transform.getMutable(trailLine)        
        //trailTransform.position = Vector3.create( transformBall.position.x,  transformBall.position.y,  transformBall.position.z)
        //trailTransform.scale = Vector3.create(0.35,0.35,0.35),

        moveLineBetween(trailLine, transformBall.position, trailInfo.lastPos  )
        Vector3.copyFrom( transformBall.position, trailInfo.lastPos)
        let fadeFactor = TrailObject.getMutable(trailLine).fadeFactor = 0

        Material.setPbrMaterial(trailLine, {
          albedoColor: Color4.fromInts(255,255 *(1-fadeFactor) * 2, 255 *(1-fadeFactor) * 0.1, 255 * (1-fadeFactor) *5 ),
          transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
          emissiveColor: Color3.fromInts(255,255 *(1-fadeFactor) * 2, 255 *(1-fadeFactor) * 0.1),
          emissiveIntensity: (1-fadeFactor) *1
          
          
        })
       
        this.trails.push(trailLine)
      }
    }

    // ALL NON-CARRIED BALLS FOLLOW THE CANNON PHYSICS
    if(Carried.getOrNull(this.balls[i]) == null){
      const transformBall = Transform.getMutable(this.balls[i])
      
      transformBall.position.x = this.cannonBodies[i].position.x
      transformBall.position.y = this.cannonBodies[i].position.y
      transformBall.position.z = this.cannonBodies[i].position.z 
      transformBall.rotation = this.cannonBodies[i].quaternion

    }   
    // IF A BALL IS CARRIED THEN UPDATE THE THROW STRENGTH 
    else{
      if(this.strengthHold){
        const throwable = Throwable.get(this.balls[i])

        if(throwable.strength + dt   < throwable.maxStrength ){
          Throwable.getMutable(this.balls[i]).strength += dt * 0.5
          setStrengthBar(throwable.strength)
        }
        else{
          Throwable.getMutable(this.balls[i]).strength  = throwable.maxStrength
          setStrengthBar(throwable.strength)
        }
      }
       //const transformBall = Transform.getMutable(this.balls[i])
      // const cameraDir =  Vector3.rotate(Vector3.Forward(), Transform.get(engine.CameraEntity).rotation)
      // const playerPos = Transform.get(engine.PlayerEntity).position      
      
      
    }    
   }
  //  this.playerCollider.position.x = Transform.get(engine.PlayerEntity).position.x
  //  this.playerCollider.position.y = Transform.get(engine.PlayerEntity).position.y-1
  //  this.playerCollider.position.z = Transform.get(engine.PlayerEntity).position.z

  // ball cannot leave the bar area within a distance from the center beam 
  if(realDistance( Transform.get(engine.PlayerEntity).position, this.ballZoneCenter) > 19){
    this.resetBall(this.carriedIndex)
  }

  }
}




