import { AudioSource, Entity, GltfContainer, MeshRenderer, PBGltfContainer, Transform, VisibilityComponent, engine } from "@dcl/sdk/ecs";
import * as utils from "@dcl-sdk/utils"
import { Color3, Vector3, Quaternion } from "@dcl/sdk/math";
import * as CANNON from 'cannon/build/cannon'
import { ToRadian, flatDistance } from "./utilFunctions";
import { scoreSource, scoreVolume } from "./sounds";
import { hoopContactMaterial } from "./physicsWorld";
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES } from '../../stats/AnalyticsConfig'
import { trackAction } from "../../stats/analyticsComponents";
import { scoreDisplay } from "./basketballUI";

const hoopShape:PBGltfContainer =  {src:"models/basketball/basketball_hoop.glb"}
const sparksShape:PBGltfContainer =  {src:"models/basketball/sparks.glb"}
const glowRingsShape:PBGltfContainer =  {src:"models/basketball/glow_rings.glb"}

export class BasketballHoop {
    hoopEntity:Entity
    world:CANNON.World
    bottomLock:Entity
    cannonLock:CANNON.Body
    sparks:Entity
    glowRings:Entity   
    radius:number = 1
    
  
    constructor(world:CANNON.World, position:Vector3, _rotation:Quaternion){
      this.world = world
  
     
      this.hoopEntity = engine.addEntity()
      Transform.create(this.hoopEntity , {
          position: Vector3.create(position.x, position.y, position.z),
          rotation: _rotation
      })
      GltfContainer.create(this.hoopEntity , hoopShape)
      VisibilityComponent.create(this.hoopEntity , {visible:true})   
  
      this.bottomLock = engine.addEntity()
      Transform.create(this.bottomLock, {
        position: Vector3.create(0 ,-0.6, 0),
        scale: Vector3.create(1.8,1,1.8),
        parent: this.hoopEntity
      })
      MeshRenderer.setBox(this.bottomLock)
      VisibilityComponent.create(this.bottomLock,{visible: false})
  
      let sides = 8
      let angleStep = 360/sides
     
      let side = 2 * this.radius * Math.tan( ToRadian(180 / sides))
      const hoopPos = Transform.get(this.hoopEntity).position
      const lockTransform = Transform.get(this.bottomLock)
  
      // hoop ring colliders
      for (let i = 0; i< sides; i++){
        
        let rotation = Quaternion.fromEulerDegrees(0,i*angleStep,0)
        rotation = Quaternion.multiply(rotation, _rotation)
        let pos = Vector3.rotate(Vector3.Forward(), rotation)
        pos = Vector3.scale(pos, this.radius)
  
        //debug boxes
        // let collider = engine.addEntity()
        // Transform.create(collider, {
        //   position: pos,
        //   scale: Vector3.create(side,0.1,0.1),
        //   rotation: rotation,
        //   parent:this.hoopEntity
        // })
        // MeshRenderer.setBox(collider)
       
        
  
        let cannonBody = new CANNON.Body({
          mass: 0, // kg
          position: new CANNON.Vec3(
            hoopPos.x + pos.x,
            hoopPos.y + pos.y,
            hoopPos.z + pos.z
          ), // m
          quaternion: new CANNON.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
          shape: new CANNON.Box( new CANNON.Vec3(side/2, 0.1/2, 0.1/2)),
          fixedRotation:true
          
         //shape: new CANNON.Box(new CANNON.Vec3(0.35, 0.35, 0.35)),
        })
        this.world.addBody(cannonBody)
  
      }
      // back wall of hoop
      let wallOffset = Vector3.create(0, 0.821, -1.476)

      wallOffset = Vector3.rotate(wallOffset, _rotation)

      let cannonWall = new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(
          hoopPos.x + wallOffset.x,
          hoopPos.y + wallOffset.y,
          hoopPos.z + wallOffset.z 
        ), // m     
        quaternion: new CANNON.Quaternion(_rotation.x, _rotation.y, _rotation.z, _rotation.w),
        shape: new CANNON.Box( new CANNON.Vec3(3.3 /2, 2/2, 0.1/2)),
        fixedRotation:true
        
       //shape: new CANNON.Box(new CANNON.Vec3(0.35, 0.35, 0.35)),
      })
      cannonWall.material = hoopContactMaterial

      this.world.addBody(cannonWall)
    
      // bottom blocker preventing scoring from bottom-up
      let lockOffset = Vector3.create( lockTransform.position.x,  lockTransform.position.y,  lockTransform.position.z)

      lockOffset = Vector3.rotate(lockOffset, _rotation)

      this.cannonLock = new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(
          hoopPos.x + lockOffset.x ,
          hoopPos.y + lockOffset.y,
          hoopPos.z + lockOffset.z
        ), // m     
        quaternion: new CANNON.Quaternion(_rotation.x, _rotation.y, _rotation.z, _rotation.w),
        shape: new CANNON.Box( new CANNON.Vec3(lockTransform.scale.x /2, lockTransform.scale.y/2, lockTransform.scale.z/2)),
        fixedRotation:true
        
       //shape: new CANNON.Box(new CANNON.Vec3(0.35, 0.35, 0.35)),
      })
      this.world.addBody(this.cannonLock)
  
      // ball triggers the score zone
      utils.triggers.addTrigger(this.hoopEntity ,utils.LAYER_2, utils.LAYER_2, 
        [{type: "box", position: Vector3.create(0,-0.4,0), scale: Vector3.create(0.5, 0.2, 0.5)}],
        ()=>{     
         // console.log("SCORE!!!!")
         this.disableLock()
         scoreDisplay()
         this.startCelebration()

        },
        undefined,
        Color3.Blue()
      )
      utils.triggers.enableTrigger(this.hoopEntity ,true)

      this.sparks = engine.addEntity()
      Transform.create(this.sparks, {
        position: Vector3.create( 0, 0.63, -1.6),
        scale: Vector3.Zero(),
        parent: this.hoopEntity
      })
      GltfContainer.create(this.sparks, sparksShape)

      this.glowRings = engine.addEntity()
      Transform.create(this.glowRings, {
        position: Vector3.create( 0, 0 ,0),
        scale: Vector3.Zero(),
        parent: this.hoopEntity
      })
      GltfContainer.create(this.glowRings, glowRingsShape)

      
    }
    
    disableLock(){
      this.world.remove(this.cannonLock)
      //VisibilityComponent.getMutable(this.bottomLock).visible = false
    }
    enableLock(){    
      this.world.addBody(this.cannonLock)
      //VisibilityComponent.getMutable(this.bottomLock).visible = true
    }
    startCelebration(){
      const transform = Transform.getMutable(this.sparks)
      transform.scale = Vector3.One()    

      trackAction(this.hoopEntity, "score")

      AudioSource.createOrReplace(this.hoopEntity, {
        audioClipUrl: scoreSource,
        playing: true,
        loop:false,
        volume: scoreVolume
      })
      utils.tweens.startScaling(this.glowRings, Vector3.Zero(), Vector3.One(),0.5, utils.InterpolationType.EASEINSINE)
      utils.timers.setTimeout(()=>{        
        utils.tweens.stopScaling(this.glowRings)
        const transformRings = Transform.getMutable(this.glowRings)
        transformRings.scale = Vector3.Zero()
      }, 500)

      utils.timers.setTimeout(()=>{
        const transform = Transform.getMutable(this.sparks)
        transform.scale = Vector3.Zero()      
      }, 2000)
      
    }
    
    
  
  }


