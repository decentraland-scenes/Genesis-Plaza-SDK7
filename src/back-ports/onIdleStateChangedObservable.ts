import { InputAction, PointerEventType, Transform, engine, inputSystem } from "@dcl/sdk/ecs"
import { CONFIG } from "../config"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

let lastTriggered = Date.now()
let playerState: 'idle' | 'active' = 'active'
let lastRotation: Quaternion = Quaternion.create(0, 0, 0, 0)

const IDLE_TIME = 60000 //1 minute goes idle

const observablesCB: ((isIdle: boolean) => void)[] = []

export function onIdleStateChangedObservableAdd(callback: (isIdle: boolean) => void) {
  observablesCB.push(callback)
}
function notifyIdleStateChanged(isIdle: boolean) {
  //player went active
  for (let cb of observablesCB) {
    cb(isIdle)
  }
}

const inputList = [
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

  const hasRotated = checkRotationInput()

  if (!triggered) {
    triggered = hasRotated
  }

  const now = Date.now()
  const delta = (now - lastTriggered)
  if (triggered) {
    lastTriggered = now
    if (playerState === 'idle') {
      //went active
      notifyIdleStateChanged(false)
      playerState = 'active'
    }
  } else {
    if (playerState === 'active' && delta >= IDLE_TIME) {
      //player went idle
      playerState = 'idle'
      //went idle
      notifyIdleStateChanged(true)
    }
  }
  //console.log('onIdleStateChangedObservableAdd',"IA_ANY.PET_DOWN.triggered",triggered,"lastTriggered",lastTriggered,"delta",delta,"IDLE_TIME",IDLE_TIME)
}
export function initIdleStateChangedObservable() {
  engine.addSystem(globalButtonSystem)
}

function checkRotationInput(): boolean {
  const currentRotation = Transform.get(engine.CameraEntity).rotation
  let hasRotated = isEqual(lastRotation, currentRotation)
  lastRotation = currentRotation
  return hasRotated
}

function isEqual(q1: Quaternion, q2: Quaternion): boolean {
  if (q1.x !== q2.x) return false
  if (q1.y !== q2.y) return false
  if (q1.z !== q2.z) return false
  if (q1.w !== q2.w) return false
  return true
}