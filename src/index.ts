import { engine, executeTask, Material, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import {  Vector3 } from '@dcl/sdk/math'
import { addBuildings } from './modules/buildings'
//import { placeDoors } from './modules/bar/doors'
import { barPlatforms } from './modules/platforms'
import { addCloudLobby } from './lobby/cloudLobby'
import * as allowedMediaHelper  from './utils/allowedMediaHelper'
import { lowerVolume, outOfBar, placeJukeBox, setBarMusicOff, setBarMusicOn } from './modules/bar/jukebox'
import { addRepeatTrigger } from './modules/Utils'
import { log } from './back-ports/backPorts'
import { coreBuildingOffset} from './lobby/resources/globals'
import { setupUi } from './ui'
import { placeDoors } from './modules/bar/doors'
import { lobbyCenter } from './lobby/resources/globals'
import { TeleportController } from './lobby/beamPortal'
import { initBarNpcs } from './modules/bar/npcs/barNpcs'


// export all the functions required to make the scene work
export * from '@dcl/sdk'

//load scene metadata
allowedMediaHelper.getAndSetSceneMetaData()

initBarNpcs()

placeJukeBox()
setBarMusicOn()



//// ADD CLOUD LOBBY

addCloudLobby()

//// ADD BUILDINGS

addBuildings()

placeDoors()
initBarNpcs()


///////// BAR STUFF

// BAR DOORS

/*
//TODO TAG:PORT-REIMPLEMENT-ME
placeDoors()
*/
barPlatforms()


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

utils.triggers.enableDebugDraw(true)

// proper bar interior
addRepeatTrigger(
  Vector3.create(160 - coreBuildingOffset.x, 50, 155 - coreBuildingOffset.z),
  Vector3.create(50, 102, 50),
  () => {
    setBarMusicOn()
    log('went in')
  },
  undefined,
  false,
  () => {
    outOfBar()
    //endArtistTalk() //TODO TAG:PORT-REIMPLEMENT-ME
    lowerVolume()
    log('mid distance')

    //setBarMusicOff()
  }
)

//outer perimeter
addRepeatTrigger(
  Vector3.create(160 - coreBuildingOffset.x, 30, 155 - coreBuildingOffset.z),
  Vector3.create(60, 60, 70),
  () => {
    lowerVolume()
    log('got closer')
  },
  undefined,
  false,
  () => {
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

setupUi()
