import { Animator, AudioSource, AudioStream, Entity, GltfContainer, InputAction, Material, MeshRenderer, PBAudioStream, TextShape, Transform, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { lobbyCenter } from './resources/globals'


const beam = engine.addEntity()
Transform.create(beam,{
    position: Vector3.create(lobbyCenter.x, lobbyCenter.y, lobbyCenter.z)
})
GltfContainer.createOrReplace(beam, {
    src: "models/lobby/beam.glb"
})