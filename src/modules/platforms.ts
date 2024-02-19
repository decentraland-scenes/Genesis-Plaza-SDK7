import * as utils from '@dcl-sdk/utils'
import { Animator, Entity, GltfContainer, PBAnimator, PBGltfContainer, Transform, TransformTypeWithOptionals, engine } from '@dcl/sdk/ecs'
import { sceneMessageBus } from './serverHandler'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { log } from '../back-ports/backPorts'
import { barCenter, coreBuildingOffset, lobbyCenter } from '../lobby/resources/globals'
import { ParcelCountX } from '../lobby/resources/globals'
import { ParcelCountZ } from '../lobby/resources/globals'
/*import * as utils from '@dcl/ecs-scene-utils'
import { addArcades } from './arcades/arcades'

import { addPunchBag } from './interactiveItems'
*/
/// Reusable class for all platforms

//TODO TAG:PORT-REIMPLEMENT-ME
export class Platform  {
  entity:Entity
  animationName: string
  delayId?: number

  constructor(
    model: PBGltfContainer,
    platformPos: TransformTypeWithOptionals,
    triggerPos: TransformTypeWithOptionals,
    triggerScale: Vector3,
    animation: string,
    messageBusHandle: string,
    extraAction?: () => void
  ) {
    this.entity = engine.addEntity()

    GltfContainer.create(this.entity,model)
    Transform.create(this.entity,platformPos)
    

    
    this.animationName = animation

     Animator.create(this.entity, {
      states:[{
          name: 'animation',
          clip: animation,
          playing: false,
          loop: false
        }
      ]
    })
   
  

    const triggerEntity = engine.addEntity()
    Transform.create(triggerEntity, {})

    utils.triggers.addTrigger(triggerEntity, utils.NO_LAYERS, utils.LAYER_1, 
      [{type: "box",position: triggerPos.position , scale: triggerScale}],
      ()=>{ 
        sceneMessageBus.emit(messageBusHandle, {})
        if (extraAction) {
          extraAction()
        }
      },
      ()=>{ 
      },
      Color3.Blue()
    )

 /*
    const triggerEntity = engine.addEntity()
    triggerEntity.addComponent(new Transform(triggerPos))

    let triggerBox = new utils.TriggerBoxShape(triggerScale, Vector3.Zero())

    triggerEntity.addComponent(
      new utils.TriggerComponent(
        triggerBox, //shape
        {
          onCameraEnter: () => {
            //log('triggered platform')
            sceneMessageBus.emit(messageBusHandle, {})
            if (extraAction) {
              extraAction()
            }
          },
        }
      )
    )
    engine.addEntity(triggerEntity)
    */
  }

  public activate(): void {
    Animator.getClip(this.entity,this.animationName).playing = true
  }
}

