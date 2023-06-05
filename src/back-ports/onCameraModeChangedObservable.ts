import { CameraMode, CameraType, InputAction, PointerEventType, Transform, engine, inputSystem } from "@dcl/sdk/ecs"

const observablesCB: ((mode: CameraType) => void)[] = []

let initAlready = false

//https://sentry.io/answers/remove-specific-item-from-array/
function removeValue(value:any, index:any, arr:any) {
  // If the value at the current array index matches the specified value (2)
  if (value === 2) {
  // Removes the value from the original array
      arr.splice(index, 1);
      return true;
  }
  return false;
}

export function onOnCameraModeChangedObservableAdd(callback: (mode: CameraType) => void) {
  observablesCB.push(callback)
  return () => { observablesCB.filter(removeValue) }
}

function notifyCameraModeStateChanged(mode: CameraType) {
  //player went active
  for (let cb of observablesCB) {
    cb(mode)
  }
}


function cameraModeCheckSystem(dt: number) {
  let cameraEntity = CameraMode.get(engine.CameraEntity)

  if (!cameraEntity) return

  if (cameraEntity.mode !== previousCameraMode) {
    previousCameraMode = cameraEntity.mode
    if (cameraEntity.mode == CameraType.CT_THIRD_PERSON) {
      //console.log("The player is using the 3rd person camera")
      notifyCameraModeStateChanged(cameraEntity.mode) 
    } else {
      //console.log("The player is using the 1st person camera")
      notifyCameraModeStateChanged(cameraEntity.mode)
    }
  }
}

let previousCameraMode: CameraType

engine.addSystem(function cameraModeCheck() {
  
})
export function initOnCameraModeChangedObservable() {
  if(initAlready) return
  engine.addSystem(cameraModeCheckSystem)
  initAlready = true
}
