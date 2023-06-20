import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Color4 } from "@dcl/sdk/math"
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { CollisionFlag } from "../gameLogic/collision"

@Component("wallFlag")
export class WallFlag {}

export class Wall {
  public normal: Vector3
  entity: Entity

  constructor(transform: Transform, normal: Vector3, color: Color4, parent: Entity) {

    let _entity = engine.addEntity()
    this.entity = _entity
    this.normal = normal

    Transform.create(this.entity,{
      position: transform.position,
      parent: parent
    })
    MeshRenderer.setBox(this.entity)
    Material.setPbrMaterial(this.entity, {
      albedoColor: color
    })

    this.addComponent(new WallFlag())
    this.addComponent(new CollisionFlag())
  }
}
