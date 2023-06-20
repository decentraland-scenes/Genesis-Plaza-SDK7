import { CollisionFlag } from "../gameLogic/collision"
import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Color4 } from "@dcl/sdk/math"

@Component("brickFlag")
export class BrickFlag {}

export class Brick {
  entity: Entity

  constructor(transform: Transform, color: Color4, parent: Entity) {

    let _entity = engine.addEntity()
    this.entity = _entity

    Transform.create(this.entity,{
      position: transform.position,
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
