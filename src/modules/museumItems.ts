// import { Dialog, NPC, TriggerBoxShape } from '@dcl/npc-scene-utils'
import * as npc from 'dcl-npc-toolkit'
import {
  alice,
  ron,
  bela,
  betty,
  charlie,
  marsha,  
} from './npcRobotBuilder'
import {
  BettyDialog,
  BobDialog,
  CharlieDialog,
  RonDialog,
} from './npcDialogData'
import * as utils from '@dcl-sdk/utils'
import { Entity, GltfContainer, InputAction, Transform,  TransformTypeWithOptionals, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color3, Vector3, Quaternion } from '@dcl/sdk/math'
import { _openExternalURL } from '../back-ports/backPorts'
import { openDialog } from 'dcl-npc-toolkit/dist/dialog'
import resources from '../resources'

export let bob: Entity


bob = npc.create( 
  {
    //position: Vector3.create(119.7, 11.5, 280.3),
    position: Vector3.create(165.573, 11.5, 252.79), 
    rotation: Quaternion.fromEulerDegrees(0, 35, 0),
  },
  //NPC Data Object
  {
    type: npc.NPCType.CUSTOM,
    model: resources.models.robots.bob,
    portrait: { 
      path: 'images/portraits/bob.png',
      height: 256,
      width: 256,
      section: {
        sourceHeight: 384,
        sourceWidth: 384,
      },
    },
    faceUser: true,
    dialogSound: resources.sounds.robots.bob,
    onActivate: () => {
      console.log('npc activated')
      npc.playAnimation(bob, 'Talk')        
      npc.talk(bob, BobDialog, 0 )
    },
  }
)

// Opens informational dialog about a piece
// function openPieceInfoWindow(piece: Entity, robot: NPC, textID: number) {
//   // used for closing UI when walking away or clicking
// //   updateOpenUITime()
// //   setUiOpener(piece)

// //   dialogWindow.isInfoPanel = true
//   openDialogSound.getComponent(AudioSource).playOnce()
//   robot.talk()

//   robots[robotID].playTalk()
//   dialogWindow.openDialogWindow(robotID, textID) // RobotID and textID
//   // HACK: To avoid clashing with the input subscribe button down event
//   piece.addComponentOrReplace(
//     new utils.Delay(30, () => {
//       dialogWindow.isDialogOpen = true
//     })
//   )

//   // Stop robot from tracking the user
//   if (robots[robotID].hasComponent(TrackUserSlerp))
//     robots[robotID].removeComponent(TrackUserSlerp)
// }

export class MuseumPiece{
  entity:Entity
  model: string
  name: string
  constructor(
    model: string,
    transform: TransformTypeWithOptionals,
    name: string,
    robot?: Entity,
    dialog?: npc.Dialog[],
    textID?: number
  ) {
    
    //engine.addEntity(this)
    this.entity = engine.addEntity()
    GltfContainer.createOrReplace(this.entity, {
      src: model 
    })
    //this.addComponent(model)
    Transform.createOrReplace(this.entity, transform )
    //this.addComponent(new Transform(transform))

    this.name = name
    
    let thisPiece = this

    pointerEventsSystem.onPointerDown(
      {
        entity: this.entity,
        opts: { button: InputAction.IA_PRIMARY, hoverText: this.name, maxDistance: 8 },
      },
      function () { 
        console.log("ROBOT TRYING TO TALK")  
        //Vector3.copyFrom(Transform.get(engine.PlayerEntity).position, Transform.getMutable(bob).position)    
         
       // openDialog(robot, dialog, textID)
       // let dialogWindow = npc.createDialogWindow()
        //npc.openDialogWindow(dialogWindow, dialog, textID)

      //   npc.talk(robot, dialog, textID)
      //  if (robot && dialog) {
      //   //   utils.triggers.oneTimeTrigger(this.entity
      //   //     new TriggerBoxShape(
      //   //       Vector3.create(10, 5, 10),
      //   //       Vector3.Zero() //thisPiece.getComponent(Transform).position.clone()
      //   //     ),
      //   //     {
      //   //       onCameraExit: () => {
      //   //         robot.endInteraction()
      //   //       },
      //   //       enableDebug: true,
      //   //     },
      //   //  ,
      //   //    thisPiece
      //   //  )
      //   console.log("ROBOT TRYING TO TALK")
          npc.talk(robot, dialog, textID)
       //}
      }
    )

    // this.addComponent(
    //   new OnPointerDown(
    //     function () {
    //       if (robot && dialog) {
    //         utils.triggers.oneTimeTrigger(this.entity
    //           new TriggerBoxShape(
    //             Vector3.create(10, 5, 10),
    //             Vector3.Zero() //thisPiece.getComponent(Transform).position.clone()
    //           ),
    //           {
    //             onCameraExit: () => {
    //               robot.endInteraction()
    //             },
    //             enableDebug: true,
    //           },
    //           thisPiece
    //         )
    //         robot.talk(dialog, textID)
    //       }
    //     },
    //     {
    //       button: ActionButton.PRIMARY,
    //       hoverText: this.name,
    //     }
    //   )
    // )
  }

