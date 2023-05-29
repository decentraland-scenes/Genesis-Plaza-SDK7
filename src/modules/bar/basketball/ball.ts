//import { Sound } from './sounds'maxStrength
//import * as ui from '@dcl/ui-scene-utils'
//import { createFloatingText } from './floatingText'
//import { alteredUserName, dataType } from './wsConnection'
//import { streakCounter } from './basketballMain'
//import * as utils from '@dcl/ecs-scene-utils'
import * as CANNON from 'cannon/build/cannon'
import { AvatarAnchorPointType, AvatarAttach, CameraMode, CameraType, Entity, GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, PBGltfContainer, PBMaterial_PbrMaterial, PointerEventType, PointerEvents, Schemas, Texture, TextureUnion, Transform, TransformType, TransformTypeWithOptionals, VisibilityComponent, engine, inputSystem, pointerEventsSystem } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math"
import { addPhysicsConstraints } from './physicsConstraints'
import * as utils from "@dcl-sdk/utils"
//import { scoreDisplay, setStrengthBar } from '../ui'
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
  

  constructor(transform:TransformType){

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
      { friction: 0.1, restitution: 1}
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
      'translocatorMaterial'
    )   

    this.playerCollider.material = translocatorPhysicsMaterial // Add bouncy material to translocator body
    this.playerCollider.linearDamping = 0.2 // Round bodies will keep translating even with friction so you need linearDamping
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
    groundBody.position.y = 0.0 // Thickness of ground base model
    this.world.addBody(groundBody)
    
    for(let i=0; i< 10; i++){
      this.addObject(Vector3.create(12+Math.random()*8,10 + Math.random()*5,12+Math.random()*8))
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

    this.hoops.push(new BasketballHoop(this.world, Vector3.create(8,3,8), Quaternion.fromEulerDegrees(0,90,0)))
    this.hoops.push(new BasketballHoop(this.world, Vector3.create(15,6,8), Quaternion.fromEulerDegrees(0,0,0)))
    this.hoops.push(new BasketballHoop(this.world, Vector3.create(8,5,16), Quaternion.fromEulerDegrees(0,45,0)))

   
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
      strength:0.1, 
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
    }
  }

  throw(){

    if(this.playerHolding){

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
      throwableInfo.strength = 0.1

      //ball only triggers the score zone once it is thrown
      utils.triggers.enableTrigger(ball,true)
      //setStrengthBar(0)
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
          //setStrengthBar(throwable.strength)
        }
        else{
          Throwable.getMutable(this.balls[i]).strength  = throwable.maxStrength
          //setStrengthBar(throwable.strength)
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












// export class Ball {
//   entity:Entity
//   isFired: boolean = false
//   //   blueGlow = new Entity()
//   //   orangeGlow = new Entity()
//   body: CANNON.Body
//   holding: boolean = false
//   otherHolding: boolean = false
//   lastHolder: boolean = false
//   world: CANNON.World
//   socket: WebSocket
//   constructor(transform: TransformType, world: CANNON.World, socket: WebSocket) {
//     this.entity = engine.addEntity()

//     Transform.create(this.entity, transform)
//     GltfContainer.create(this.entity, idleBall)
//     VisibilityComponent.create(this.entity, {visible:true})

//     this.world = world
//     this.socket = socket

//     pointerEventsSystem.onPointerDown(this.entity,
//         (e) => {
//             if (this.holding || this.otherHolding) return 
//             this.playerPickUp(Transform.get(this.entity).position)
//         },
//         { hoverText: 'Pick up', button: InputAction.IA_PRIMARY }
//       )    

//     this.body = new CANNON.Body({
//       mass: 3, // kg
//       position: new CANNON.Vec3(
//         transform.position.x,
//         transform.position.y,
//         transform.position.z
//       ), // m
//       shape: new CANNON.Sphere(0.25), // m (Create sphere shaped body with a radius of 0.2)
//     })

//     const translocatorPhysicsMaterial: CANNON.Material = new CANNON.Material(
//       'translocatorMaterial'
//     )

//     this.body.material = translocatorPhysicsMaterial // Add bouncy material to translocator body
//     this.body.linearDamping = 0.4 // Round bodies will keep translating even with friction so you need linearDamping
//     this.body.angularDamping = 0.4 // Round bodies will keep rotating even with friction so you need angularDamping
//     world.addBody(this.body) // Add body to the world

//     //this.body.addEventListener('collide', (e) => {
//      // log('Collided with body:', e.body)
//       // sparks
//       // randomly play voice
//     //})



// //     this.addComponent(
// //       new utils.TriggerComponent(
// //         new utils.TriggerSphereShape(0.25, new Vector3(0, 0, 0)),
// //         {
// //           onTriggerEnter: () => {
// //             ui.displayAnnouncement('SCORE!')
// //           },
// //           layer: 2,
// //           triggeredByLayer: 1,
// //         }
// //       )
// //     )

//    }

//   setPos(pos: Vector3, rot: Quaternion, holding?: boolean) {

//     const transfromMutable = Transform.getMutable(this.entity)

//     transfromMutable.position =  pos
//     transfromMutable.rotation =  rot    

//     this.body.position = new CANNON.Vec3(pos.x, pos.y, pos.z)
//     this.body.quaternion = new CANNON.Quaternion(rot.x, rot.y, rot.z, rot.w)

//     this.lastHolder = false
//     this.holding = false
//     if (holding) {
//       this.otherHolding = true
//     } else {
//       this.otherHolding = false
//     }
//   }

//   playerPickUp(pos: Vector3) {
//     this.holding = true
//     this.lastHolder = true
//     this.otherHolding = false
//     this.isFired = false
//     //recallSound.getComponent(AudioSource).playOnce()

    

//     this.body.velocity.setZero()
//     this.body.angularVelocity.setZero()

//     Transform.getMutable(this.entity).parent = engine.PlayerEntity

//     //this.setParent(Attachable.FIRST_PERSON_CAMERA) //  FIRST_PERSON_CAMERA)
//     const transfromMutable = Transform.getMutable(this.entity)

//     transfromMutable.position = Vector3.create(X_OFFSET, Y_OFFSET, Z_OFFSET)
//     transfromMutable.rotation = Quaternion.fromEulerDegrees(0, 180, 0)
//     this.body.position = new CANNON.Vec3(X_OFFSET, Y_OFFSET, Z_OFFSET)
//     //this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), 0)

//     if (pos.y > 0.5) {
//      // ui.displayAnnouncement('Good catch!')
//       //streakCounter.increase()
//     } else {
//       //streakCounter.set(0)
//     }

//     // TODO SEND 
//     // this.socket.send(
//     //   JSON.stringify({
//     //     type: dataType.PICK,
//     //     data: {
//     //       user: alteredUserName,
//     //       pos: pos,
//     //       streak: streakCounter.read(),
//     //       timeStamp: Date.now(),
//     //     },
//     //   })
//     // )

//     // if y > 0 -> Show UI "Caught!"

//     // maybe if currently moving / longer distance, more score
//   }
//   otherPickUp(user: string, pos: Vector3, streak: number) {
//     this.holding = false
//     this.lastHolder = false
//     this.otherHolding = true
//     this.isFired = false

//     this.body.velocity.setZero()
//     this.body.angularVelocity.setZero()

//     if (pos.y > 1.5) {
//       //createFloatingText('Wow!', pos, 0.5, 2, Color3.Red())
//     } else if (pos.y > 0.5) {
//     //  createFloatingText('Good Catch!', pos, 0.5, 2, Color3.Red())
//     } else {
//      // createFloatingText('Picked frisbee up', pos, 0.5, 2)
//     }
//    // streakCounter.set(streak)

//     // if y > 0 -> Show in-world UI "Caught!"
//   }
//   // playerThrow(shootDirection: Vector3, shootStrength: number) {
//   //   if (this.isFired || !this.holding) return
//   //   this.isFired = true

   
//   //   this.addComponentOrReplace(confusedBall)

//   //   shootSound.getComponent(AudioSource).playOnce()
//   //   this.holding = false

//   //   this.switchState(BallState.Confused)

//   //   //this.setGlow(true)
//   //   this.setParent(null)

//   //   this.body.position.set(
//   //     Camera.instance.feetPosition.x + shootDirection.x,
//   //     shootDirection.y + Camera.instance.position.y,
//   //     Camera.instance.feetPosition.z + shootDirection.z
//   //   )

//   //   // Shoot
//   //   this.body.applyImpulse(
//   //     new CANNON.Vec3(
//   //       shootDirection.x * shootStrength,
//   //       shootDirection.y * shootStrength,
//   //       shootDirection.z * shootStrength
//   //     ),
//   //     new CANNON.Vec3(
//   //       this.body.position.x,
//   //       this.body.position.y,
//   //       this.body.position.z
//   //     )
//   //   )
//   // }
//   // otherThrow(
//   //   pos: Vector3,
//   //   rot: Quaternion,
//   //   shootDirection: Vector3,
//   //   shootStrength: number
//   // ) {
//   //   this.holding = false
//   //   this.lastHolder = false
//   //   this.otherHolding = false
//   //   this.isFired = true    
//   //   //shootSound.getComponent(AudioSource).playOnce()

//   //   this.getComponent(GLTFShape).visible = true
//   //   this.setParent(null)

//   //   engine.addSystem(new shootBallSystem(this))

//   //   this.getComponent(Transform).position.copyFrom(pos)
//   //   this.getComponent(Transform).rotation.copyFrom(rot)

//   //   this.body.position = new CANNON.Vec3(pos.x, pos.y, pos.z)
//   //   this.body.quaternion = new CANNON.Quaternion(rot.x, rot.y, rot.z, rot.w)

//   //   this.body.applyImpulse(
//   //     new CANNON.Vec3(
//   //       shootDirection.x * shootStrength,
//   //       shootDirection.y * shootStrength,
//   //       shootDirection.z * shootStrength
//   //     ),
//   //     new CANNON.Vec3(pos.x, pos.y, pos.z)
//   //   )
//   // }  
// }




