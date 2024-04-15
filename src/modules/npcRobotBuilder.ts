import resources from '../resources'
//import { tutorialEnableObservable } from './tutorialHandler'
import * as npc from 'dcl-npc-toolkit'
// import {
//   AliceDialog,
//   BelaDialog,
//   BettyDialog,
//   BobDialog,
//   CharlieDialog,
//   MarshaDialog,
//   RonDialog,
// } from './npcDialogData'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Entity, GltfContainer, PBGltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { BelaDialog, BettyDialog, BobDialog, CharlieDialog, MarshaDialog, RonDialog } from './npcDialogData'

/*
  Main = 0 (Alice)
  Shell = 1 (Ron)
  Agora = 2 (Bela)
  Garden = 3 (Betty)
  Trade = 4 (Charlie)
  Artichoke = 5 (Marsha)
  Whale = 6 (Bob)
*/
export let alice: Entity
export let ron: Entity
export let bela: Entity
export let betty: Entity
export let charlie: Entity
export let marsha: Entity
//export let bob: Entity






export function addRobots() {
  const ringShape = resources.models.robots.rings
  let ringGLTFmodel: PBGltfContainer = { src:  ringShape }

  //   alice = new NPC(
  //     {
  //       position: Vector3.create(135, 2.25, 159),
  //       rotation: Quaternion.fromEulerDegrees(0, 150, 0),
  //     },
  //     resources.models.robots.alice,
  //     () => {
  //       // animations
  //       alice.playAnimation('Hello', true, 2)

  //       let dummyent = new Entity()
  //       dummyent.addComponent(
  //         new NPCDelay(2, () => {
  //           alice.playAnimation('Talk')
  //         })
  //       )
  //       engine.addEntity(dummyent)

  //       // sound
  //       alice.addComponentOrReplace(
  //         new AudioSource(resources.sounds.robots.alice)
  //       )
  //       alice.getComponent(AudioSource).playOnce()

  //       // dialog UI
  //       alice.talk(AliceDialog)
  //     },
  //     {
  //       faceUser: true,
  //       portrait: {
  //         path: 'images/portraits/alice.png',
  //         height: 256,
  //         width: 256,
  //         section: {
  //           sourceHeight: 384,
  //           sourceWidth: 384,
  //         },
  //       },
  //       onlyETrigger: true,
  //     }
  //   )

  //   tutorialEnableObservable.add((tutorialEnabled) => {
  //     let scale: Vector3 = tutorialEnabled ? Vector3.Zero() : Vector3.One()
  //     alice.getComponent(Transform).scale = scale
  //   })

  //   const aliceRings = new Entity()
  //   aliceRings.addComponent(ringShape)
  //   aliceRings.addComponent(
  //     new Transform({
  //       position: Vector3.create(0, -0.65, 0),
  //     })
  //   )
  //   aliceRings.setParent(alice)

  ron = npc.create( 
    {
      position: Vector3.create(297, 11.365, 123),
      rotation: Quaternion.fromEulerDegrees(0, -110, 0),
    },
    //NPC Data Object
    {
      type: npc.NPCType.CUSTOM,
      model: resources.models.robots.ron,
      portrait: { 
        path: 'images/portraits/ron.png',
        height: 256,
        width: 256,
        section: {
          sourceHeight: 384,
          sourceWidth: 384,
        },
      },
      faceUser: true,
      dialogSound: resources.sounds.robots.alice,
      onActivate: () => {
        console.log('npc activated')
        npc.playAnimation(ron, 'Talk')        
        npc.talk(ron, RonDialog, 0 )
      },
    }
  )

  // ron = new NPC(
  //   {
  //     position: Vector3.create(297, 11.365, 123),
  //     rotation: Quaternion.fromEulerDegrees(0, -110, 0),
  //   },
  //   resources.models.robots.ron,
  //   () => {
  //     // animations
  //     ron.playAnimation('Hello', true, 2)

  //     let dummyent = new Entity()
  //     dummyent.addComponent(
  //       new NPCDelay(2, () => {
  //         ron.playAnimation('Talk')
  //       })
  //     )
  //     engine.addEntity(dummyent)

  //     // sound
  //     ron.addComponentOrReplace(new AudioSource(resources.sounds.robots.alice))
  //     ron.getComponent(AudioSource).playOnce()

  //     // dialog UI
  //     ron.talk(RonDialog)
  //   },
  //   {
  //     faceUser: true,
  //     portrait: {
  //       path: 'images/portraits/ron.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     onlyETrigger: true,
  //     reactDistance: 8,
  //     onWalkAway: () => {
  //       ron.playAnimation('Goodbye', true, 2)
  //     },
  //   }
  // )

  // const ronRings = new Entity()
  // ronRings.addComponent(ringShape)
  // ronRings.addComponent(
  //   new Transform({
  //     position: Vector3.create(0, -0.65, 0),
  //   })
  // )
  // ronRings.setParent(ron)

  bela = npc.create( 
    {
      position: Vector3.create(37.27, 4, 265.32),
      rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    },
    //NPC Data Object
    {
      type: npc.NPCType.CUSTOM,
      model: resources.models.robots.bela,
      portrait: { 
        path: 'images/portraits/bela.png',
        height: 256,
        width: 256,
        section: {
          sourceHeight: 384,
          sourceWidth: 384,
        },
      },
      faceUser: true,
      dialogSound: resources.sounds.robots.bela,
      onlyETrigger: true,
      onActivate: () => {
        console.log('npc activated')
        npc.playAnimation(bela, 'Talk')        
        npc.talk(bela, BelaDialog, 0 )
      },
    }
  )
  // bela = new NPC(
  //   {
  //     position: Vector3.create(37.27, 4, 265.32),
  //     rotation: Quaternion.fromEulerDegrees(0, 90, 0),
  //   },
  //   resources.models.robots.bela,
  //   () => {
  //     // animations
  //     bela.playAnimation('Hello', true, 2)

  //     let dummyent = new Entity()
  //     dummyent.addComponent(
  //       new NPCDelay(2, () => {
  //         bela.playAnimation('Talk')
  //       })
  //     )
  //     engine.addEntity(dummyent)

  //     // sound
  //     bela.addComponentOrReplace(new AudioSource(resources.sounds.robots.bela))
  //     bela.getComponent(AudioSource).playOnce()

  //     // dialog UI
  //     bela.talk(BelaDialog)
  //   },
  //   {
  //     faceUser: true,
  //     portrait: {
  //       path: 'images/portraits/bela.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     onlyETrigger: true,
  //     continueOnWalkAway: false,
  //   }
  // )

  // const belaRings = new Entity()
  // belaRings.addComponent(ringShape)
  // belaRings.addComponent(
  //   new Transform({
  //     position: Vector3.create(0, -0.65, 0),
  //   })
  // )
  // belaRings.setParent(bela)

  betty = npc.create( 
    {
      position: Vector3.create(117.657, 3.6, 39.98),
    },
    //NPC Data Object
    {
      type: npc.NPCType.CUSTOM,
      model: resources.models.robots.betty,
      portrait: { 
        path: 'images/portraits/betty.png',
        height: 256,
        width: 256,
        section: {
          sourceHeight: 384,
          sourceWidth: 384,
        },
      },
      faceUser: true,
      dialogSound: resources.sounds.robots.betty,
      onlyETrigger: true,
      onActivate: () => {
        console.log('npc activated')
        npc.playAnimation(betty, 'Talk')        
        npc.talk(betty, BettyDialog, 0 )
      },
    }
  )
//   const bettyRings = engine.addEntity()
//   GltfContainer.create(bettyRings, { src: ringShape })
//   Transform.create(bettyRings, {
//     parent: betty,
//     position: Vector3.create(0, -0.65, 0),
//   })

  // betty = new NPC(
  //   {
  //     position: Vector3.create(117.657, 3.6, 39.98),
  //   },
  //   resources.models.robots.betty,
  //   () => {
  //     // animations
  //     betty.playAnimation('Hello', true, 2)

  //     let dummyent = new Entity()
  //     dummyent.addComponent(
  //       new NPCDelay(2, () => {
  //         bela.playAnimation('Talk')
  //       })
  //     )
  //     engine.addEntity(dummyent)

  //     // sound
  //     betty.addComponentOrReplace(
  //       new AudioSource(resources.sounds.robots.betty)
  //     )
  //     betty.getComponent(AudioSource).playOnce()

  //     // dialog UI
  //     betty.talk(BettyDialog)
  //   },
  //   {
  //     faceUser: true,
  //     portrait: {
  //       path: 'images/portraits/betty.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     onlyETrigger: true,
  //     reactDistance: 8,
  //     onWalkAway: () => {
  //       betty.playAnimation('Goodbye', true, 2)
  //     },
  //   }
  // )

  // const bettyRings = new Entity()
  // bettyRings.addComponent(ringShape)
  // bettyRings.addComponent(
  //   new Transform({
  //     position: Vector3.create(0, -0.65, 0),
  //   })
  // )
  // belaRings.setParent(betty)

  charlie = npc.create( 
    {
      position: Vector3.create(269.5, 5.35, 42.6),
      rotation: Quaternion.fromEulerDegrees(0, -90, 0),
    },
    //NPC Data Object
    {
      type: npc.NPCType.CUSTOM,
      model: resources.models.robots.charlie,
      portrait: { 
        path: 'images/portraits/charlie.png',
        height: 256,
        width: 256,
        section: {
          sourceHeight: 384,
          sourceWidth: 384,
        },
      },
      faceUser: true,
      dialogSound: resources.sounds.robots.charlie,
      onlyETrigger: true,
      onActivate: () => {
        console.log('npc activated')
        npc.playAnimation(charlie, 'Talk')        
        npc.talk(charlie, CharlieDialog, 0 )
      },
    }
  )
  const charlieRings = engine.addEntity()
  GltfContainer.create(charlieRings, ringGLTFmodel)
  Transform.create(charlieRings, {
    parent: charlie,
    position: Vector3.create(0, -0.65, 0),
  })

  // charlie = new NPC(
  //   {
  //     position: Vector3.create(269.5, 5.35, 42.6),
  //     rotation: Quaternion.fromEulerDegrees(0, -90, 0),
  //   },
  //   resources.models.robots.charlie,
  //   () => {
  //     // animations
  //     charlie.playAnimation('Hello', true, 2)

  //     let dummyent = new Entity()
  //     dummyent.addComponent(
  //       new NPCDelay(2, () => {
  //         bela.playAnimation('Talk')
  //       })
  //     )
  //     engine.addEntity(dummyent)

  //     // sound
  //     charlie.addComponentOrReplace(
  //       new AudioSource(resources.sounds.robots.charlie)
  //     )
  //     charlie.getComponent(AudioSource).playOnce()

  //     // dialog UI
  //     charlie.talk(CharlieDialog)
  //   },
  //   {
  //     faceUser: true,
  //     portrait: {
  //       path: 'images/portraits/charlie.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     onlyETrigger: true,
  //     reactDistance: 8,
  //     onWalkAway: () => {
  //       charlie.playAnimation('Goodbye', true, 2)
  //     },
  //   }
  // )

  marsha = npc.create( 
    {
      position: Vector3.create(50.945, 9.65, 31.1),
    },
    //NPC Data Object
    {
      type: npc.NPCType.CUSTOM,
      model: resources.models.robots.marsha,
      portrait: { 
        path: 'images/portraits/marsha.png',
        height: 256,
        width: 256,
        section: {
          sourceHeight: 384,
          sourceWidth: 384,
        },
      },
      faceUser: true,
      dialogSound: resources.sounds.robots.marsha,
      onlyETrigger: true,
      onActivate: () => {
        console.log('npc activated')
        npc.playAnimation(marsha, 'Talk')        
        npc.talk(marsha, MarshaDialog, 0 )
      },
    }
  )

//   const marshaRings = engine.addEntity()
//   GltfContainer.create(marshaRings, {src: ringShape})
//   Transform.create(marshaRings, {
//     parent: marsha,
//     position: Vector3.create(0, -0.65, 0),
//   })

  // marshaRings.setParent(marsha)
  // marsha = new NPC(
  //   {
  //     position: Vector3.create(50.945, 9.65, 31.1),
  //   },
  //   resources.models.robots.marsha,
  //   () => {
  //     // animations
  //     marsha.playAnimation('Hello', true, 2)

  //     let dummyent = new Entity()
  //     dummyent.addComponent(
  //       new NPCDelay(2, () => {
  //         bela.playAnimation('Talk')
  //       })
  //     )
  //     engine.addEntity(dummyent)

  //     // sound
  //     marsha.addComponentOrReplace(
  //       new AudioSource(resources.sounds.robots.marsha)
  //     )
  //     marsha.getComponent(AudioSource).playOnce()

  //     // dialog UI
  //     marsha.talk(MarshaDialog)
  //   },
  //   {
  //     faceUser: true,
  //     portrait: {
  //       path: 'images/portraits/marsha.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     onlyETrigger: true,
  //     reactDistance: 8,
  //     onWalkAway: () => {
  //       marsha.playAnimation('Goodbye', true, 2)
  //     },
  //   }
  // )

  // bob = npc.create( 
  //   {
  //     position: Vector3.create(119.7, 11.5, 280.3),
  //     //position: Vector3.create(165.573, 11.5, 252.79),
  //     rotation: Quaternion.fromEulerDegrees(0, 35, 0),
  //   },
  //   //NPC Data Object
  //   {
  //     type: npc.NPCType.CUSTOM,
  //     model: resources.models.robots.bob,
  //     portrait: { 
  //       path: 'images/portraits/bob.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     faceUser: true,
  //     dialogSound: resources.sounds.robots.bob,
  //     onActivate: () => {
  //       console.log('npc activated')
  //       npc.playAnimation(bob, 'Talk')        
  //       npc.talk(bob, BobDialog, 0 )
  //     },
  //   }
  // )

  // bob = new NPC(
  //   {
  //     position: Vector3.create(165.573, 11.5, 252.79),
  //     rotation: Quaternion.fromEulerDegrees(0, 35, 0),
  //   },
  //   resources.models.robots.bob,
  //   () => {
  //     // animations
  //     bob.playAnimation('Hello', true, 2)

  //     let dummyent = new Entity()
  //     dummyent.addComponent(
  //       new NPCDelay(2, () => {
  //         bela.playAnimation('Talk')
  //       })
  //     )
  //     engine.addEntity(dummyent)

  //     // sound
  //     bob.addComponentOrReplace(new AudioSource(resources.sounds.robots.bob))
  //     bob.getComponent(AudioSource).playOnce()

  //     // dialog UI
  //     bob.talk(BobDialog)
  //   },
  //   {
  //     faceUser: true,
  //     portrait: {
  //       path: 'images/portraits/bob.png',
  //       height: 256,
  //       width: 256,
  //       section: {
  //         sourceHeight: 384,
  //         sourceWidth: 384,
  //       },
  //     },
  //     onlyETrigger: true,
  //     reactDistance: 8,
  //     onWalkAway: () => {
  //       bob.playAnimation('Goodbye', true, 2)
  //     },
  //   }
  // )

  // const bobRings = new Entity()
  // bobRings.addComponent(ringShape)
  // bobRings.addComponent(
  //   new Transform({
  //     position: Vector3.create(0, -0.65, 0),
  //   })
  // )
  // bobRings.setParent(bob)
}
