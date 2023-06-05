import * as utils from '@dcl-sdk/utils'
import { Color3, Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import { addBuildings } from './modules/buildings'
//import { placeDoors } from './modules/bar/doors'
import { barPlatforms } from './modules/platforms'
import { addCloudLobby } from './lobby/cloudLobby'
import * as allowedMediaHelper from './utils/allowedMediaHelper'
import { lowerVolume, outOfBar, placeJukeBox, setBarMusicOff, setBarMusicOn } from './modules/bar/jukebox'
import { addRepeatTrigger } from './modules/Utils'
import { log } from './back-ports/backPorts'
import { TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS, coreBuildingOffset } from './lobby/resources/globals'
import { initBarNpcs } from './modules/bar/npcs/barNpcs'
import { setupUi } from './ui'
import { placeDoors } from './modules/bar/doors'
import { getRealm, GetRealmResponse } from "~system/Runtime"
import { addTVPanels } from './modules/bar/panels'
import { initRegistery, REGISTRY } from './registry'
import { initConfig } from './config'
import { initDialogs as initWaitingDialog } from './modules/RemoteNpcs/waitingDialog'
import { LobbyScene, disconnectHost } from './lobby-scene/lobbyScene'
import { Room } from 'colyseus.js'
import { onNpcRoomConnect } from './connection/onConnect'
import "./polyfill/delcares";
import { PhysicsManager } from './modules/bar/basketball/ball'
import { initIdleStateChangedObservable, onIdleStateChangedObservableAdd } from './back-ports/onIdleStateChangedObservable'
import { Transform, engine,Entity } from '@dcl/ecs'
import { addAnalytics } from './analytics'
import { initOnCameraModeChangedObservable } from './back-ports/onCameraModeChangedObservable'
import { initSoundsAttachedToPlayerHandler } from './modules/soundsAttachedToPlayer'

// export all the functions required to make the scene work
export * from '@dcl/sdk'
const FILE_NAME = 'game'

//load scene metadata
allowedMediaHelper.getAndSetSceneMetaData()


initRegistery()
initConfig()
addAnalytics()

initOnCameraModeChangedObservable()

initSoundsAttachedToPlayerHandler()

placeJukeBox()
//setBarMusicOn()



//// ADD CLOUD LOBBY

addCloudLobby()

//// ADD BUILDINGS

addBuildings()

placeDoors()

///////// BAR STUFF

// BAR DOORS

/*
//TODO TAG:PORT-REIMPLEMENT-ME
placeDoors()
*/
barPlatforms()

// ADD EVENT CARDS TO BAR
addTVPanels()

// ADD BASKETBALL GAME

let physicsManager = new PhysicsManager(5)




//TODO TAG:PORT-REIMPLEMENT-ME

//TODO TAG:PORT-REIMPLEMENT-ME
/*
utils.setTimeout(20000, () => {
  if (!areNPCsAdded) {
    handleQuests()
    addBarNPCs()
  }
})
*/
//TODO TAG:PORT-REIMPLEMENT-ME
/// TRIGGER FOR STUFF OUTSIDE BAR
/*
utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(Vector3.create(50, 25, 50), Vector3.create(160, 10, 155)),
  {
    onCameraEnter: () => {
      //debugger
      //insideBar()
    },
    onCameraExit: async () => {
      await lowerVolume()
      //outsideBar()////TODO TAG:PORT-REIMPLEMENT-ME
      log('stepped out')
    },
  }
)
*/
getRealm({}).then(
  (value: GetRealmResponse) => {
    if (value.realmInfo?.isPreview) {
      console.log("index.ts", "utils.triggers.enableDebugDraw", "getRealm is preview, activating debug draw")
      utils.triggers.enableDebugDraw(true)
    } else {
      console.log("index.ts", "utils.triggers.enableDebugDraw", "getRealm is NOT preview, NO debug draw")
    }
  }
)

initIdleStateChangedObservable()
onIdleStateChangedObservableAdd((isIdle: boolean) => {
  if (isIdle) {
    console.log("index.ts", "onIdleStateChangedObservableAdd", "player is idle")
  } else {
    console.log("index.ts", "onIdleStateChangedObservableAdd", "player is active")
  }
})

let barCenter = engine.addEntity()
Transform.create(barCenter, {
  position: Vector3.create(32, 0, 38)
})
utils.triggers.addTrigger(
  barCenter, 
  TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS,
  utils.LAYER_1,
  [ 
    {
      type: 'box',
      scale: {
        x: 57,
        y: 25,
        z: 54
      }
    }
  ],
  (other) => {//onEnter
    console.log("lazyLoading", "OnEnter", "Other", other, "Player", engine.PlayerEntity, "& Cam", engine.CameraEntity);
    if(other === engine.PlayerEntity || other === engine.CameraEntity)
      insideBar()
  },
  (entity: Entity) => {//onExit
    console.log("index.ts", "trigger.bar.exit","triggerParent",barCenter,"entityInteracting", entity)
    exitBar()
  },
  Color3.Red()
)

// proper bar interior
console.log("index.ts", "trigger.bar2???.created","triggerParent",undefined)
addRepeatTrigger(
  Vector3.create(160 - coreBuildingOffset.x, 50, 152 - coreBuildingOffset.z),
  Vector3.create(50, 102, 50),
  (entity: Entity) => {
    console.log("index.ts", "trigger.bar2???.enter","triggerParent",undefined,"entityInteracting", entity)
    setBarMusicOn()
    log('went in') 
  },
  undefined,
  false,
  (entity: Entity) => {
    console.log("index.ts", "trigger.bar2???.exit","triggerParent",undefined,"entityInteracting", entity)
    //endArtistTalk() //TODO TAG:PORT-REIMPLEMENT-ME
    outOfBar()
    lowerVolume()
    log('mid distance')
  }
)

//outer perimeter
console.log("index.ts", "trigger.bar.outerparim.enter","triggerParent",undefined)
addRepeatTrigger(
  Vector3.create(160 - coreBuildingOffset.x, 30, 155 - coreBuildingOffset.z),
  Vector3.create(60, 60, 70),
  (entity: Entity) => {
    console.log("index.ts", "trigger.bar.outerparim.enter","triggerParent",undefined,"entityInteracting", entity)
  },
  undefined,
  false,
  (entity: Entity) => {
    console.log("index.ts", "trigger.bar.outerparim.exit","triggerParent",undefined,"entityInteracting", entity)
    setBarMusicOff()
    log('got far')
  }
)

/// TRIGGERS AROUND PLAZA
/*
utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(Vector3.create(2, 5, 305), Vector3.create(0, 2, 160)),
  {
    onCameraEnter: () => {
      log('WEST BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(Vector3.create(2, 5, 320), Vector3.create(320, 2, 155)),
  {
    onCameraEnter: () => {
      log('EAST BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(Vector3.create(320, 5, 2), Vector3.create(165, 2, 0)),
  {
    onCameraEnter: () => {
      log('SOUTH BORDER')
      outsideBar()
    },
  } 
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(Vector3.create(320, 5, 2), Vector3.create(155, 2, 300)),
  {
    onCameraEnter: () => {
      log('NORTH BORDER')

      outsideBar()
    },
  }
)
*/

/*
let trigger = engine.addEntity()
Transform.create(trigger)
utils.triggers.addTrigger(trigger, utils.NO_LAYERS, utils.NO_LAYERS, 
  [{type: "box", position: Vector3.create(6, 4.5, 6), scale:Vector3.create(6, 4.5, 6)}],
  function(){
  
    
    console.log("entered in trigger")
    
    
  },
  function(){
    
  },
  Color3.Green()
)*/


let areNpcsAdded: boolean = false
function insideBar() {
  const METHOD_NAME = 'insideBar'
  log("lazyLoading",FILE_NAME, METHOD_NAME, "Player Enter")

  if (!areNpcsAdded) {
    //Quests
    initWaitingDialog()

    REGISTRY.lobbyScene = new LobbyScene()
    REGISTRY.onConnectActions = (room: Room<any>, eventName: string) => {
      //npcConn.onNpcRoomConnect(room)
      onNpcRoomConnect(room)
    }

    initBarNpcs()

    areNpcsAdded = true
  }
}

function exitBar() {
  const METHOD_NAME = 'exitBar'
  log(FILE_NAME, METHOD_NAME, "Player Exit")
}

setupUi()
