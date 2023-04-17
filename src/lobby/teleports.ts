//import {} from '../modules/ui' // prevents package not found bug
import { TransformTypeWithOptionals } from "@dcl/sdk/ecs"
import {lobbyCenter, lobbyHeight} from "./resources/globals"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

export enum Locations {
  CROWD = 'crowd',
  MAGIC = 'magic',
  KOKO = '-39,58',
  SALMONOMICON = '-52,1',
  DRAGONRUSH = '-43,53',
  MUSEUM = '16,83',
  TOMBCHASER = '12,46',
  BLOCK = '61,-27',
  FRUIT = '59,133',
  CASTLE = '-134,-121',
  INFINITY = '-71,-38',
  MOLES = '59,135',
  PRESENT = '-40,-49',
  CASINO = '-55,143',
  TOKI = '28,45',
}
//TODO TAG:PORT-REIMPLEMENT-ME
/*
export class Teleport extends Entity {
  model: PBGltfContainer
  location: Locations
  name: string
  description?: string
  constructor(
    model: PBGltfContainer,
    transform: TranformConstructorArgs,
    location: Locations,
    name: string,
    description: string
  ) {
    super()
    engine.addEntity(this)

    this.addComponent(model)
    this.addComponent(new Transform(transform))

    this.name = name
    this.location = location

    let thisTeleport = this

    this.addComponent(
      new OnPointerDown(
        async function () {
          teleportTo(thisTeleport.location)
        },
        {
          button: ActionButton.POINTER,
          hoverText: this.name,
        }
      )
    )

    let Particles = new Entity()
    Particles.addComponent(new GLTFShape('models/particles.glb'))
    Particles.setParent(this)

    let teleportFloor = new Entity()
    teleportFloor.addComponent(new GLTFShape('models/teleports/teleport.glb'))
    teleportFloor.addComponent({}))
    teleportFloor.setParent(this)
  }
}
*/
// export function placeTeleports() {
//   // artichoke & garden
//   let teleportPos1 = {
//     position: Vector3.create(81.7, 0.3, 18.45),
//     rotation: Quaternion.fromEulerDegrees(0, 0, 0),
//   })

//   // garden & hallway
//   let teleportPos2 = {
//     position: Vector3.create(100.19, 0.3, 69),
//     rotation: Quaternion.fromEulerDegrees(0, 225, 0),
//   })

//   // garden & market
//   let teleportPos3 = {
//     position: Vector3.create(177.5, 0.3, 51),
//     rotation: Quaternion.fromEulerDegrees(0, 0, 0),
//   })

//   // garden & rock
//   let teleportPos4 = {
//     position: Vector3.create(189.84, 0.3, 68),
//     rotation: Quaternion.fromEulerDegrees(0, 270, 0),
//   })

//   // rock & market
//   let teleportPos5 = {
//     position: Vector3.create(210.19, 0.45, 68.8),
//     rotation: Quaternion.fromEulerDegrees(0, 90, 0),
//   })

//   // sculpture & wearables
//   let teleportPos6 = {
//     position: Vector3.create(211.19, 0.3, 119.5),
//     rotation: Quaternion.fromEulerDegrees(0, 270, 0),
//   })

//   // wearables - west
//   let teleportPos7 = {
//     position: Vector3.create(226.8, 0.3, 132.8),
//     rotation: Quaternion.fromEulerDegrees(0, 90, 0),
//   })

//   // wearables - NW
//   let teleportPos8 = {
//     position: Vector3.create(228.3, 0.45, 168.8),
//     rotation: Quaternion.fromEulerDegrees(0, 135, 0),
//   })

//   // wearables - N
//   let teleportPos9 = {
//     position: Vector3.create(261.2, 0.3, 174.4),
//     rotation: Quaternion.fromEulerDegrees(0, 135, 0),
//   })

//   // whale - S
//   let teleportPos10 = {
//     position: Vector3.create(222.7, 0.45, 203.8),
//     rotation: Quaternion.fromEulerDegrees(0, 45, 0),
//   })

//   // center - N
//   let teleportPos11 = {
//     position: Vector3.create(174.71, 0.4, 209.8),
//     rotation: Quaternion.fromEulerDegrees(0, 45, 0),
//   })

//   // whale & mountains
//   let teleportPos12 = {
//     position: Vector3.create(97.63, 0.3, 249.46),
//     rotation: Quaternion.fromEulerDegrees(0, 0, 0),
//   })

