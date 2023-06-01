import { InputAction, PointerEventType, engine, inputSystem } from "@dcl/sdk/ecs"

let lastTriggered = Date.now()
let playerState:'idle'|'active' = 'active'

const IDLE_TIME = 60000 //1 minute goes idle

const observablesCB:((isIdle:boolean)=>void)[] = []

export function onIdleStateChangedObservableAdd(callback:(isIdle:boolean)=>void){
  observablesCB.push(callback)
}
function notifyIdleStateChanged(isIdle:boolean){
  //player went active
  for(let cb of observablesCB){
    cb(isIdle)
  }
}
function globalButtonSystem(dt:number){
  const triggered = inputSystem.isTriggered(InputAction.IA_POINTER,PointerEventType.PET_DOWN)
  const now = Date.now()
  const delta = (now  - lastTriggered)
  if(triggered){
    lastTriggered = now
    if(playerState === 'idle'){
      //went active
      notifyIdleStateChanged(false)
      playerState = 'active'
    }
  }else{
    if(playerState === 'active' && delta >= IDLE_TIME){
      //player went idle
      playerState = 'idle'
      //went idle
      notifyIdleStateChanged(true)
    }
  }
  //console.log('onIdleStateChangedObservableAdd',"IA_ANY.PET_DOWN.triggered",triggered,"lastTriggered",lastTriggered,"delta",delta,"IDLE_TIME",IDLE_TIME)
}
export function initIdleStateChangedObservable(){
  engine.addSystem(globalButtonSystem)
}