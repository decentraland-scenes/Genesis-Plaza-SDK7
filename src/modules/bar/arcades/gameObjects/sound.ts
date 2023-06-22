import { AudioSource, Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from '@dcl/sdk/math'


export class Sound {
  entity: Entity
  constructor(audioUrl: string, loop: boolean = false, position?: Vector3) {

    let _entity = engine.addEntity()
    this.entity = _entity

    AudioSource.create(this.entity, {audioClipUrl: audioUrl, loop: loop})

    Transform.create(this.entity)

    if (position) {
      Transform.getMutableOrNull(this.entity).position = position
  
    } else {
      Transform.getMutableOrNull(this.entity).parent = engine.PlayerEntity
    }
  }

  playAudioOnceAtPos(position: Vector3): void {
    Transform.getMutableOrNull(this.entity).position = position
    AudioSource.getMutableOrNull(this.entity).playing = true //NEED PLAY ONCE
  }

  playAudioAtPos(position: Vector3): void {
    Transform.getMutableOrNull(this.entity).position = position
    AudioSource.getMutableOrNull(this.entity).playing = true
  }
}
