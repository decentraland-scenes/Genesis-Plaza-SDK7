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

import { ParcelCountX, ParcelCountZ, coreBuildingOffset, lobbyCenter, lobbyHeight, lobbyHeightLegacy, lobbyRadius } from './resources/globals'
import * as resource from './resources/resources'
import { GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { _openExternalURL } from '../back-ports/backPorts'
import { initClouds } from './clouds'
import { TeleportController } from './beamPortal'
import { whenAllowedMediaHelperReadyAddCallback } from '../utils/allowedMediaHelper'
import { HorizontalMenu } from './horizontalScrollMenu'
//import * as sfx from './resources/sounds'
//import { insideBar } from 'src/game'


//TODO TAG:PORT-REIMPLEMENT-ME
const portalControl = new TeleportController()


export function addCloudLobby(){

  console.log("cloudLobby.ts addCloudLobby has been called")

  const menuScale = 1.2
  const center = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, (lobbyHeight + 1.5) - lobbyHeightLegacy, lobbyCenter.z - coreBuildingOffset.z)


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
    position: Vector3.create((36.5+26.5)/2, lobbyHeight, (30+26)/2),
    scale: Vector3.create(30-26,36.5-26.5,.1),
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
      center.y + 1,
      center.z - 13.32
    ),
  })

  //discordLink.addComponent(resource.discordShape)
  GltfContainer.create(discordLink, resource.discordShape  )


  pointerEventsSystem.onPointerDown(discordLink,
      (e) => {
      _openExternalURL('https://dcl.gg/discord')
      },
      { hoverText: 'Join the Discussion', button: InputAction.IA_POINTER }
    )

  let twitterLink = engine.addEntity()
  Transform.create(twitterLink,{
    position: Vector3.create(
      center.x + 1.38,
      center.y + 1,
      center.z - 13.3
    )
  })

  GltfContainer.create(twitterLink,resource.twitterShape)
  pointerEventsSystem.onPointerDown(twitterLink,
      (e) => {
        _openExternalURL('https://twitter.com/decentraland')
      },
      { hoverText: 'Follow Us!', button: InputAction.IA_POINTER }
    )



  //DIVING SIGN
  let divingSign = engine.addEntity()
  Transform.create(divingSign,{
    position: Vector3.create(
      center.x - 1.2,
      center.y - 0.5,
      center.z - 6.4
    ),
  })

  GltfContainer.create(divingSign,resource.divingSignShape)


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
    let eventMenu = new HorizontalMenu( Vector3.create(lobbyCenter.x- coreBuildingOffset.x, lobbyHeight + 1.25  , lobbyCenter.z- coreBuildingOffset.z), Quaternion.fromEulerDegrees(0,-54,0))
    eventMenu.updateEventsMenu(15)
 
    let crowdsMenu = new HorizontalMenu( Vector3.create(lobbyCenter.x- coreBuildingOffset.x, lobbyHeight + 3.5 , lobbyCenter.z- coreBuildingOffset.z), Quaternion.fromEulerDegrees(0,-54,0))  
    crowdsMenu.updateCrowdsMenu(10)
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

}