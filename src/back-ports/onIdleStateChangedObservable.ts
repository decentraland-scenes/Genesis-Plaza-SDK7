import { InputAction, PointerEventType, Transform, engine, inputSystem } from "@dcl/sdk/ecs"
import { CONFIG } from "../config"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { Observable } from '@dcl/sdk/internal/Observable'

let lastTriggered = Date.now()
let playerState: 'idle' | 'active' = 'active'
let lastRotation: Quaternion = Quaternion.create(0, 0, 0, 0)

const IDLE_TIME = 60000 //1 minute goes idle

export const onIdleStateChangedObservable = new Observable<boolean>((observer) => {
  onIdleStateChangedObservable.notifyObserver(observer, playerState === 'idle')
}) 

/*
export function onIdleStateChangedObservableAdd(callback: (isIdle: boolean) => void) {
  return onIdleStateChangedObservable.add(callback)
}*/
/*function notifyIdleStateChanged(isIdle: boolean) {
  //player went active
  for (let cb of observablesCB) {
    cb(isIdle)
  }
}*/

const inputList = [
  InputAction.IA_ANY,
  InputAction.IA_FORWARD,
  InputAction.IA_BACKWARD,
  InputAction.IA_JUMP,
  InputAction.IA_LEFT,
  InputAction.IA_RIGHT,
  InputAction.IA_SECONDARY,
  InputAction.IA_PRIMARY,
  InputAction.IA_POINTER,
  InputAction.IA_WALK
]
 
function globalButtonSystem(dt: number) {
  //fix me   IA_ANY not working

  let triggered = false
 
  if (CONFIG.USE_ANY_INPUT) {
    triggered = inputSystem.isTriggered(InputAction.IA_ANY, PointerEventType.PET_DOWN)
  } else {
    for (let index = 0; index < inputList.length; index++) {
      const input = inputList[index];
      if (inputSystem.isTriggered(input, PointerEventType.PET_DOWN))
        triggered = true
    }
  }

  if (!triggered) {
    const hasRotated = checkRotationInput()
    triggered = hasRotated
  }

  const now = Date.now()
  const delta = (now - lastTriggered)
  if (triggered) {
    lastTriggered = now
    if (playerState === 'idle') {
      //went active
      playerState = 'active'
      onIdleStateChangedObservable.notifyObservers(false)
      
    }
  } else {
    if (playerState === 'active' && delta >= IDLE_TIME) {
      //player went idle
      playerState = 'idle'
      //went idle
      onIdleStateChangedObservable.notifyObservers(true)
    }
  }
  //console.log('onIdleStateChangedObservableAdd',"IA_ANY.PET_DOWN.triggered",triggered,"lastTriggered",lastTriggered,"delta",delta,"IDLE_TIME",IDLE_TIME)
}
export function initIdleStateChangedObservable() {
  engine.addSystem(globalButtonSystem)
}

const EPSILON_TOLERANCE = .0001
function checkRotationInput(): boolean {
  const currentRotation = Transform.get(engine.CameraEntity).rotation
  let hasRotated = !equalsWithEpsilon(lastRotation, currentRotation,EPSILON_TOLERANCE)
  lastRotation = currentRotation
  return hasRotated
}


function equalsWithEpsilon(q1: Quaternion, q2: Quaternion, epsilon: number){
  //will do x,y,z for us
  if(!Vector3.equalsWithEpsilon(q1, q2, epsilon)) return false
  if( Math.abs(q1.w - q2.w) > epsilon) return false 
  return true
}
function isEqual(q1: Quaternion, q2: Quaternion): boolean {
  if (q1.x !== q2.x) return false
  if (q1.y !== q2.y) return false
  if (q1.z !== q2.z) return false
  if (q1.w !== q2.w) return false
  return true
}