import { Entity, GltfContainer, PBGltfContainer, Transform, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import { Vector3 , Quaternion} from "@dcl/sdk/math"
import { colliderData } from "./colliderData"
import * as CANNON from 'cannon/build/cannon'
import { ballBounceMaterial } from "./physicsWorld"
import { realDistance } from "./utilFunctions"
import { hideOOB, showOOB } from "../../../ui"
import * as utils from "@dcl-sdk/utils"



export class Perimeter {
    radius:number
    center: Vector3
    perimeter:Entity
    perimeterColliderCount:number  = 16
    world: CANNON.World
    playerOOB:boolean = false

    constructor(_center: Vector3, _radius:number, _world:CANNON.World){

        this.world = _world
        const perimeterShape:PBGltfContainer =  {src:"models/basketball/perimeter.glb"}

        this.radius = _radius
        this.center = _center        

        //perimeter visualizer ring
        this.perimeter = engine.addEntity()
        Transform.create(this.perimeter, {
        position: Vector3.create(this.center.x, 0.22, this.center.z ),
        scale: Vector3.create(this.radius-1, 3, this.radius-1)
        })
        GltfContainer.create(this.perimeter, perimeterShape)
        VisibilityComponent.create(this.perimeter, {visible: false})


        // PERIMETER COLLIDERS FOR PHYSICS OBJECTS
        for(let i=0; i< this.perimeterColliderCount; i++){

            let angleStep = 360/this.perimeterColliderCount 
            let rot =  Quaternion.fromEulerDegrees(0,angleStep*i,0)
            let pos = Vector3.rotate(Vector3.Forward(), rot)
            pos = Vector3.scale(pos, this.radius)
            pos = Vector3.add(this.center, pos)
            pos.y = 10

            console.log("POS:" + pos)

            const pWall = new CANNON.Body({
                mass: 0, // mass == 0 makes the body static
                fixedRotation: true,
                quaternion: new CANNON.Quaternion(rot.x, rot.y, rot.z, rot.w),
                position: new CANNON.Vec3(pos.x, pos.y, pos.z)
            })
            pWall.addShape(new CANNON.Box(new CANNON.Vec3(5,20,0.5)))
            
            pWall.position.y = 0.2 // Thickness of ground base model
            pWall.material = ballBounceMaterial
            this.world.addBody(pWall)
        }
    }

    show(){
        VisibilityComponent.getMutable(this.perimeter).visible = true
      }
    hide(){
        VisibilityComponent.getMutable(this.perimeter).visible = false
    }

    update(dt:number, ballCarried:boolean){
        let playerDist = realDistance( Transform.get(engine.PlayerEntity).position, this.center)
       
        const pTransform = Transform.getMutable(this.perimeter)        
        

        if(ballCarried){
            if( playerDist <= this.radius-1){
                pTransform.scale.y = 2
                if(playerDist > this.radius/3){
                    pTransform.scale.y = 2+ (playerDist - this.radius / 3) / this.radius *30
                }  
            }        
        }
        
        if( !ballCarried){
           
            pTransform.scale.y -= 20*dt
            if(pTransform.scale.y < 0){
                pTransform.scale.y = 0
                this.hide()
            }
        }

        pTransform.rotation = Quaternion.multiply(pTransform.rotation, Quaternion.fromEulerDegrees(0,2*dt,0))
        

    }
    popUp(){
        this.show()
        const pTransform = Transform.getMutable(this.perimeter)   
        pTransform.scale.y = 10   
    }

    checkPerimeter():boolean{

        
        let playerDist = realDistance( Transform.get(engine.PlayerEntity).position, this.center)

        if( playerDist > this.radius-1){
            this.playerOOB = true
            return true
        }
        
        return false
    }
}