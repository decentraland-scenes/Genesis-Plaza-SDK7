import { GltfContainer, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { colliderData } from "./colliderData"
import * as CANNON from 'cannon/build/cannon'


export const ballBounceMaterial: CANNON.Material = new CANNON.Material(
    'translocatorMaterial',
  )   
  ballBounceMaterial.friction = 0.2
  ballBounceMaterial.restitution = 0.5

export class PhysicsWorldStatic {
    colliders:CANNON.Body[]
    world:CANNON.World

    constructor(_world:CANNON.World){
        
        this.colliders = []
        this.world = _world

        for(let i=0; i< colliderData.length; i++){
            colliderData[i].material = ballBounceMaterial
            this.world.addBody(colliderData[i])
        }

    }
}