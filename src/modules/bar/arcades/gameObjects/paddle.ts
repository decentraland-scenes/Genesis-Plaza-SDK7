import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Color4 } from "@dcl/sdk/math"
import { CollisionFlag } from "../gameLogic/collision"

@Component("paddleFlag")
export class PaddleFlag {}

export class Paddle{
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
      albedoColor: color
    })

    this.addComponent(new PaddleFlag())
    this.addComponent(new CollisionFlag())
  }
}