//not exporting as these are all outside models
/*
function placePlatforms() {
  //ARTICHOKE ELEVATOR

  let artichoke_Elevator = new Platform(
    {src:"models/L'architoque_Elevator.glb"},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(51, 3, 39.5) },
    Vector3.create(4, 4, 4),
    "L'architoque_Elevator",
    'artichokeElevatorActivated'
  )

  // WHALE ELEVATOR

  let whale_Elevator = new Platform(
    {src:'models/TheWhale_Action_Elevator.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(188.5, 3, 236) },
    Vector3.create(7, 3, 7),
    'WhaleElevator_Action',
    'whaleElevatorActivated'
  )

  //// MOON TOWER ELEVATOR

  let moonTower_Elevator = new Platform(
    {src:'models/MoonTower_Action_Elevator.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(48.6, 2.4, 116.6) },
    Vector3.create(7, 3, 7),
    'MoonTower_Action_Elevator',
    'moonElevatorActivated'
  )

  ///////  SHELL ELEVATOR

  let shell_elevator = new Platform(
    {src:'models/shell_elevator.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    {
      position: Vector3.create(300.5, 11.3, 120),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
    },
    Vector3.create(7, 2, 6),
    'TheShell_ElevatorAction',
    'shellElevatorActivated'
  )

  ///////  TRAIN ELEVATOR

  let train_elevator = new Platform(
    {src:'models/train_elevator.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    {
      position: Vector3.create(229.7, 1.3, 143),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
    },
    Vector3.create(2, 2, 2),
    'TrainElevator_Action',
    'trainElevatorActivated'
  )

  //// BALOOON

  let ballonIsFlying: boolean = false

  let balloon = new Platform(
    {src:'models/balloon.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    {
      position: Vector3.create(80, 2, 181),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
    },
    Vector3.create(2, 1, 2),
    'Balloon_Action',
    'balloonActivated'
  )

  // TRAIN

  let trainIsMoving: boolean = false

  let train = new Platform(
    {src:'models/train.glb'},
    { rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    {
      position: Vector3.create(234.5, 7, 143),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
    },
    Vector3.create(2, 2, 6),
    'Train_Action',
    'trainActivated'
  )
    
  sceneMessageBus.on('artichokeElevatorActivated', (e) => {
    artichoke_Elevator.activate()
    log('artichoke elevator')
  })

  sceneMessageBus.on('whaleElevatorActivated', (e) => {
    whale_Elevator.activate()
    log('whale elevator')
  })

  sceneMessageBus.on('moonElevatorActivated', (e) => {
    moonTower_Elevator.activate()
    log('moon tower elevator')
  })

  sceneMessageBus.on('shellElevatorActivated', (e) => {
    shell_elevator.activate()
    log('shell elevator')
  })

  sceneMessageBus.on('trainElevatorActivated', (e) => {
    train_elevator.activate()
    log('train elevator')
  })

  sceneMessageBus.on('balloonActivated', (e) => {
    if (ballonIsFlying) {
      log('baloon was already in flight')
      return
    }
    ballonIsFlying = true
    balloon.activate()
    
    if(balloon.delayId) utils.timers.clearTimeout( balloon.delayId )
    balloon.delayId = utils.timers.setTimeout( () => {
        ballonIsFlying = false
      },
      150 * 1000
    )
    
  })

  sceneMessageBus.on('trainActivated', (e) => {
    if (trainIsMoving) {
      log('train was already in movement')
      return
    }

    trainIsMoving = true
    train.activate()

    if(train.delayId) utils.timers.clearTimeout( train.delayId )
    train.delayId = utils.timers.setTimeout( () => {
      trainIsMoving = false
      },
      100 * 1000
    )

  })
  
}*/

export let upstairsLoaded: boolean = false

export function barPlatforms() {
  //BAR PLATFORMS

  let barElevatorLeft = new Platform(
    //{src:'models/core_building/Elevator_Left.glb'},
    {src:'models/core_building/elevator_left_cutout.glb'},
    { 
      position: Vector3.create(barCenter.x,0,barCenter.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0)
      ,scale: Vector3.create(1,1,1) },
    { position: Vector3.create(147 - coreBuildingOffset.x, 2.5, 151.5 - coreBuildingOffset.z) },
    Vector3.create(3.5, 4, 3.5),
    'Elevator_Left_Up',
    'elevatorLeft',
    () => {
      upstairsBar()
    }
  )

  let barElevatorRight = new Platform(
    //{src:'models/core_building/Elevator_Right.glb'},
    {src:'models/core_building/elevator_right_cutout.glb'},
    { 
      //position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      position: Vector3.create(barCenter.x,0,barCenter.z), 
      rotation: Quaternion.fromEulerDegrees(0, 180, 0) },
    { position: Vector3.create(173 - coreBuildingOffset.x, 2.5, 151.5- coreBuildingOffset.z) },
    Vector3.create(3.5, 4, 3.5),
    'Elevator_Right_Up',
    'elevatorRight',
    () => {
      upstairsBar()
    }
  )

  
  //TODO TAG:PORT-REIMPLEMENT-ME
  sceneMessageBus.on('elevatorLeft', (e) => {
    barElevatorLeft.activate()
  })

  sceneMessageBus.on('elevatorRight', (e) => {
    barElevatorRight.activate()
  })
  
}

export function upstairsBar() {
  if (upstairsLoaded) return

  upstairsLoaded = true

  //TODO TAG:PORT-REIMPLEMENT-ME
  //addArcades()
  //addPunchBag()
}