//   // tower- east
//   let teleportPos13 = {
//     position: Vector3.create(89.42, 0.3, 101.4),
//     rotation: Quaternion.fromEulerDegrees(0, 0, 0),
//   })

//   // tower- south
//   let teleportPos14 = {
//     position: Vector3.create(17.44, 0.25, 75.3),
//     rotation: Quaternion.fromEulerDegrees(0, 45, 0),
//   })

//   // center - N2
//   let teleportPos15 = {
//     position: Vector3.create(145.45, 0.7, 210),
//     rotation: Quaternion.fromEulerDegrees(0, 45, 0),
//   })

//   let teleports = [
//     {
//       name: 'Dragon Rush',
//       model: new GLTFShape('models/teleports/dragon_rush.glb'),
//       location: Locations.DRAGONRUSH,
//       transform: teleportPos1,
//       description:
//         'Fly on the back of a dragon, need we\nsay more?\nScene by the amusement park district.',
//     },
//     {
//       name: 'Toki Toki Land',
//       model: new GLTFShape('models/teleports/toki_land.glb'),
//       location: Locations.TOKI,
//       transform: teleportPos2,
//       description:
//         'A christmas themed adventure.\nSave the Toki Tokis from\nan evil snowman and his henchmen.',
//     },
//     {
//       name: 'Random amazing scene',
//       model: new GLTFShape('models/teleports/star.glb'),
//       location: Locations.MAGIC,
//       transform: teleportPos3,
//       description:
//         'Visit a random scene from\na curated list of amazing places!\n',
//     },
//     {
//       name: 'Block Runner',
//       model: new GLTFShape('models/teleports/block_runner.glb'),
//       location: Locations.BLOCK,
//       transform: teleportPos4,
//       description:
//         'A collection of competitive minigames\nthat are a lot of fun to play!\n',
//     },
//     {
//       name: 'Serenity Island Casino',
//       model: new GLTFShape('models/teleports/roulette.glb'),
//       location: Locations.CASINO,
//       transform: teleportPos5,
//       description:
//         'Play roulette and slot machines in a\nluxurious casino by the shore!\n',
//     },
//     {
//       name: 'Koko Jones',
//       model: new GLTFShape('models/teleports/koko_jones.glb'),
//       location: Locations.KOKO,
//       transform: teleportPos6,
//       description:
//         'Visit the temple of eternal bananas\nto collect gems and face evil monkeys\nScene by the amusement park district.',
//     },
//     {
//       name: 'Fruit Catcher',
//       model: new GLTFShape('models/teleports/fruit_catcher.glb'),
//       location: Locations.FRUIT,
//       transform: teleportPos7,
//       description:
//         'Catch as many fruits as you can,\navoid bombs! Compete for the\nhighest score!',
//     },
//     {
//       name: 'Random amazing scene',
//       model: new GLTFShape('models/teleports/star.glb'),
//       location: Locations.MAGIC,
//       transform: teleportPos8,
//       description:
//         'Visit a random scene from\na curated list of amazing places!\n',
//     },
//     {
//       name: 'Join other players',
//       model: new GLTFShape('models/teleports/crowd.glb'),
//       location: Locations.CROWD,
//       transform: teleportPos9,
//       description:
//         'Teleport to the most crowded location\nin all of Decentraland to meet up\nwith other players!',
//     },
//     {
//       name: 'Book of Salmonomicon',
//       model: new GLTFShape('models/teleports/salmonomicon.glb'),
//       location: Locations.SALMONOMICON,
//       transform: teleportPos10,
//       description:
//         'In this bizarre horror-themed game\nhelp Mika out and defeat a\nterrible creature.',
//     },
//     {
//       name: 'Museum District',
//       model: new GLTFShape('models/teleports/museum_district.glb'),
//       location: Locations.MUSEUM,
//       transform: teleportPos11,
//       description:
//         'The Museum district houses works\nfrom digital and traditional artists.\nSuperb moving sculptures & paintings.',
//     },
//     {
//       name: 'Click a Mole',
//       model: new GLTFShape('models/teleports/click_a_mole.glb'),
//       location: Locations.MOLES,
//       transform: teleportPos12,
//       description: 'Whack the moles before they hide!\n\n',
//     },
//     {
//       name: 'Tomb Chaser',
//       model: new GLTFShape('models/teleports/tomb_chaser.glb'),
//       location: Locations.TOMBCHASER,
//       transform: teleportPos13,
//       description:
//         'Speed run through an ancient pyramid\navoiding obstacles as you try to keep\nup, in this exciting game.',
//     },
//     {
//       name: 'Infinity Engine',
//       model: new GLTFShape('models/teleports/infinity_engine.glb'),
//       location: Locations.INFINITY,
//       transform: teleportPos14,
//       description:
//         'Mine for loot underground, then\ndefend a train from\nbandits.',
//     },
//     {
//       name: 'Join other players',
//       model: new GLTFShape('models/teleports/crowd.glb'),
//       location: Locations.CROWD,
//       transform: teleportPos15,
//       description:
//         'Teleport to the most crowded location\nin all of Decentraland to meet up\nwith other players!',
//     },
//   ]

