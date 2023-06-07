import { GltfContainer, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { colliderData } from "./colliderData"
import * as CANNON from 'cannon/build/cannon'


export const ballBounceMaterial: CANNON.Material = new CANNON.Material(
    'translocatorMaterial',
  )   
  ballBounceMaterial.friction = 0.2
  ballBounceMaterial.restitution = 0.5

export const hoopContactMaterial: CANNON.Material = new CANNON.Material(
    'hoopContactMaterial',
  )   
  hoopContactMaterial.friction = 0.2
  hoopContactMaterial.restitution = 0.1

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
        groundBody.position.y = 0.23 // Thickness of ground base model
        groundBody.material = ballBounceMaterial
        this.world.addBody(groundBody)
    

    }
}