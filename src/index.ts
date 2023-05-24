import { engine, executeTask, Material, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Color3, Color4, Vector3 } from '@dcl/sdk/math'
import { addBuildings } from './modules/buildings'
//import { placeDoors } from './modules/bar/doors'
import { barPlatforms } from './modules/platforms'
import { addCloudLobby } from './lobby/cloudLobby'
import * as allowedMediaHelper  from './utils/allowedMediaHelper'
import { lowerVolume, outOfBar, placeJukeBox, setBarMusicOff, setBarMusicOn } from './modules/bar/jukebox'
import { addRepeatTrigger } from './modules/Utils'
import { log } from './back-ports/backPorts'
import { lobbyCenter } from './lobby/resources/globals'
import { TeleportController } from './lobby/beamPortal'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from './modules/stats/AnalyticsConfig'
import { trackAction } from './modules/stats/analyticsComponents'
import { TrackingElement } from './modules/stats/analyticsComponents'
import { trackStart } from './modules/stats/analyticsComponents'
import { trackEnd } from './modules/stats/analyticsComponents'
import { initBarNpcs } from './modules/bar/npcs/barNpcs'


// export all the functions required to make the scene work
export * from '@dcl/sdk'

//load scene metadata
allowedMediaHelper.getAndSetSceneMetaData()

placeJukeBox()
setBarMusicOn()



//// ADD CLOUD LOBBY

addCloudLobby()

//// ADD BUILDINGS

addBuildings()
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
  Vector3.create(160, 50, 155),
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
  Vector3.create(160, 30, 155),
  Vector3.create(75, 60, 75),
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
      )
*/

//#region analytics

const cloudAnalyticsTrigger = engine.addEntity()
const cloudAnalyticsTriggerPosition = Vector3.create(160, 105, 150)
const cloudAnalyticsTriggerScale = Vector3.create(50, 6, 50)
Transform.create(cloudAnalyticsTrigger, {})

TrackingElement.create(cloudAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.cloud,
})

utils.triggers.addTrigger(cloudAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: cloudAnalyticsTriggerPosition, scale: cloudAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "Cloud_Region", "onEnter")
    trackStart(cloudAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "Cloud_Region", "onExit")
    trackEnd(cloudAnalyticsTrigger)
  },
  Color3.Yellow()
)

const sliderInCloudAnalyticsTrigger = engine.addEntity()
const sliderInCloudAnalyticsTriggerPosition = Vector3.create(161, 105, 159)
const sliderInCloudAnalyticsTriggerScale = Vector3.create(30, 3, 10)
Transform.create(sliderInCloudAnalyticsTrigger, {})

TrackingElement.create(sliderInCloudAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.eventsSlider,
})

utils.triggers.addTrigger(sliderInCloudAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: sliderInCloudAnalyticsTriggerPosition, scale: sliderInCloudAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "SliderArea_Region", "onEnter")
    trackStart(sliderInCloudAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "SliderArea_Region", "onExit")
    trackEnd(sliderInCloudAnalyticsTrigger)
  },
  Color3.Blue()
)

const barAnalyticsTrigger = engine.addEntity()
const barAnalyticsTriggerPosition = Vector3.create(160, 1, 150)
const barAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(barAnalyticsTrigger, {})

TrackingElement.create(barAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.bar,
})

utils.triggers.addTrigger(barAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: barAnalyticsTriggerPosition, scale: barAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "Bar_Region", "onEnter")
    trackStart(barAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "Bar_Region", "onExit")
    trackEnd(barAnalyticsTrigger)
  },
  Color3.Red()
)


const agoraAnalyticsTrigger = engine.addEntity()
const agoraAnalyticsTriggerPosition = Vector3.create(50, 1, 250)
const agoraAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(agoraAnalyticsTrigger, {})

TrackingElement.create(agoraAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.agora,
})

utils.triggers.addTrigger(agoraAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: agoraAnalyticsTriggerPosition, scale: agoraAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "agora_Region", "onEnter")
    trackStart(agoraAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "agora_Region", "onExit")
    trackEnd(agoraAnalyticsTrigger)
  },
  Color3.Red()
)


const artichokeAnalyticsTrigger = engine.addEntity()
const artichokeAnalyticsTriggerPosition = Vector3.create(51, 1, 40)
const artichokeAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(artichokeAnalyticsTrigger, {})

TrackingElement.create(artichokeAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.artichoke,
})

utils.triggers.addTrigger(artichokeAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: artichokeAnalyticsTriggerPosition, scale: artichokeAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "artichoke_Region", "onEnter")
    trackStart(artichokeAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "artichoke_Region", "onExit")
    trackEnd(artichokeAnalyticsTrigger)
  },
  Color3.Red()
)


const hallwayAnalyticsTrigger = engine.addEntity()
const hallwayAnalyticsTriggerPosition1 = Vector3.create(108, 1, 118)
const hallwayAnalyticsTriggerPosition2 = Vector3.create(127, 1, 98)
const hallwayAnalyticsTriggerScale1 = Vector3.create(50, 30, 47)
const hallwayAnalyticsTriggerScale2 = Vector3.create(50, 30, 47)
Transform.create(hallwayAnalyticsTrigger, {})

TrackingElement.create(hallwayAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.bar,
})