  public ask(): void {
    //this.name
  }
}

//// MAP ANIMS

// let districtOn = new AnimationState('District_Action', { looping: false })
// let districtOff = new AnimationState('District_OFF_Action', { looping: false })
// let roadsOn = new AnimationState('Roads_Action', { looping: false })
// let roadsOff = new AnimationState('Roads_OFF_Action', { looping: false })
// let plazasOn = new AnimationState('Plazas_Action', { looping: false })
// let plazasOff = new AnimationState('Plazas_OFF_Action', { looping: false })

export function placeMuseumPieces() {
  let dao = new MuseumPiece(
    'models/museum/dao.glb',
    {
      position: Vector3.create(119.7, 11.5, 280.3),
      rotation: Quaternion.fromEulerDegrees(0, 105, 0),
    },
    'DAO',
   bob,
   BobDialog,
   8
  )

  let vision = new MuseumPiece(
    'models/museum/first-image-dcl.glb',
    {
      position: Vector3.create(162, 9.4, 269.4),
      rotation: Quaternion.fromEulerDegrees(0, 208, 0),
    },
    'The Vision',
   bob,
    BobDialog,
    11
  )

  let firstPixels = new MuseumPiece(
    'models/museum/pixels-beginning.glb',
    {
      position: Vector3.create(168.24, 9.5, 266.3),
      rotation: Quaternion.fromEulerDegrees(0, 208, 0),
    },
    'First Experiments',
    bob,
    BobDialog,
    13
  )

  let first3D = new MuseumPiece(
    'models/museum/first-experiment.glb',
    {
      position: Vector3.create(174.5, 9.7, 262.5),
      rotation: Quaternion.fromEulerDegrees(0, 208, 0),
    },
    'First 3D Version',
   bob,
    BobDialog,
    16
  )

  let declaration = new MuseumPiece(
    'models/museum/declaration.glb',
    {
      position: Vector3.create(183.9, 10, 254.7),
      rotation: Quaternion.fromEulerDegrees(0, 220, 0),
    },
    'Declaration of independance',
    bob,
    BobDialog,
    17
  )

  let old_logo = new MuseumPiece(
    'models/museum/old_logo.glb',
    {
      position: Vector3.create(189.2, 10.4, 250),
      rotation: Quaternion.fromEulerDegrees(0, 212, 0),
    },
    'Original Logo',
    bob,
    BobDialog,
    18
  )

  let first_avatars = new MuseumPiece(
    'models/museum/first-avatars.glb',
    {
      position: Vector3.create(193.7, 10.45, 245.95),
      rotation: Quaternion.fromEulerDegrees(0, 230, 0),
    },
    'First Avatars',
    bob,
    BobDialog,
    19
  )

  let first_auction = new MuseumPiece(
    'models/museum/first_auction.glb',
    {
      position: Vector3.create(198.5, 10.5, 240.7),
      rotation: Quaternion.fromEulerDegrees(0, 230, 0),
    },
    'First Land Auction',
    bob,
    BobDialog,
    28
  )

  let avatar1 = new MuseumPiece(
    'models/museum/avatars/first-avatar.glb',
    {
      position: Vector3.create(200.99, 10.7, 234.22),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    },
    'Avatar',
    bob,
    BobDialog,
    20
  )

  let avatar2 = new MuseumPiece(
    'models/museum/avatars/fox-avatar.glb',
    {
      position: Vector3.create(199, 10.3, 231.8),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    },
    'Avatar',
     bob,
     BobDialog,
     21
  )
  let avatar3 = new MuseumPiece(
    'models/museum/avatars/square-robot-avatar.glb',
    {
      position: Vector3.create(196.8, 10.3, 229.7),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    },
    'Avatar',
     bob,
     BobDialog,
     23
  )

  let avatar5 = new MuseumPiece(
    'models/museum/avatars/round-robot-avatar.glb',
    {
      position: Vector3.create(194.38, 10.3, 227),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    },
    'Avatar',
     bob,
     BobDialog,
     24
  )

  let avatar6 = new MuseumPiece(
    'models/museum/avatars/boy.glb',
    {
      position: Vector3.create(191.59, 10.8, 224.95),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    },
    'Avatar',
     bob,
     BobDialog,
     25
  )

  let avatar7 = new MuseumPiece(
    'models/museum/avatars/girl.glb',
    {
      position: Vector3.create(188.7, 10.8, 223),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
    },
    'Avatar',
     bob,
     BobDialog,
     26
  )

  let second_auction = new MuseumPiece(
    'models/museum/second_auction.glb',
    {
      position: Vector3.create(182.6, 10.5, 226.5),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
    },
    'Second Land Auction',
     bob,
     BobDialog,
     30
  )

  let new_logo = new MuseumPiece(
    'models/museum/new_logo.glb',
    {
      position: Vector3.create(177, 10.45, 233.3),
      rotation: Quaternion.fromEulerDegrees(0, 52, 0),
    },
    'New Logo',
     bob,
     BobDialog,
     32
  )

  let landing = new MuseumPiece(
    'models/museum/landing.glb',
    {
      position: Vector3.create(171.8, 10.5, 239.9),
      rotation: Quaternion.fromEulerDegrees(0, 50, 0),
    },
    'Landing',
     bob,
     BobDialog,
     34
  )

  let builder = new MuseumPiece(
    'models/museum/builder.glb',
    {
      position: Vector3.create(165.9, 9.8, 246),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
    },
    'Builder',
     bob,
     BobDialog,
     37
  )

  let names = new MuseumPiece(
    'models/museum/names.glb',
    {
      position: Vector3.create(159.8, 9.5, 251.9),
      rotation: Quaternion.fromEulerDegrees(0, 42, 0),
    },
    'Virtual identity',
     bob,
     BobDialog,
     40
  )

  let wearables = new MuseumPiece(
    'models/museum/halloween_event.glb',
    {
      position: Vector3.create(151.7, 9.4, 258.4),
      rotation: Quaternion.fromEulerDegrees(0, 35, 0),
    },
    'Token Wearables',
     bob,
     BobDialog,
     41
  )

  ///// UPSTAIRS

 let map = engine.addEntity()
 Transform.createOrReplace(map,{
      position: Vector3.create(196.29, 18, 226.15),
      rotation: Quaternion.fromEulerDegrees(0, 315, 0),
      scale: Vector3.create(1.25, 1.25, 1.25),
    })
  GltfContainer.createOrReplace(map, { src: 'models/museum/map/map_base.glb' })
 // map.createOrReplace(map, { src: 'models/museum/map/map_base.glb'))
  //engine.addEntity(map)

  let districts = engine.addEntity()
  Transform.createOrReplace(districts,{
      position: Vector3.create(),
      parent: map
    }) 
  GltfContainer.createOrReplace(districts, { src: 'models/museum/map/map_districts.glb'})
  
  // districts.addComponent(new Animator())
  // districts.getComponent(Animator).addClip(districtOn)
  // districts.getComponent(Animator).addClip(districtOff)
  // districtOn.stop()

  // districts.addComponent(
  //   new OnPointerDown(
  //     function () {
  //       animateMap(MapItems.DISTRICTS)
  //       bob.talk(BobDialog, 51)
  //     },
  //     {
  //       button: ActionButton.PRIMARY,
  //       hoverText: 'Districts',
  //     }
  //   )
  // )

  let plazas = engine.addEntity()
  Transform.create(plazas,{
      position: Vector3.create(),
      parent: plazas
    })  
  GltfContainer.createOrReplace(plazas, { src: 'models/museum/map/map_plazas.glb'})

  //plazas.addComponent(new Animator())
 // plazas.getComponent(Animator).addClip(plazasOn)
  //plazas.getComponent(Animator).addClip(plazasOff)
  //plazasOn.stop()

  // plazas.addComponent(
  //   new OnPointerDown(
  //     function () {
  //       animateMap(MapItems.PLAZAS)
  //       bob.talk(BobDialog, 49)
  //     },
  //     {
  //       button: ActionButton.PRIMARY,
  //       hoverText: 'Plazas',
  //     }
  //   )
  // )

//  let roads = engine.addEntity()
//  Transform.createOrReplace(roads, {
//       position: Vector3.create(),
//       parent: map

//     })
  
//   GltfContainer.createOrReplace(roads, { src: 'models/museum/map/map_roads.glb'})

  // roads.addComponent(new Animator())
  // roads.getComponent(Animator).addClip(roadsOn)
  // roads.getComponent(Animator).addClip(roadsOff)
  // roadsOn.stop()

  // roads.addComponent(
  //   new OnPointerDown(
  //     function () {
  //       animateMap(MapItems.ROADS)
  //       bob.talk(BobDialog, 48)
  //     },
  //     {
  //       button: ActionButton.PRIMARY,
  //       hoverText: 'Roads',
  //     }
  //   )
  // )

  let parcel = new MuseumPiece(
    'models/museum/land.glb',
    {
      position: Vector3.create(193, 17.4, 223.5),
      rotation: Quaternion.fromEulerDegrees(0, 195, 0),
    },
    'LAND Parcel',
     bob,
     BobDialog,
     44
  )

  let parcelPua = new MuseumPiece(
    'models/museum/pua.glb',
    {
      position: Vector3.create(193, 17.55, 223.5),
      rotation: Quaternion.fromEulerDegrees(0, 195, 0),
    },
    'LAND Parcel'
  )

  let estate = new MuseumPiece(
    'models/museum/estate.glb',
    {
      position: Vector3.create(199.2, 17.4, 230),
      rotation: Quaternion.fromEulerDegrees(0, 30, 0),
    },
    'Estate',
   bob,
     BobDialog,
     47
  )

  let estatePua = new MuseumPiece(
    'models/museum/pua.glb',
    {
      position: Vector3.create(199.2, 17.55, 230),
      rotation: Quaternion.fromEulerDegrees(0, 30, 0),
    },
    'Estate'
  )

  let museum_district = new MuseumPiece(
    'models/museum/museum_district.glb',
    {
      position: Vector3.create(181.2, 17.9, 228.6),
      rotation: Quaternion.fromEulerDegrees(0, 50, 0),
    },
    'Museum District',
     bob,
     BobDialog,
     54
  )

  let builderContest = new MuseumPiece(
    'models/museum/builder_winner.glb',
    {
      position: Vector3.create(175.2, 17.8, 236.6),
      rotation: Quaternion.fromEulerDegrees(0, 50, 0),
    },
    'First Builder Contest',
     bob,
     BobDialog,
     57
  )

  let builderContest2 = new MuseumPiece(
    'models/museum/smart-items.glb',
    {
      position: Vector3.create(169, 17.5, 243.95),
      rotation: Quaternion.fromEulerDegrees(0, 50, 0),
    },
    'Creator contest',
     bob,
     BobDialog,
     59
  )

  let mana = new MuseumPiece(
    'models/museum/mana.glb',
    {
      position: Vector3.create(168.4, 18.8, 255.7),
      rotation: Quaternion.fromEulerDegrees(0, 135, 0),
    },
    'MANA',
     bob,
     BobDialog,
     62
  )

  let hackathon = new MuseumPiece(
    'models/museum/hackathon_winner.glb',
    {
      position: Vector3.create(185.7, 17.6, 252),
      rotation: Quaternion.fromEulerDegrees(0, 220, 0),
    },
    'September 2019 Hackathon',
     bob,
     BobDialog,
     67
  )

  let hackathon2 = new MuseumPiece(
    'models/museum/contest_game.glb',
    {
      position: Vector3.create(192.9, 17.7, 245),
      rotation: Quaternion.fromEulerDegrees(0, 225, 0),
    },
    'Hackathons',
     bob,
     BobDialog,
     66
  )

  let community_contest = new MuseumPiece(
    'models/museum/community_contest.glb',
    {
      position: Vector3.create(199.5, 17.8, 238.2),
      rotation: Quaternion.fromEulerDegrees(0, 230, 0),
    },
    'Community Wearable Contest',
     bob,
     BobDialog,
     69
  )

  ////////  WEARABLES BUILDING

  /*
  Main = 0 (Alice)
  Shell = 1 (Ron)
  Agora = 2 (Bela)
  Garden = 3 (Betty)
  Trade = 4 (Charlie)
  Artichoke = 5 (Marsha)
  Whale = 6 (Bob)
*/
}

