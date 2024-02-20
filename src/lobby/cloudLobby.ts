import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
//import { TeleportController } from './portalBeam'
/*
import {
  createEventsVerticalMenu,
  fillEventsMenu,
  updateEventsMenu,
  createCrowdVerticalMenu,
  fillCrowdsMenu,
  createClassicsVerticalMenu,
  fillClassicsMenu,
  updateCrowdsMenu,
} from './menuMainFunctions'*/

import * as utils from '@dcl-sdk/utils'
import { GltfContainer, InputAction, Material, MeshRenderer, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { GetRealmResponse, getRealm } from "~system/Runtime"
import { _openExternalURL } from '../back-ports/backPorts'
import { ANALYTICS_ELEMENTS_IDS } from '../modules/stats/AnalyticsConfig'
import { getRegisteredAnalyticsEntity } from '../modules/stats/analyticsComponents'
import { whenAllowedMediaHelperReadyAddCallback } from '../utils/allowedMediaHelper'
import { TeleportController, loadBeamMesh, loadLobbySound } from './beamPortal'
import { initClouds } from './clouds'
import { HorizontalMenu } from './horizontalScrollMenu'
import { MenuManager } from './menuManager'
import { ParcelCountX, ParcelCountZ, WELCOME_OFFSET_Y_AMOUNT, barCenter, coreBuildingOffset, lobbyCenter, lobbyHeight, lobbyHeightLegacy } from './resources/globals'
import * as resource from './resources/resources'
//import * as sfx from './resources/sounds'
//import { insideBar } from 'src/game'


//TODO TAG:PORT-REIMPLEMENT-ME


export function addCloudLobby(){

  console.log("cloudLobby.ts addCloudLobby has been called")

  loadBeamMesh()
  //create teleporter
  const portalControl = new TeleportController()

  loadLobbySound()

  const menuScale = 1.2
  const center = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, (lobbyHeight + 1.5), lobbyCenter.z - coreBuildingOffset.z)


    //add arrow_bar
    const arrow_bar = engine.addEntity()
    GltfContainer.create(arrow_bar,{src:'models/lobby/arrow_bar.glb'})
    Transform.create(arrow_bar,{
        position: Vector3.create(barCenter.x,32 ,barCenter.z),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      })
    

  
  getRealm({}).then(
    (value:GetRealmResponse) => {
      if(value.realmInfo?.isPreview){
        console.log("cloudLobby.ts","temp.planes","getRealm is preview, adding planes for spawn and ceiling")
        //START find the max height, help with visualizing how high we can go
        let findCeilingPlane = engine.addEntity()
        //PUT PARCEL SIZE HERE 4X5 FOR EXAMPLE
        const parcelMaxHeight = (Math.log((ParcelCountX*ParcelCountZ)) * Math.LOG2E) * 20
        Transform.create(findCeilingPlane,{
          position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x, parcelMaxHeight-.1, lobbyCenter.z - coreBuildingOffset.z),
          scale: Vector3.create(30,30,.1),
          rotation: Quaternion.fromEulerDegrees(90,0,0)
        })
        //MeshCollider.setPlane(findCeilingPlane)
        MeshRenderer.setPlane(findCeilingPlane)
        Material.setPbrMaterial(findCeilingPlane, {
          //texture: Material.Texture.,
          albedoColor: Color4.fromHexString("#00000088"),
          specularIntensity: 0,
          metallic: 0,
          roughness: 1
      })
      //END find the max height, help with visualizing how high we can go

      //START temporary spawn area
      let cloudSpawnTempPlane = engine.addEntity()
      //PUT PARCEL SIZE HERE 4X5 FOR EXAMPLE 
      //const parcelMaxHeight = lobbyHeight//(Math.log((4*5) + 1) * Math.LOG2E) * 20
      Transform.create(cloudSpawnTempPlane,{
        //taken from scene.json spawn to make sure is good spot
        position: Vector3.create((36.5+27.5)/2, lobbyHeight, (30+26)/2),
        scale: Vector3.create(30-26,36.5-27.5,.1),
        rotation: Quaternion.fromEulerDegrees(90,0,90)
      })
      //MeshCollider.setPlane(cloudSpawnTempPlane)
      MeshRenderer.setPlane(cloudSpawnTempPlane)
      Material.setPbrMaterial(cloudSpawnTempPlane, {
          //texture: Material.Texture.,
          albedoColor: Color4.fromHexString("#00000088"),
          specularIntensity: 0,
          metallic: 0,
          roughness: 1
      })
      //END temporary spawn
      }else{
        console.log("cloudLobby.ts","temp.planes","getRealm is NOT preview, NO temp planes for spawn and ceiling")
      }
    }
  )
    

  /*
  //START temporary flooring for cloud
   let cloudFloorTempPlane = engine.addEntity()
    //PUT PARCEL SIZE HERE 4X5 FOR EXAMPLE
    //const parcelMaxHeight = lobbyHeight//(Math.log((4*5) + 1) * Math.LOG2E) * 20
    Transform.create(cloudFloorTempPlane,{
      position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyHeight, lobbyCenter.z - coreBuildingOffset.z),
      scale: Vector3.create(40,40,.1),
      rotation: Quaternion.fromEulerDegrees(90,0,0)
    })
   // MeshCollider.setPlane(cloudFloorTempPlane)
    MeshRenderer.setPlane(cloudFloorTempPlane)
    Material.setPbrMaterial(cloudFloorTempPlane, {
      //texture: Material.Texture.,
      albedoColor: Color4.fromHexString("#00000088"),
      specularIntensity: 0,
      metallic: 0,
      roughness: 1
  })
  //END temporary flooring for cloud
  */

  // SOCIAL LINKS
  let discordLink = engine.addEntity()
  Transform.create(discordLink,{
    position: Vector3.create(
      center.x - 1,
      lobbyHeight + 1.1,
      center.z - 13.32
    ),
  })
  GltfContainer.create(discordLink, resource.discordShape)

  pointerEventsSystem.onPointerDown(
    {
      entity:discordLink,
      opts: {hoverText: 'Join the Discussion', button: InputAction.IA_POINTER }
    },
    (e) => {
      _openExternalURL('https://dcl.gg/discord')
    }
  )

  let twitterLink = engine.addEntity()
  Transform.create(twitterLink, {
    position: Vector3.create(
      center.x + 1.38,
      lobbyHeight + 1.1,
      center.z - 13.3
    )
  })

  GltfContainer.create(twitterLink,resource.twitterShape)

  pointerEventsSystem.onPointerDown(
    {
      entity:twitterLink,
      opts: { hoverText: 'Follow Us!', button: InputAction.IA_POINTER }
    },
    (e) => {
      _openExternalURL('https://twitter.com/decentraland')
    }
  )

  //DIVING SIGN
  // let divingSign = engine.addEntity()
  // Transform.create(divingSign,{
  //   position: Vector3.create(
  //     center.x - 1.2,
  //     center.y - 0.5,
  //     center.z - 6.4
  //   ),
  // })

  // GltfContainer.create(divingSign,resource.divingSignShape)


  // WATER VORTEXES
  let vortex1 = engine.addEntity()
  Transform.create(vortex1,{
    position: Vector3.create(center.x, lobbyHeight, center.z),
  })
  GltfContainer.create(vortex1,resource.vortex1Shape)


  let vortex2 = engine.addEntity()
  Transform.create(vortex2,{
      position: Vector3.create(center.x, lobbyHeight, center.z),
    })

  GltfContainer.create(vortex2,resource.vortex2Shape)


  initClouds() 


  whenAllowedMediaHelperReadyAddCallback(()=>{

    let menuManager = new MenuManager()

    let eventMenu = new HorizontalMenu( 
      Vector3.create(lobbyCenter.x- coreBuildingOffset.x, lobbyHeight + 1.25  , lobbyCenter.z- coreBuildingOffset.z), 
      Quaternion.fromEulerDegrees(0,-54,0), 
      getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.eventsSlider),
      menuManager,
      0
      )
    eventMenu.updateEventsMenu(15)
 
    let crowdsMenu = new HorizontalMenu( 
      Vector3.create(lobbyCenter.x- coreBuildingOffset.x, lobbyHeight + 3.5 , lobbyCenter.z- coreBuildingOffset.z), 
      Quaternion.fromEulerDegrees(0,-54,0), 
      getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.eventsSlider),
      menuManager,
      1
      )  
    crowdsMenu.updateCrowdsMenu(10)

    menuManager.addMenu(eventMenu)
    menuManager.addMenu(crowdsMenu)
    // refresh remaining time displays every minute (local calculation update, no server fetch)
    utils.timers.setInterval(()=>{
      eventMenu.updateEventsTimes()      
    }, 60000)
  }
  )
  

  /*
  //TODO TAG:PORT-REIMPLEMENT-ME
  // VERTICAL MENUS
  let rotation = Quaternion.fromEulerDegrees(0, 0, 0)
  let posVec = center.add(
    Vector3.Forward()
      .rotate(rotation)
      .multiplyByFloats(lobbyRadius, lobbyRadius, lobbyRadius)
  )

  // -- Events
  let eventsMenu = createEventsVerticalMenu({
    position: posVec,
    rotation: rotation,
    scale: Vector3.create(menuScale, menuScale, menuScale),
  })
  updateEventsMenu(eventsMenu, 10, true)
  //fillEventsMenu(eventsMenu)

  rotation = Quaternion.fromEulerDegrees(0, 45, 0)
  posVec = center.add(
    Vector3.Forward()
      .rotate(rotation)
      .multiplyByFloats(lobbyRadius, lobbyRadius, lobbyRadius)
  )

  // -- Trending scenes
  let crowdsMenu = createCrowdVerticalMenu({
    position: posVec,
    rotation: rotation,
    scale: Vector3.create(menuScale, menuScale, menuScale),
  })
  updateCrowdsMenu(crowdsMenu)
  //fillCrowdsMenu(crowdsMenu)

  rotation = Quaternion.fromEulerDegrees(0, -45, 0)
  posVec = center.add(
    Vector3.Forward()
      .rotate(rotation)
      .multiplyByFloats(lobbyRadius, lobbyRadius, lobbyRadius)
  )

  // -- Classics
  let classicsMenu = createClassicsVerticalMenu({
    position: posVec,
    rotation: rotation,
    scale: Vector3.create(menuScale, menuScale, menuScale),
  })
  fillClassicsMenu(classicsMenu)
  */

}//end 