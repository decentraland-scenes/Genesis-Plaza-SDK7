import { AudioSource, Schemas, engine } from '@dcl/sdk/ecs'

// We use this component to track and group all the cubes.
// engine.getEntitiesWith(Cube)
//export const Cube = engine.defineComponent('cube-id', {})

export type PBAudioSourceAttachedToPlayer = {
  id: string,//
  //volume based on view point
  /** the audio volume (default: 1.0). */
  //volume?: number | undefined;
  firstPersonVolume: number,
  thirdPersonVolume: number
}
//could also be useful for when to adjust sound based on view point
export const AudioSourceAttachedToPlayer = engine.defineComponent('dcl.genesis.plaza.AudioSourceAttachedToPlayer', {
  //id/name of sound
  id: Schemas.String,//
  //volume based on view point
  /** the audio volume (default: 1.0). */
  //volume?: number | undefined;
  firstPersonVolume: Schemas.Number,
  thirdPersonVolume: Schemas.Number
})


  