export function placeWearablePieces() {
  let xmax_wearables = new MuseumPiece(
    'models/wearables/xmas_stand.glb',
    {
      position: Vector3.create(279.67, 9.5, 145),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    },
    'About X-Mas Wearables',
     ron,
     RonDialog,
     14
  )

  let halloween_wearables = new MuseumPiece(
    'models/wearables/halloween_stand.glb',
    {
      position: Vector3.create(265.38, 9.5, 114),
      rotation: Quaternion.fromEulerDegrees(0, 150, 0),
    },
    'About Halloween Wearables',
     ron,
     RonDialog,
     15
  )
}

/////////// TRADE CENTER

// export let invisibleMaterial = new BasicMaterial()
// invisibleMaterial.texture = new Texture('images/transparent-texture.png')
// invisibleMaterial.alphaTest = 1

// export function placeTradecenterPieces() {
//   let parcelTC = new MuseumPiece(
//     'models/museum/land.glb',
//     {
//       position: Vector3.create(282.9, 11, 39),
//       rotation: Quaternion.fromEulerDegrees(0, 195, 0),
//     },
//     'LAND Parcel',
//     charlie,
//     CharlieDialog,
//     12
//   )

//   let parcelPuaTC = new MuseumPiece(
//     'models/museum/pua.glb',
//     {
//       position: Vector3.create(282.9, 11, 39),
//       rotation: Quaternion.fromEulerDegrees(0, 195, 0),
//     },
//     'LAND Parcel'
//   )

