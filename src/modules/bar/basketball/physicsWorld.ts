import { GltfContainer, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { colliderData } from "./colliderData"
import * as CANNON from 'cannon/build/cannon'

export class PhysicsWorldStatic {
    colliders:CANNON.Body[]
    world:CANNON.World

    constructor(_world:CANNON.World){
        
        this.colliders = []
        this.world = _world

        for(let i=0; i< colliderData.length; i++){
            this.world.addBody(colliderData[i])
        }

    }
}