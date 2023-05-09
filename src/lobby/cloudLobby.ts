import { Quaternion, Vector3 } from '@dcl/sdk/math'
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

import { lobbyCenter, lobbyHeight, lobbyRadius } from './resources/globals'
import * as resource from './resources/resources'
import { GltfContainer, InputAction, Material, MeshRenderer, Transform, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { _openExternalURL } from '../back-ports/backPorts'
import { initClouds } from './clouds'
import { HorizontalMenu } from './horizontalScrollMenu'
//import * as sfx from './resources/sounds'
//import { insideBar } from 'src/game'

/*
//TODO TAG:PORT-REIMPLEMENT-ME
const portalControl = new TeleportController()
*/

export function addCloudLobby(){

  const menuScale = 1.2
  const center = Vector3.create(lobbyCenter.x, lobbyHeight + 1.5, lobbyCenter.z)

  // SOCIAL LINKS
  let discordLink = engine.addEntity()
  Transform.create(discordLink,{
    position: Vector3.create(
      lobbyCenter.x - 1,
      lobbyHeight + 1,
      lobbyCenter.z - 13.32
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
      lobbyCenter.x + 1.38,
      lobbyHeight + 1,
      lobbyCenter.z - 13.3
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

//   let planeTest = engine.addEntity()
//   Transform.create(planeTest,{
//     position: Vector3.create(lobbyCenter.x, 1, lobbyCenter.z),
//   })
//   MeshRenderer.setPlane(planeTest)
//   Material.setPbrMaterial(planeTest, {
//     texture: Material.Texture.Common({
//         src: "https://events-assets-099ac00.decentraland.org/poster/ed75e6cc6438b64a.png"           
//     }),
    
//     specularIntensity: 0,
//     metallic: 0,
//     roughness: 1
// })


  //HORIZONTAL EVENT MENU
  // let menuHorizontalFrame = engine.addEntity()
  // GltfContainer.create(menuHorizontalFrame,{src:'models/lobby/menu_horizontal_bg.glb'})
  // Transform.create(menuHorizontalFrame,{
  //     rotation: Quaternion.fromEulerDegrees(0, 180, 0),
  //     position: Vector3.create(lobbyCenter.x,0.2,lobbyCenter.z)
  //   })

  let eventMenu = new HorizontalMenu( Vector3.create(lobbyCenter.x, 2, lobbyCenter.z))
  eventMenu.updateEventsMenu(20)

  let crowdsMenu = new HorizontalMenu( Vector3.create(lobbyCenter.x, 4, lobbyCenter.z))  
  crowdsMenu.updateCrowdsMenu(10)

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