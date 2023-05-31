import { Entity, GltfContainer, Transform, TransformType, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { colliderData } from "./colliderData"
import * as CANNON from 'cannon/build/cannon'

export class StaticColliderObject {
    collider:CANNON.Body   
    debugMesh:Entity  

    constructor(transform:TransformType, type:string){    
    
    this.debugMesh = engine.addEntity()

       this.collider= new CANNON.Body({
            mass: 0, // kg
            position: new CANNON.Vec3(
              0,0,0
            ), // m
            shape: new CANNON.Sphere(0.35),
           //shape: new CANNON.Box(new CANNON.Vec3(0.35, 0.35, 0.35)),
          })
    }
}