utils.triggers.addTrigger(hallwayAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: hallwayAnalyticsTriggerPosition1, scale: hallwayAnalyticsTriggerScale1},
   {type: "box", position: hallwayAnalyticsTriggerPosition2, scale: hallwayAnalyticsTriggerScale2}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "hallway_Region", "onEnter")
    trackStart(hallwayAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "hallway_Region", "onExit")
    trackEnd(hallwayAnalyticsTrigger)
  },
  Color3.Red()
)


const mountainsAnalyticsTrigger = engine.addEntity()
const mountainsAnalyticsTriggerPosition = Vector3.create(78, 1, 184)
const mountainsAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(mountainsAnalyticsTrigger, {})

TrackingElement.create(mountainsAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.mountains,
})

utils.triggers.addTrigger(mountainsAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: mountainsAnalyticsTriggerPosition, scale: mountainsAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "mountains_Region", "onEnter")
    trackStart(mountainsAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "mountains_Region", "onExit")
    trackEnd(mountainsAnalyticsTrigger)
  },
  Color3.Red()
)


const whaleBuildingAnalyticsTrigger = engine.addEntity()
const whaleBuildingAnalyticsTriggerPosition = Vector3.create(169, 1, 254)
const whaleBuildingAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(whaleBuildingAnalyticsTrigger, {})

TrackingElement.create(whaleBuildingAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.whaleBuilding,
})

utils.triggers.addTrigger(whaleBuildingAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: whaleBuildingAnalyticsTriggerPosition, scale: whaleBuildingAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "whaleBuilding_Region", "onEnter")
    trackStart(whaleBuildingAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "whaleBuilding_Region", "onExit")
    trackEnd(whaleBuildingAnalyticsTrigger)
  },
  Color3.Red()
)


const moonTowerAnalyticsTrigger = engine.addEntity()
const moonTowerAnalyticsTriggerPosition = Vector3.create(48, 1, 116)
const moonTowerAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(moonTowerAnalyticsTrigger, {})

TrackingElement.create(moonTowerAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.moonTower,
})

utils.triggers.addTrigger(moonTowerAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: moonTowerAnalyticsTriggerPosition, scale: moonTowerAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "moonTower_Region", "onEnter")
    trackStart(moonTowerAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "moonTower_Region", "onExit")
    trackEnd(moonTowerAnalyticsTrigger)
  },
  Color3.Red()
)


const gardenAnalyticsTrigger = engine.addEntity()
const gardenAnalyticsTriggerPosition = Vector3.create(117, 1, 30)
const gardenAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(gardenAnalyticsTrigger, {})

TrackingElement.create(gardenAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.garden,
})

utils.triggers.addTrigger(gardenAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: gardenAnalyticsTriggerPosition, scale: gardenAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "garden_Region", "onEnter")
    trackStart(gardenAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "garden_Region", "onExit")
    trackEnd(gardenAnalyticsTrigger)
  },
  Color3.Red()
)


const auditoriumAnalyticsTrigger = engine.addEntity()
const auditoriumAnalyticsTriggerPosition = Vector3.create(271, 1, 256)
const auditoriumAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(auditoriumAnalyticsTrigger, {})

TrackingElement.create(auditoriumAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.auditorium,
})

utils.triggers.addTrigger(auditoriumAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: auditoriumAnalyticsTriggerPosition, scale: auditoriumAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "auditorium_Region", "onEnter")
    trackStart(auditoriumAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "auditorium_Region", "onExit")
    trackEnd(auditoriumAnalyticsTrigger)
  },
  Color3.Red()
)


const shellAnalyticsTrigger = engine.addEntity()
const shellAnalyticsTriggerPosition = Vector3.create(275, 1, 128)
const shellAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(shellAnalyticsTrigger, {})

TrackingElement.create(shellAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.shell,
})

utils.triggers.addTrigger(shellAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: shellAnalyticsTriggerPosition, scale: shellAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "shell_Region", "onEnter")
    trackStart(shellAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "shell_Region", "onExit")
    trackEnd(shellAnalyticsTrigger)
  },
  Color3.Red()
)


const tradingCenterAnalyticsTrigger = engine.addEntity()
const tradingCenterAnalyticsTriggerPosition = Vector3.create(274, 1, 37)
const tradingCenterAnalyticsTriggerScale = Vector3.create(50, 30, 47)
Transform.create(tradingCenterAnalyticsTrigger, {})

TrackingElement.create(tradingCenterAnalyticsTrigger, {
  elementType: ANALYTICS_ELEMENTS_TYPES.region,
  elementId: ANALYTICS_ELEMENTS_IDS.tradingCenter,
})

utils.triggers.addTrigger(tradingCenterAnalyticsTrigger, utils.NO_LAYERS, utils.LAYER_1,  
  [{type: "box", position: tradingCenterAnalyticsTriggerPosition, scale: tradingCenterAnalyticsTriggerScale}],
  ()=>{ 
    console.log(AnalyticsLogLabel, "index.ts", "tradingCenter_Region", "onEnter")
    trackStart(tradingCenterAnalyticsTrigger)
  },
  ()=>{
    console.log(AnalyticsLogLabel, "index.ts", "tradingCenter_Region", "onExit")
    trackEnd(tradingCenterAnalyticsTrigger)
  },
  Color3.Red()
)

//#endregion