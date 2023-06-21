import { Entity, MeshRenderer, Schemas, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

export type BallFlagType = {direction: Vector3}
export const BallFlag = engine.defineComponent('ballFlag', {direction: Schemas.Vector3})

export class Ball {
  entity: Entity

  constructor(position: Vector3, scale: Vector3, direction: Vector3, parent: Entity) {
    let _entity = engine.addEntity()
    this.entity = _entity
    
    Transform.create(this.entity,{
      position: position,
      scale: scale,
      parent: parent
    })
    BallFlag.create(this.entity, {direction: direction})
    MeshRenderer.setBox(this.entity)
  }
}
