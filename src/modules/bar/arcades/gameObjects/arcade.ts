import { Vector3 } from "@dcl/sdk/math"
import { AudioSource, Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'


export class Arcade {
  entity: Entity
  knob: Entity

  constructor(modelUrl: string, transform: Transform, knob: boolean = true) {

    let _entity = engine.addEntity()
    this.entity = _entity

    GltfContainer.create(this.entity, {src: "models/core_building/knob.glb"})
    Transform.create(this.entity,{
      position: transform.position
    })

    if (knob) {
      this.knob = engine.addEntity()
      GltfContainer.create(this.knob, {src: "models/core_building/knob.glb"})
      Transform.create(this.knob,{
        position: Vector3.create(0, 1.383, -0.397),
        parent: this.entity
      })


      Transform.getMutableOrNull(this.knob) //rotate(Vector3.Left(), 11.6)
    }
  }
  controlStop() {
    if (this.knob.hasComponent(utils.KeepRotatingComponent)) this.knob.removeComponent(utils.KeepRotatingComponent)
  }
  controlLeft() {
    this.knob.addComponentOrReplace(new utils.KeepRotatingComponent(Quaternion.Euler(0, -90, 0)))
  }
  controlRight() {
    this.knob.addComponentOrReplace(new utils.KeepRotatingComponent(Quaternion.Euler(0, 90, 0)))
  }
}
