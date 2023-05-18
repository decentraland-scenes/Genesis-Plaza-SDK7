import { Vector3 } from '@dcl/sdk/math'
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

import { coreBuildingOffset, lobbyCenter, lobbyHeight, lobbyRadius } from './resources/globals'
import * as resource from './resources/resources'
import { GltfContainer, InputAction, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { _openExternalURL } from '../back-ports/backPorts'
import { initClouds } from './clouds'

//import * as sfx from './resources/sounds'
//import { insideBar } from 'src/game'

/*
//TODO TAG:PORT-REIMPLEMENT-ME
const portalControl = new TeleportController()
*/

export function addCloudLobby(){

  console.log("cloudLobby.ts addCloudLobby has been called")

  const menuScale = 1.2
  const center = Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyHeight + 1.5, lobbyCenter.z - coreBuildingOffset.z)

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
      lobbyHeight + 1,
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
      lobbyCenter.x - 1.2,
      lobbyHeight - 0.5,
      lobbyCenter.z - 6.4
    ),
  })

  GltfContainer.create(divingSign,resource.divingSignShape)


  // WATER VORTEXES
  let vortex1 = engine.addEntity()
  Transform.create(vortex1,{
    position: Vector3.create(lobbyCenter.x, lobbyHeight, lobbyCenter.z),
  })
  GltfContainer.create(vortex1,resource.vortex1Shape)


  let vortex2 = engine.addEntity()
  Transform.create(vortex2,{
      position: Vector3.create(lobbyCenter.x, lobbyHeight, lobbyCenter.z),
    })

  GltfContainer.create(vortex2,resource.vortex2Shape)


  initClouds()

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