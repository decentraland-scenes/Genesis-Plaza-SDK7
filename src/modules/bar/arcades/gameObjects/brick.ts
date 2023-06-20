import { CollisionFlag } from "../gameLogic/collision"
import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"

@Component("brickFlag")
export class BrickFlag {}

export class Brick {
  entity: Entity

  constructor(position: Vector3, scale: Vector3, color: Color4, parent: Entity) {

    let _entity = engine.addEntity()
    this.entity = _entity

    Transform.create(this.entity,{
      position: position,
      scale: scale,
      parent: parent
    })
    MeshRenderer.setBox(this.entity)
    Material.setPbrMaterial(this.entity, {
      albedoColor: color,
      emissiveColor: color,
      emissiveIntensity: 0.95
    })

    this.addComponent(new BrickFlag())
    this.addComponent(new CollisionFlag())
  }
}
