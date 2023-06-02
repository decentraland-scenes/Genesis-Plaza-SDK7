import * as utils from '@dcl-sdk/utils'
import { Entity, Transform, engine } from '@dcl/sdk/ecs';
import { Color3, Vector3 } from '@dcl/sdk/math';
import { INTERACT_WITH_NOTHING_LAYER } from '../lobby/resources/globals';

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Add a trigger that will be triggered each time
 */
export function addRepeatTrigger(
  position: Vector3,
  size: Vector3,
  onPlayerEnter: (entity: Entity) => void ,
  parent: Entity|undefined,
  show: boolean = false,
  onExit: (entity: Entity) => void 
) {
  

  const trigger = engine.addEntity()
  Transform.create(trigger,
    {
      position:position,
      parent:parent
    })
 
  utils.triggers.addTrigger(
    trigger
    , INTERACT_WITH_NOTHING_LAYER, utils.LAYER_1 
    ,[{position:Vector3.Zero(),scale:size,type:'box'}]
    ,onPlayerEnter
    ,onExit,  Color3.Yellow()
  ) 
}
