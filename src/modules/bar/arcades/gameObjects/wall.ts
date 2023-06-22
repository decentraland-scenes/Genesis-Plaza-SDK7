import { Entity, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Color4 } from "@dcl/sdk/math"
import { Vector3 } from '@dcl/sdk/math'
import { CollisionFlag } from "../gameLogic/collision"

export const WallFlag = engine.defineComponent('wallFlag', {})

export class Wall {
  public normal: Vector3
  entity: Entity

  constructor(position: Vector3, scale: Vector3, normal: Vector3, color: Color4, parent: Entity) {

    let _entity = engine.addEntity()
    this.entity = _entity
    this.normal = normal

    Transform.create(this.entity,{
      position: position,
      scale: scale,
      parent: parent
    })
    MeshRenderer.setBox(this.entity)
    Material.setPbrMaterial(this.entity, {
      albedoColor: color
    })

    WallFlag.create(this.entity)
    CollisionFlag.create(this.entity)
  }
}
