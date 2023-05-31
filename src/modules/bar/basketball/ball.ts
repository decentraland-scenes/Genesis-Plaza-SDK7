import * as CANNON from 'cannon/build/cannon'
import { AvatarAnchorPointType, AvatarAttach, CameraMode, CameraType, Entity, GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, PBGltfContainer, PBMaterial_PbrMaterial, PointerEventType, PointerEvents, Schemas, Texture, TextureUnion, Transform, TransformType, TransformTypeWithOptionals, VisibilityComponent, engine, inputSystem, pointerEventsSystem } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math"
import { addPhysicsConstraints } from './physicsConstraints'
import * as utils from "@dcl-sdk/utils"
import { displayBasketballUI, hideBasketballUI, hideStrenghtBar, scoreDisplay, setStrengthBar } from '../../../ui'
import { BasketballHoop } from './hoop'
import { PhysicsWorldStatic } from './physicsWorld'

export const Throwable = engine.defineComponent('throwable-id', {
    index: Schemas.Number,
    isFired: Schemas.Boolean,   
    strength: Schemas.Number,
    maxStrength: Schemas.Number,
    holdScale: Schemas.Vector3,
    originalScale:Schemas.Vector3,
    anchorOffset: Schemas.Vector3
    
})
export const Carried = engine.defineComponent('carried-id', {     
    
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

const ballShape:PBGltfContainer =  {src:"models/basketball/ball.glb"}
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
  

  constructor(ballCount:number){

    this.balls = []
    this.cannonBodies = []
    this.hoops = []

    
    this.playerHolding = false
    this.carriedIndex = 0
    this.strengthHold = false
    this.forceMultiplier = 20
    
   
    this.world = new CANNON.World()
    this.world.quatNormalizeSkip = 0
    this.world.quatNormalizeFast = false
    this.world.gravity.set(0, -9.82, 0) // m/s²

    const groundMaterial = new CANNON.Material('groundMaterial')
    const groundContactMaterial = new CANNON.ContactMaterial(      
      groundMaterial,
      groundMaterial,
      { friction: 0.1, restitution: 0.5}
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
    
    for(let i=0; i< ballCount; i++){
      this.addObject(Vector3.create(22+Math.random()*8,4 + Math.random()*4,35+Math.random()*8))
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



    //this.addObject(Vector3.create(32,10,32))
  }
  addObject(pos:Vector3){

    let cannonBody = new CANNON.Body({
      mass: 1, // kg
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
      anchorOffset: Vector3.create(-0.0,0.2,0)
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
      this.playerHolding = true

    //   AvatarAttach.create(this.balls[index],{
    //     anchorPointId: AvatarAnchorPointType.AAPT_RIGHT_HAND,
    // })
      this.carriedIndex = index
      displayBasketballUI()
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

      Carried.deleteFrom(ball)
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

   for(let i = 0; i < this.balls.length; i++){    

    if(Carried.getOrNull(this.balls[i]) == null){
      const transformBall = Transform.getMutable(this.balls[i])

      transformBall.position.x = this.cannonBodies[i].position.x
      transformBall.position.y = this.cannonBodies[i].position.y
      transformBall.position.z = this.cannonBodies[i].position.z 
      transformBall.rotation = this.cannonBodies[i].quaternion
    }    
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
   this.playerCollider.position.x = Transform.get(engine.PlayerEntity).position.x
   this.playerCollider.position.y = Transform.get(engine.PlayerEntity).position.y-1
   this.playerCollider.position.z = Transform.get(engine.PlayerEntity).position.z
  }
}




