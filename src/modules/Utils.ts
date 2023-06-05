import * as utils from '@dcl-sdk/utils'
import { Entity, Transform, TransformComponentExtended, TransformTypeWithOptionals, engine } from '@dcl/sdk/ecs';
import { Color3, Vector3 } from '@dcl/sdk/math';
import { TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS } from '../lobby/resources/globals';

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
  
  //if(!parent) parent = engine.RootEntity

  const trigger = engine.addEntity()
  const triggerParams:TransformTypeWithOptionals = {
    position:position
  }
  //only set parent if it's defined
  //BUG if you set parent even if it's undefined it breaks the layer logic somehow
  if(parent){  
    triggerParams.parent = parent
  }
  Transform.create(trigger,triggerParams)
 
  utils.triggers.addTrigger(
    trigger
    , TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS, utils.LAYER_1 
    ,[{position:Vector3.Zero(),scale:size,type:'box'}]
    ,onPlayerEnter
    ,onExit,  Color3.Yellow()
  ) 
}
