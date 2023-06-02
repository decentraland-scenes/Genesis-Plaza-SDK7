import * as utils from '@dcl-sdk/utils'
import { Entity, Transform, engine } from "@dcl/sdk/ecs"
import { Color3, Vector3 } from "@dcl/sdk/math"
import { TrackingElement, trackEnd, trackStart } from "./modules/stats/analyticsComponents"
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES, AnalyticsLogLabel } from "./modules/stats/AnalyticsConfig"
import { INTERACT_WITH_NOTHING_LAYER, coreBuildingOffset, lobbyCenter, lobbyHeight } from './lobby/resources/globals'

let addAnalyticsAdded = false
export function addAnalytics() {
  if(addAnalyticsAdded) return
 
  addAnalyticsAdded = true 

  const cloudAnalyticsTrigger = engine.addEntity()
  const cloudAnalyticsTriggerPosition = Vector3.create(lobbyCenter.x - coreBuildingOffset.z, lobbyHeight+3, lobbyCenter.z - coreBuildingOffset.z)
  const cloudAnalyticsTriggerScale = Vector3.create(50, 6, 50)
  Transform.create(cloudAnalyticsTrigger, {})

  TrackingElement.create(cloudAnalyticsTrigger, {
    elementType: ANALYTICS_ELEMENTS_TYPES.region,
    elementId: ANALYTICS_ELEMENTS_IDS.cloud,
  })

  utils.triggers.addTrigger(cloudAnalyticsTrigger, INTERACT_WITH_NOTHING_LAYER, utils.LAYER_1,  
    [{type: "box", position: cloudAnalyticsTriggerPosition, scale: cloudAnalyticsTriggerScale}],
    (entity:Entity)=>{  
      console.log("analytics.ts", "trigger.cloud.cloudAnalyticsTrigger.enter","triggerParent",cloudAnalyticsTrigger,"entityInteracting", entity)
      console.log(AnalyticsLogLabel, "analytics.ts", "Cloud_Region", "onEnter")
      trackStart(cloudAnalyticsTrigger)
    },
    (entity:Entity)=>{ 
      console.log("analytics.ts", "trigger.cloud.cloudAnalyticsTrigger.exit","triggerParent",cloudAnalyticsTrigger,"entityInteracting", entity)
      console.log(AnalyticsLogLabel, "analytics.ts", "Cloud_Region", "onExit")
      trackEnd(cloudAnalyticsTrigger)
    },
    Color3.Yellow()
  )

  const sliderInCloudAnalyticsTrigger = engine.addEntity()
  const sliderInCloudAnalyticsTriggerPosition = Vector3.create(161, lobbyHeight, 159)
  const sliderInCloudAnalyticsTriggerScale = Vector3.create(30, 3, 10)
  Transform.create(sliderInCloudAnalyticsTrigger, {})

  TrackingElement.create(sliderInCloudAnalyticsTrigger, {
    elementType: ANALYTICS_ELEMENTS_TYPES.region,
    elementId: ANALYTICS_ELEMENTS_IDS.eventsSlider,
  })

  utils.triggers.addTrigger(sliderInCloudAnalyticsTrigger, INTERACT_WITH_NOTHING_LAYER, utils.LAYER_1,  
    [{type: "box", position: sliderInCloudAnalyticsTriggerPosition, scale: sliderInCloudAnalyticsTriggerScale}],
    (entity:Entity)=>{ 
      console.log("analytics.ts", "trigger.cloud.sliderInCloudAnalyticsTrigger.enter","triggerParent",sliderInCloudAnalyticsTrigger,"entityInteracting", entity)
      console.log(AnalyticsLogLabel, "analytics.ts", "SliderArea_Region", "onEnter")
      trackStart(sliderInCloudAnalyticsTrigger)
    },
    (entity:Entity)=>{ 
      console.log("analytics.ts", "trigger.cloud.sliderInCloudAnalyticsTrigger.exit","triggerParent",sliderInCloudAnalyticsTrigger,"entityInteracting", entity)
      console.log(AnalyticsLogLabel, "analytics.ts", "SliderArea_Region", "onExit")
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

  utils.triggers.addTrigger(barAnalyticsTrigger, INTERACT_WITH_NOTHING_LAYER, utils.LAYER_1,  
    [{type: "box", position: barAnalyticsTriggerPosition, scale: barAnalyticsTriggerScale}],
    (entity:Entity)=>{ 
      console.log("analytics.ts", "trigger.bar.barAnalyticsTrigger.enter","triggerParent",barAnalyticsTrigger,"entityInteracting", entity)
      console.log(AnalyticsLogLabel, "analytics.ts", "Bar_Region", "onEnter")
      trackStart(barAnalyticsTrigger)
    },
    (entity:Entity)=>{ 
      console.log("analytics.ts", "trigger.bar.barAnalyticsTrigger.exit","triggerParent",barAnalyticsTrigger,"entityInteracting", entity)
      console.log(AnalyticsLogLabel, "analytics.ts", "Bar_Region", "onExit")
      trackEnd(barAnalyticsTrigger)
    },
    Color3.Red()
  )

  /*
  //TODO add this when they will be ported to sdk7
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
  */
  }