//   for (let i of teleports) {
//     let t = new Teleport(
//       i.model,
//       i.transform,
//       i.location,
//       i.name,
//       i.description
//     )
//   }
// }


  let count = 14
  let startAngle = 70
  let rangeAngle = 230
  let radius = 18
  let center = Vector3.create(lobbyCenter.x, lobbyHeight, lobbyCenter.z)
  let pos = []
  let rot = []
  for(let i=0; i<count; i++){
    const rotQ = Quaternion.fromEulerDegrees(0, startAngle + i*rangeAngle/count, 0)
    /*rotQ.x *= radius
    rotQ.y *= radius 
    rotQ.z *= radius*/

    let posVec = Vector3.add(center,Vector3.multiply(Vector3.rotate(Vector3.Forward(),rotQ),{x:radius,y:radius,z:radius}))
    //let posVec = center.add(Vector3.Forward().rotate(Quaternion.fromEulerDegrees(0, startAngle + i*rangeAngle/count, 0)).multiplyByFloats(radius,radius,radius))
    pos.push(posVec)

    let rotation = Quaternion.fromEulerDegrees(0,startAngle + 180 + (i*rangeAngle/count), 0)
    rot.push(rotation)

  }
 


  // artichoke & garden
  let teleportPos1:TransformTypeWithOptionals = {
    position: pos[0],
    rotation: rot[0],
  }

  // garden & hallway
  let teleportPos2:TransformTypeWithOptionals = {
    position: pos[1],
    rotation: rot[1],
  }

  // garden & market
  let teleportPos3:TransformTypeWithOptionals = {
    position: pos[2],
    rotation: rot[2],
  }

  // garden & rock
  let teleportPos4:TransformTypeWithOptionals = {
    position: pos[3],
    rotation: rot[3],
  }

  // rock & market
  let teleportPos5:TransformTypeWithOptionals = {
    position: pos[4],
    rotation: rot[4],
  }

  // sculpture & wearables
  let teleportPos6:TransformTypeWithOptionals = {
    position: pos[5],
    rotation: rot[5],
  }

  // wearables - west
  let teleportPos7:TransformTypeWithOptionals = {
    position: pos[6],
    rotation: rot[6],
  }

  // wearables - NW
  let teleportPos8:TransformTypeWithOptionals = {
    position: pos[7],
    rotation: rot[7],
  }

  // wearables - N
  let teleportPos9:TransformTypeWithOptionals = {
    position: pos[8],
    rotation: rot[8],
  }

  // whale - S
  let teleportPos10:TransformTypeWithOptionals = {
    position: pos[9],
    rotation: rot[9],
  }

  // center - N
  let teleportPos11:TransformTypeWithOptionals = {
    position: pos[10],
    rotation: rot[10],
  }

  // whale & mountains
  let teleportPos12:TransformTypeWithOptionals = {
    position: pos[11],
    rotation: rot[11],
  }

  // tower- east
  let teleportPos13:TransformTypeWithOptionals = {
    position: pos[12],
    rotation: rot[12],
  }

  // tower- south
  let teleportPos14:TransformTypeWithOptionals = {
    position: pos[13],
    rotation: rot[13],
  }

  // center - N2
  let teleportPos15:TransformTypeWithOptionals = {
    position: pos[14],
    rotation: rot[14],
  }

