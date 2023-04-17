import { engine, executeTask, Material } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { addBuildings } from './modules/buildings'
//import { placeDoors } from './modules/bar/doors'
import { barPlatforms } from './modules/platforms'
import { addCloudLobby } from './lobby/cloudLobby'


// export all the functions required to make the scene work
export * from '@dcl/sdk'

//// ADD CLOUD LOBBY

addCloudLobby()

//// ADD BUILDINGS

addBuildings()

///////// BAR STUFF

// BAR DOORS

/*
//TODO TAG:PORT-REIMPLEMENT-ME
placeDoors()
*/
barPlatforms()

/*
//TODO TAG:PORT-REIMPLEMENT-ME

utils.setTimeout(20000, () => {
  if (!areNPCsAdded) {
    handleQuests()
    addBarNPCs()
  }
})

/// TRIGGER FOR STUFF OUTSIDE BAR

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(50, 25, 50), new Vector3(160, 10, 155)),
  {
    onCameraEnter: () => {
      //debugger
      //insideBar()
    },
    onCameraExit: async () => {
      await lowerVolume()
      outsideBar()
      log('stepped out')
    },
  }
)

// proper bar interior
addRepeatTrigger(
  new Vector3(160, 50, 155),
  new Vector3(50, 102, 50),
  () => {
    setBarMusicOn()
    log('went in')
  },
  null,
  false,
  () => {
    outOfBar()
    endArtistTalk()
    lowerVolume()
    log('mid distance')

    //setBarMusicOff()
  }
)

//outer perimeter
addRepeatTrigger(
  new Vector3(160, 30, 155),
  new Vector3(75, 60, 75),
  () => {
    lowerVolume()
    log('got closer')
  },
  null,
  false,
  () => {
    setBarMusicOff()
    log('got far')
  }
)

/// TRIGGERS AROUND PLAZA

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(2, 5, 305), new Vector3(0, 2, 160)),
  {
    onCameraEnter: () => {
      log('WEST BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(2, 5, 320), new Vector3(320, 2, 155)),
  {
    onCameraEnter: () => {
      log('EAST BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(320, 5, 2), new Vector3(165, 2, 0)),
  {
    onCameraEnter: () => {
      log('SOUTH BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(320, 5, 2), new Vector3(155, 2, 300)),
  {
    onCameraEnter: () => {
      log('NORTH BORDER')

      outsideBar()
    },
  }
)
*/