//   let estateTC = new MuseumPiece(
//     'models/museum/estate.glb',
//     {
//       position: Vector3.create(262.9, 11, 35.7),
//       rotation: Quaternion.fromEulerDegrees(0, 30, 0),
//     },
//     'Estate',
//     charlie,
//     CharlieDialog,
//     16
//   )

//   let estatePuaTC = new MuseumPiece(
//     'models/museum/pua.glb',
//     {
//       position: Vector3.create(262.9, 11, 35.7),
//       rotation: Quaternion.fromEulerDegrees(0, 30, 0),
//     },
//     'Estate'
//   )

//   let mythicInfo = new MuseumPiece(
//     new BoxShape(),
//     {
//       position: Vector3.create(264.5, 22.7, 16.25),
//       rotation: Quaternion.fromEulerDegrees(0, 204, 0),
//       scale: Vector3.create(5.8, 1.2, 1.2),
//     },
//     'Wearables',
//     charlie,
//     CharlieDialog,
//     17
//   )

//   mythicInfo.addComponent(invisibleMaterial)

//   let epicInfo = new MuseumPiece(
//     new BoxShape(),
//     {
//       position: Vector3.create(251.4, 22.7, 46.13),
//       rotation: Quaternion.fromEulerDegrees(0, 293, 0),
//       scale: Vector3.create(5.8, 1.2, 1.2),
//     },
//     'Wearables',
//     charlie,
//     CharlieDialog,
//     17
//   )

