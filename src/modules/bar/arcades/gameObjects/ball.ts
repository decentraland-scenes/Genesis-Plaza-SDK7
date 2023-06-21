import { Entity, MeshRenderer, MeshCollider, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

@Component("ballFlag")
export class BallFlag {}

export class Ball {
  entity: Entity
  public direction: Vector3

  constructor(position: Vector3, scale: Vector3, direction: Vector3, parent: Entity) {
    let _entity = engine.addEntity()
    this.entity = _entity
    this.direction = direction
    
    Transform.create(this.entity,{
      position: position,
      scale: scale,
      parent: parent
    })
    this.addComponent(new BallFlag())
    MeshRenderer.setBox(this.entity)
  }
}
