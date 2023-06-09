import { InputAction, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, Transform, TransformType, engine, pointerEventsSystem } from "@dcl/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { getEvents } from "../../lobby/checkApi"
import { _teleportTo } from "../../back-ports/backPorts"


function addPanel(textureUrl:string, alphaTextureUrl:string, _transform:TransformType,_coordX:number, _coordY:number ){

  let panel = engine.addEntity()
  MeshRenderer.setPlane(panel)
  MeshCollider.setPlane(panel)
  Transform.create(panel,{
    position: _transform.position,
    rotation: _transform.rotation,
    scale: Vector3.create(_transform.scale.x , _transform.scale.y, _transform.scale.z)
  })
  Material.setPbrMaterial(panel, {
    texture: Material.Texture.Common({
        src: textureUrl       
    }),
    alphaTexture: Material.Texture.Common({
        src: alphaTextureUrl
    }),
    emissiveTexture: Material.Texture.Common({
        src: textureUrl
    }),
    transparencyMode:MaterialTransparencyMode.MTM_ALPHA_TEST,
    emissiveIntensity: 2,
    emissiveColor: Color3.Gray(),
    specularIntensity: 0,
    metallic: 0,
    roughness: 1
  })

  pointerEventsSystem.onPointerDown(
    {
      entity:panel,
      opts: { hoverText: 'VISIT SCENE', button: InputAction.IA_POINTER }
    },
    (e) => {
      //TODO ADD ANALYTICS
      _teleportTo( _coordX , _coordY)      
    }
  )
}

export async function addTVPanels() {

    let events = await getEvents(4)

    if(events){

      if(events.length > 0){
        addPanel(
          events[0].image, 
          "images/rounded_alpha.png", 
          {
            position: Vector3.create(160 - 128, 4.65, 140.4 - 112),
            rotation: Quaternion.fromEulerDegrees(-33, 180, 0),
            scale: Vector3.create(2.8, 1.55, 1.55)
          },
          events[0].coordinates[0],
          events[0].coordinates[1],
        ) 
      }
       
    if(events.length > 1){
      addPanel(
        events[1].image, 
        "images/rounded_alpha.png", 
        {
          position: Vector3.create(157.4-128, 4.65, 137.8-112),
          rotation: Quaternion.fromEulerDegrees(-33, 90, 0),
          scale: Vector3.create(2.8, 1.55, 1.55),
        },
        events[1].coordinates[0],
        events[1].coordinates[1],
      )  
    }

    if(events.length > 2){  
      addPanel(
        events[2].image, 
        "images/rounded_alpha.png", 
        {
          position: Vector3.create(160 -128, 4.65, 135.25 - 112),
          rotation: Quaternion.fromEulerDegrees(-33, 0, 0),
          scale: Vector3.create(2.8, 1.55, 1.55),
        },
        events[2].coordinates[0],
        events[2].coordinates[1],
      )  
    }

    if(events.length > 3){
      addPanel(
        events[3].image, 
        "images/rounded_alpha.png", 
        {
          position: Vector3.create(162.6 - 128, 4.65, 137.8 - 112),
          rotation: Quaternion.fromEulerDegrees(-33, 270, 0),
          scale: Vector3.create(2.8, 1.55, 1.55),
        },
        events[3].coordinates[0],
        events[3].coordinates[1],
      )  
    }
    }  
  }
