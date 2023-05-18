import { engine, executeTask, GltfContainer, InputAction, Material, pointerEventsSystem, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { _openExternalURL, log } from '../back-ports/backPorts'
import { coreBuildingOffset } from '../lobby/resources/globals'


export function addBuildings() {
  log("addBuildings")
    // CLOUD LOBBY

  // add lobby platform + teleport beam
  let lobby = engine.addEntity()
  GltfContainer.create(lobby,{src:'models/lobby/lobby_platform.glb'})
  Transform.create(lobby,{
      position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  
  //TODO TAG:PORT-REIMPLEMENT-ME
  //TODO TAG:OUTSIDE-AREA
  /*  
  // AGORA BUILDING

  // add agora
  let agora = engine.addEntity()
  GltfContainer.create(agora,{src:'models/agora.glb'})
  Transform.create(agora,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  // L' ARTICHOKE

  //add artichoke_building
  let artichoke = engine.addEntity()
  GltfContainer.create(artichoke,{src:'models/artichoke.glb'})
  Transform.create(artichoke,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  // THE HALLWAY (PICTURES FRAMES & NFTs)

  //add hallway
  let hallway = engine.addEntity()
  GltfContainer.create(hallway,{src:'models/hallway.glb'})
  Transform.create(hallway,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  // THE MOUNTAINS (TUTORIAL SPACE)

  //add mountains
  let mountains = engine.addEntity()
  GltfContainer.create(mountains,{src:'models/mountains.glb'})
  Transform.create(mountains,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  // MOON TOWER

  //add moon_tower_building
  let moon_tower = engine.addEntity()
  GltfContainer.create(moon_tower,{src:'models/moon-tower.glb'})
  Transform.create(moon_tower,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  //add MoonTower_Action_Cosmos
  let MoonTower_Action_Cosmos = engine.addEntity()
  MoonTower_Action_Cosmos.addComponent(
    new GLTFShape('models/MoonTower_Action_Cosmos.glb')
  )
  MoonTower_Action_Cosmos.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  engine.addEntity(MoonTower_Action_Cosmos)

  //add MoonTower_Action_Moon
  let MoonTower_Action_Moon = engine.addEntity()
  MoonTower_Action_Moon.addComponent(
    new GLTFShape('models/MoonTower_Action_Moon.glb')
  )
  MoonTower_Action_Moon.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  const MoonTower_Action_MoonAnimator = new Animator()
  MoonTower_Action_Moon.addComponent(MoonTower_Action_MoonAnimator)
  let playMoonTower_Action_Moon = new AnimationState(
    'MoonTower_Action_MoonDark.001'
  )
  MoonTower_Action_MoonAnimator.addClip(playMoonTower_Action_Moon)
  playMoonTower_Action_Moon.play()
  engine.addEntity(MoonTower_Action_Moon)

  //add MoonTower_Action_Ringu
  let MoonTower_Action_Ringu = engine.addEntity()
  MoonTower_Action_Ringu.addComponent(
    new GLTFShape('models/MoonTower_Action_Ringu.glb')
  )
  MoonTower_Action_Ringu.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  engine.addEntity(MoonTower_Action_Ringu)

  //add Text_A
  let Text_A = engine.addEntity()
  Text_A.addComponent(new GLTFShape('models/Text_A.glb'))
  Text_A.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  engine.addEntity(Text_A)

  //add Text_B
  let Text_B = engine.addEntity()
  Text_B.addComponent(new GLTFShape('models/Text_B.glb'))
  Text_B.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  engine.addEntity(Text_B)

  //add Text_C
  let Text_C = engine.addEntity()
  Text_C.addComponent(new GLTFShape('models/Text_C.glb'))
  Text_C.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  engine.addEntity(Text_C)
  */
 
  /*
  let ethLogos = engine.addEntity()
  GltfContainer.create(ethLogos,{src:'models/core_building/Eth_Details.glb'})
  Transform.create(ethLogos,{
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
  })
  //add flare
  let flare = engine.addEntity()
  GltfContainer.create(flare,{src:'models/flare.glb'})
  Transform.create(flare,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  
  //add TheWhale_Action_Sculpture
  let TheWhale_Action_Sculpture = engine.addEntity()
  GltfContainer.create(TheWhale_Action_Sculpture,{src:'models/TheWhale_Action_Sculpture.glb'})
  Transform.create(TheWhale_Action_Sculpture,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  */

  //CORE BUILDING

  //add core_building
  let core_building = engine.addEntity()
  GltfContainer.create(core_building,{src:'models/core_building_cutoutVersion.glb'})
  Transform.create(core_building,{
      position: Vector3.create(32,0,40),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  //add msg_welcome
  let msg_welcome = engine.addEntity()
  GltfContainer.create(msg_welcome,{src:'models/msg_welcome.glb'})
  Transform.create(msg_welcome,{
      position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  
 /*
  //add core_art
  let core_art = engine.addEntity()
  GltfContainer.create(core_art,{src:'models/core_art.glb'})
  Transform.create(core_art,{
      position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  */
  
  //TODO TAG:PORT-REIMPLEMENT-ME
  //TODO TAG:OUTSIDE-AREA
  /*
  // THE GARDEN (CREATORS BUILDING)

  //add garden
  let garden = engine.addEntity()
  garden.addComponent(new GLTFShape('models/garden.glb'))
  garden.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  //CONFERENCE BUILDING

  //add auditorium
  let auditorium = engine.addEntity()
  auditorium.addComponent(new GLTFShape('models/auditorium.glb'))
  auditorium.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  // SHALE BUILDING

  //add shell_building
  let shell = engine.addEntity()
  shell.addComponent(new GLTFShape('models/shell.glb'))
  shell.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  //add shoe_prop
  let shoe_prop = engine.addEntity()
  shoe_prop.addComponent(new GLTFShape('models/shoe_prop.glb'))
  shoe_prop.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  //add tshirt_prop
  let tshirt_prop = engine.addEntity()
  tshirt_prop.addComponent(new GLTFShape('models/tshirt_prop.glb'))
  tshirt_prop.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  //WHALE BUILDING (WEARABLES NFTs)

  //add whale
  let whale = engine.addEntity()
  whale.addComponent(new GLTFShape('models/whale.glb'))
  whale.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )
  engine.addEntity(whale)

  // TRADING CENTER

  //add trading_center
  let trading_center = engine.addEntity()
  trading_center.addComponent(new GLTFShape('models/trading_center.glb'))
  trading_center.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  //add trading_land
  let trading_land = engine.addEntity()
  trading_land.addComponent(new GLTFShape('models/trading_land.glb'))
  trading_land.addComponent(
    new Transform({
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  )

  //add trading_crypto
  let trading_crypto = engine.addEntity()
  GltfContainer.create(trading_crypto,{src:'models/trading_crypto.glb'})
  Transform.create(trading_crypto,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  

  //add trading_wearables
  let trading_wearables = engine.addEntity()
  GltfContainer.create(trading_wearables,{src:'models/trading_wearables.glb'})
  Transform.create(trading_wearables,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  */

  //STREET MESH

  /*
  //add street
  let street = engine.addEntity()
  GltfContainer.create(street,{src:'models/street.glb'})
  Transform.create(street,{
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
  
 */

/*
 //add vogu_pod
 let vogu_pod = engine.addEntity()
 GltfContainer.create(vogu_pod,{src:'models/vogu_pod.glb'})
 Transform.create(vogu_pod,{
     rotation: Quaternion.fromEulerDegrees(0, 180, 0),
   })
 

   pointerEventsSystem.onPointerDown(vogu_pod,
    (e) => {
      _openExternalURL("https://assembly.thevogu.io/ ")
    },
    { hoverText: 'Visit VOGU site', button: InputAction.IA_POINTER }
  )
 */

}
/*
//add zepellin
let zepellin = engine.addEntity()
GltfContainer.create(zepellin,{src:'models/zepellin.glb'})
Transform.create(zepellin,{
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
  })
*/

//add eth logos in bar
let ethLogos = engine.addEntity()
GltfContainer.create(ethLogos,{src:'models/core_building/Eth_Details.glb'})
Transform.create(ethLogos,{
    position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
  })


let ethLogos_02 = engine.addEntity()
GltfContainer.create(ethLogos_02,{src:'models/core_building/Eth_Details_02.glb'})
Transform.create(ethLogos_02,{
    position: Vector3.create(0 - coreBuildingOffset.x, 0, 0 - coreBuildingOffset.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
  })