export let teleports = [
  {
    name: 'Dragon Rush',
    model: {src:'models/lobby/classics/dragon_rush.glb'},
    location: Locations.DRAGONRUSH,
    transform: teleportPos1,
    description:
      'Fly on the back of a dragon, need we\nsay more?\nScene by the amusement park district.',
  },
  {
    name: 'Toki Toki Land',
    model: {src:'models/lobby/classics/toki_land.glb'},
    location: Locations.TOKI,
    transform: teleportPos2,
    description:
      'A christmas themed adventure.\nSave the Toki Tokis from\nan evil snowman and his henchmen.',
  },
  // {
  //   name: 'Random amazing scene',
  //   model: new GLTFShape('models/teleports/star.glb'),
  //   location: Locations.MAGIC,
  //   transform: teleportPos3,
  //   description:
  //     'Visit a random scene from\na curated list of amazing places!\n',
  // },
  {
    name: 'Block Runner',
    model: {src:'models/lobby/classics/block_runner.glb'},
    location: Locations.BLOCK,
    transform: teleportPos4,
    description:
      'A collection of competitive minigames\nthat are a lot of fun to play!\n',
  },
  // {
  //   name: 'Serenity Island Casino',
  //   model: new GLTFShape('models/teleports/roulette.glb'),
  //   location: Locations.CASINO,
  //   transform: teleportPos5,
  //   description:
  //     'Play roulette and slot machines in a\nluxurious casino by the shore!\n',
  // },
  {
    name: 'Koko Jones',
    model: {src:'models/lobby/classics/koko_jones.glb'},
    location: Locations.KOKO,
    transform: teleportPos6,
    description:
      'Visit the temple of eternal bananas\nto collect gems and face evil monkeys\nScene by the amusement park district.',
  },
  {
    name: 'Fruit Catcher',
    model: {src:'models/lobby/classics/fruit_catcher.glb'},
    location: Locations.FRUIT,
    transform: teleportPos7,
    description:
      'Catch as many fruits as you can,\navoid bombs! Compete for the\nhighest score!',
  },
  // {
  //   name: 'Random amazing scene',
  //   model: new GLTFShape('models/teleports/star.glb'),
  //   location: Locations.MAGIC,
  //   transform: teleportPos8,
  //   description:
  //     'Visit a random scene from\na curated list of amazing places!\n',
  // },
  // {
  //   name: 'Join other players',
  //   model: new GLTFShape('models/teleports/crowd.glb'),
  //   location: Locations.CROWD,
  //   transform: teleportPos9,
  //   description:
  //     'Teleport to the most crowded location\nin all of Decentraland to meet up\nwith other players!',
  // },
  {
    name: 'Book of Salmonomicon',
    model: {src:'models/lobby/classics/salmonomicon.glb'},
    location: Locations.SALMONOMICON,
    transform: teleportPos10,
    description:
      'In this bizarre horror-themed game\nhelp Mika out and defeat a\nterrible creature.',
  },
  {
    name: 'Museum District',
    model: {src:'models/lobby/classics/museum_district.glb'},
    location: Locations.MUSEUM,
    transform: teleportPos11,
    description:
      'The Museum district houses works\nfrom digital and traditional artists.\nSuperb moving sculptures & paintings.',
  },
  // {
  //   name: 'Click a Mole',
  //   model: new GLTFShape('models/teleports/click_a_mole.glb'),
  //   location: Locations.MOLES,
  //   transform: teleportPos12,
  //   description: 'Whack the moles before they hide!\n\n',
  // },
  {
    name: 'Tomb Chaser',
    model: {src:'models/lobby/classics/tomb_chaser.glb'},
    location: Locations.TOMBCHASER,
    transform: teleportPos13,
    description:
      'Speed run through an ancient pyramid\navoiding obstacles as you try to keep\nup, in this exciting game.',
  },
  {
    name: 'Infinity Engine',
    model: {src:'models/lobby/classics/infinity_engine.glb'},
    location: Locations.INFINITY,
    transform: teleportPos14,
    description:
      'Mine for loot underground, then\ndefend a train from\nbandits.',
  },
  // {
  //   name: 'Join other players',
  //   model: new GLTFShape('models/teleports/crowd.glb'),
  //   location: Locations.CROWD,
  //   transform: teleportPos15,
  //   description:
  //     'Teleport to the most crowded location\nin all of Decentraland to meet up\nwith other players!',
  // },
]

// for (let i of teleports) {
//   let t = new Teleport(
//     i.model,
//     i.transform,
//     i.location,
//     i.name,
//     i.description
//   )
// }