//   epicInfo.addComponent(invisibleMaterial)

//   let legendaryInfo = new MuseumPiece(
//     new BoxShape(),
//     {
//       position: Vector3.create(294.7, 22.7, 28.83),
//       rotation: Quaternion.fromEulerDegrees(0, 114, 0),
//       scale: Vector3.create(5.8, 1.2, 1.2),
//     },
//     'Wearables',
//     charlie,
//     CharlieDialog,
//     17
//   )

//   legendaryInfo.addComponent(invisibleMaterial)

//   let rareInfo = new MuseumPiece(
//     new BoxShape(),
//     {
//       position: Vector3.create(281.4, 22.7, 59.17),
//       rotation: Quaternion.fromEulerDegrees(0, 24, 0),
//       scale: Vector3.create(5.8, 1.2, 1.2),
//     },
//     'Wearables',
//     charlie,
//     CharlieDialog,
//     17
//   )

//   rareInfo.addComponent(invisibleMaterial)
// }

/////// GARDEN

export function placeGardenPieces() {
  let builderScene = new MuseumPiece(
    'models/garden/booth_builder_scene.glb',
    {
      position: Vector3.create(132.59, 2, 39.8),

      rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    },
    'Builder scene',
    // betty,
    // BettyDialog,
    // 34
  )

  let smartItemScene = new MuseumPiece(
    'models/garden/booth_smart_items.glb',
    {
      position: Vector3.create(106, 2, 27.7),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    },
    'Smart Item scene',
    // betty,
    // BettyDialog,
    // 35
  )

  let builderLink = engine.addEntity()
  Transform.createOrReplace(builderLink, {
      position: Vector3.create(121.6, 1.2, 20.5),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      scale: Vector3.create(1.5, 1.5, 1.5),
    })
  
  GltfContainer.createOrReplace(builderLink, { src: 'models/garden/builder.glb'})  
  pointerEventsSystem.onPointerDown(
    {
      entity: builderLink,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Try the Builder', maxDistance: 8 },
    },
    function () {
      
      _openExternalURL('https://builder.decentraland.org')
    }
  )



  let docsLink = engine.addEntity()
  Transform.createOrReplace(docsLink, {
      position: Vector3.create(121.6, 1.2, 17.5),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      scale: Vector3.create(1.5, 1.5, 1.5),
    })
  
  GltfContainer.createOrReplace(docsLink, { src: 'models/garden/docs.glb'})
  pointerEventsSystem.onPointerDown(
    {
      entity: docsLink,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Read the Docs', maxDistance: 8 },
    },
    function () {
      
      _openExternalURL('https://docs.decentraland.org')
    }
  )

 

  let discordLink = engine.addEntity()
 Transform.createOrReplace( discordLink, {
      position: Vector3.create(113.6, 1.5, 20.5),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      scale: Vector3.create(1, 1, 1),
    })
  
  GltfContainer.createOrReplace(discordLink, { src: 'models/garden/discord.glb'})
  pointerEventsSystem.onPointerDown(
    {
      entity: discordLink,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Join the Discussion', maxDistance: 8 },
    },
    function () {
      
      _openExternalURL('https://dcl.gg/discord')
    }
  )

  let twitterLink = engine.addEntity()
 Transform.createOrReplace(twitterLink, {
      position: Vector3.create(113.6, 1.5, 17.5),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      scale: Vector3.create(1, 1, 1),
    })
  
  GltfContainer.createOrReplace(twitterLink, { src: 'models/garden/twitter.glb'})
  pointerEventsSystem.onPointerDown(
    {
      entity: twitterLink,
      opts: { button: InputAction.IA_PRIMARY, hoverText: 'Follow Us!', maxDistance: 8 },
    },
    function () {
      
      _openExternalURL('https://twitter.com/decentraland')
    }
  ) 
}

