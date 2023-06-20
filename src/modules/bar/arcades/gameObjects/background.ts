import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Color4 } from "@dcl/sdk/math"

export class Background  {
  entity: Entity

  constructor(transform: Transform, parent: Entity) {

    let _entity = engine.addEntity()
    this.entity = _entity

    Transform.create(this.entity,{
      position: transform.position,
      parent: parent
    })
    MeshRenderer.setBox(this.entity)
    Material.setPbrMaterial(this.entity, {
      albedoColor: Color4.Black(),
      roughness: 0.9
    })
  }
}
