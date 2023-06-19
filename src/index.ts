import * as utils from '@dcl-sdk/utils'
import { Color3, Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import { executeTask,GltfContainer } from '@dcl/sdk/ecs'

import { addBuildings } from './modules/buildings'
//import { placeDoors } from './modules/bar/doors'
import { barPlatforms } from './modules/platforms'
import { addCloudLobby } from './lobby/cloudLobby'
import * as sceneDataHelper from './utils/sceneDataHelper'
import { lowerVolume, outOfBar, placeJukeBox, setBarMusicOff, setBarMusicOn } from './modules/bar/jukebox'
import { addRepeatTrigger } from './modules/Utils'
import { log } from './back-ports/backPorts'
import { TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS, coreBuildingOffset } from './lobby/resources/globals'
import { initBarNpcs, initNpcFramework, initOutsideNpcs } from './modules/bar/npcs/barNpcs'
import { setupUi } from './ui'
import { placeDoors } from './modules/bar/doors'
import { getRealm, GetRealmResponse } from "~system/Runtime"
import { addTVPanels } from './modules/bar/panels'
import { initRegistery, REGISTRY } from './registry'
import { initConfig } from './config'

import "./polyfill/delcares";
import { PhysicsManager } from './modules/bar/basketball/ball'
import { initIdleStateChangedObservable, onIdleStateChangedObservable } from './back-ports/onIdleStateChangedObservable'
import { Transform, engine,Entity } from '@dcl/ecs'
import { addAnalytics } from './analytics'
import { initOnCameraModeChangedObservable } from './back-ports/onCameraModeChangedObservable'
import { applyAudioStreamWorkAround, initSoundsAttachedToPlayerHandler } from './modules/soundsAttachedToPlayer'
import { onEnterScene, onLeaveScene } from '@dcl/sdk/observables'
import { isMovePlayerInProgress } from './back-ports/movePlayer'
import * as resources from './lobby/resources/resources'
import { getAndSetUserData, getAndSetUserDataIfNullNoWait, getUserDataFromLocal } from './utils/userData'
//import { onEnterScene, onLeaveScene } from '@dcl/sdk/observables'

// export all the functions required to make the scene work
export * from '@dcl/sdk'
const FILE_NAME = 'game'


let areNpcsAdded: boolean = false
let isBasketballAdded: boolean = false

//TODO consider making these calls async, one for npc, jukebox, physics, etc
function insideBar() {
  const METHOD_NAME = 'insideBar'
  log("lazyLoading",FILE_NAME, METHOD_NAME, "Player Enter")

  if (!areNpcsAdded) {
    initBarNpcs()
    initOutsideNpcs()
    
    areNpcsAdded = true
  }

  placeJukeBox()
    
  if (!isBasketballAdded) {

    // ADD BASKETBALL GAME

    let physicsManager = new PhysicsManager(3)
    isBasketballAdded = true
  }
}

function exitBar() {
  const METHOD_NAME = 'exitBar'
  log(FILE_NAME, METHOD_NAME, "Player Exit")
}

function addOutsideOfIfPlayerOutsideOnGround(){
  const doIt = ()=>{
    const playerPos = Transform.getOrNull(engine.PlayerEntity)
    if(playerPos.position.y < 10){
      console.log("index.ts", "addOutsideOfIfPlayerOutsideOnGround", "player on ground, init anything outside ground level")
      const spawnDealy = 1000
      initOutsideNpcs(spawnDealy)
    }else{
      console.log("index.ts", "addOutsideOfIfPlayerOutsideOnGround", "player not on ground")
    }  
  }
  //use timer to wait for player data
  const timerId = utils.timers.setInterval(() => {
    const playerPos = Transform.getOrNull(engine.PlayerEntity)
    if(playerPos){
      utils.timers.clearInterval(timerId)
      doIt()
    }else{
      console.log("index.ts", "addOutsideOfIfPlayerOutsideOnGround", "waiting for player data")
    }
  }, 100); 
  
}
function start(){

  //load scene metadata
  sceneDataHelper.getAndSetSceneMetaData()

  getAndSetUserData()

  initRegistery()
  initConfig()
  addAnalytics()

  initOnCameraModeChangedObservable()

  initSoundsAttachedToPlayerHandler()

  
  //// ADD CLOUD LOBBY

  addCloudLobby()

  //// ADD BUILDINGS

  addBuildings()

  placeDoors()

  addOutsideOfIfPlayerOutsideOnGround()

  ///////// BAR STUFF

  // BAR DOORS

  /*
  //TODO TAG:PORT-REIMPLEMENT-ME
  placeDoors()
  */
  barPlatforms()

  // ADD EVENT CARDS TO BAR
  addTVPanels()


  //eager load bar models so have them downloaded browser cache should the time come to use them
  const EAGER_LOAD_MODELS_START_DELAY = 10000
  const EAGER_LOAD_MODELS_DELETE_DELAY = 5000
  utils.timers.setTimeout(() => { 
    const METHOD_NAME = "eagerLoadingBarModels"
    console.log("index.ts", "eagerLoadingBarModels", "eager loading bar models")
    //npcs + juke box etc.
    const modelsToLazyLoad = [
      resources.octopusModelPath
      ,resources.fashionistModelPath,
      resources.aritst1ModelPath,
      resources.aritst2ModelPath,
      resources.dogeModelPath,
      resources.simoneModelPath,
      resources.robModelPath,
      resources.aishaModelPath]
    
    const entList:Entity[] = []
    for(const model of modelsToLazyLoad){
      const tempEnt = engine.addEntity() 
      //out of sight underground
      Transform.create(tempEnt, { position: Vector3.create(6, 0, 6),scale:Vector3.create(0.01,0.01,0.01) })
      GltfContainer.create(tempEnt, { src: model})

      entList.push(tempEnt)
    }
    //TODO poll loading state to know when done for quicker deletion
    utils.timers.setTimeout(() => {
      //delete them now
      console.log("index.ts", METHOD_NAME, "deleting eager loading bar models")
      
      for(const e of entList){
        engine.removeEntity(e)
      }
    },EAGER_LOAD_MODELS_DELETE_DELAY)

  },EAGER_LOAD_MODELS_START_DELAY) //picking time after scene load in hopes it does not cause major hickup




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
  onIdleStateChangedObservable.add((isIdle: boolean) => {
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
      executeTask(async () => {
        //so not thread blocking
        insideBar()
      })
      
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
      //FIXME cannot be set by a trigger when sharing state as it will turn on off for other players. 
      //disconnect juke box for now????
      //make sure its created
      placeJukeBox()
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

  //FIXME need to check player.id matches

  onEnterScene.add((player) => { 
    console.log("onEnterScene", "player", player,"isMovePlayerInProgress()",isMovePlayerInProgress())
    //FIXME me need to check this player!!!
    const localData = getUserDataFromLocal()
    if(!localData){ 
      console.log("onEnterScene", "WARN no player data",localData, player,"isMovePlayerInProgress()",isMovePlayerInProgress())
    }
    if(localData && player.userId === localData.userId){
      console.log("onEnterScene", "this player",localData, player,"isMovePlayerInProgress()",isMovePlayerInProgress())
      applyAudioStreamWorkAround('enter')
    }

    initOutsideNpcs()
  })
  
  onLeaveScene.add((player) => {
    console.log("onLeaveScene", "player", player,"isMovePlayerInProgress()",isMovePlayerInProgress())
    
    const localData = getUserDataFromLocal()
    if(!localData){
      console.log("onLeaveScene", "WARN no player data",localData, player,"isMovePlayerInProgress()",isMovePlayerInProgress())
    }
    if(localData && player.userId === localData.userId){
      console.log("onLeaveScene", "this player",localData, player,"isMovePlayerInProgress()",isMovePlayerInProgress())
      applyAudioStreamWorkAround('exit')
    }
  })



  //scene wide trigger, can't trust onEnterScene/onLeaveScene as trigger during playermoves
  /*console.log("index.ts", "trigger.bar.outerparim.enter","triggerParent",undefined)
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
  )*/


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

  setupUi()
}//end start()

start() 