///// MAP HELPERS

export enum MapItems {
  DISTRICTS = 'districts',
  PLAZAS = 'plazas',
  ROADS = 'roads',
}

let currentItem: MapItems | null = null

export function animateMap(item: MapItems) {
  console.log('selected item: ', item)
  // switch (currentItem) {
  //   case MapItems.DISTRICTS:
  //     districtOff.play()
  //     break
  //   case MapItems.ROADS:
  //     roadsOn.stop()
  //     roadsOff.play()
  //     break
  //   case MapItems.PLAZAS:
  //     plazasOn.stop()
  //     plazasOff.play()
  //     break
  // }

  // if (item != currentItem) {
  //   currentItem = item

  //   switch (item) {
  //     case MapItems.DISTRICTS:
  //       log('clicked Districts')
  //       districtOff.stop()
  //       districtOn.stop()
  //       districtOn.play()
  //       break
  //     case MapItems.ROADS:
  //       log('clicked Roads')
  //       roadsOff.stop()
  //       roadsOn.stop()
  //       roadsOn.play()
  //       break
  //     case MapItems.PLAZAS:
  //       log('clicked Plazas')
  //       plazasOff.stop()
  //       plazasOn.stop()
  //       plazasOn.play()
  //       break
  //   }
  // } else {
  //   currentItem = null
  // }
}
