import { InputAction, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, Transform, TransformType, engine, pointerEventsSystem } from "@dcl/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { getEvents } from "../../lobby/checkApi"
import { _teleportTo } from "../../back-ports/backPorts"
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction } from "../stats/analyticsComponents"
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES } from "../stats/AnalyticsConfig"


function addPanel(textureUrl:string, alphaTextureUrl:string, _transform:TransformType,_coordX:number, _coordY:number, eventData:any ){

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

  let eventId:string=eventData.id
  let eventName:string=eventData.name

  TrackingElement.create(panel, {
    guid: generateGUID(),
    elementType: ANALYTICS_ELEMENTS_TYPES.interactable,
    elementId: ANALYTICS_ELEMENTS_IDS.barTvPanel,
    parent: getRegisteredAnalyticsEntity(ANALYTICS_ELEMENTS_IDS.bar)
  })

  pointerEventsSystem.onPointerDown(
    {
      entity:panel,
      opts: { hoverText: 'VISIT SCENE', button: InputAction.IA_POINTER }
    },
    (e) => {
      trackAction(panel, "click", eventId, (_coordX + ',' + _coordY+":"+eventName))
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
            position: Vector3.create(160 , 4.65, 140.4),
            rotation: Quaternion.fromEulerDegrees(-33, 180, 0),
            scale: Vector3.create(2.8, 1.55, 1.55)
          },
          events[0].coordinates[0],
          events[0].coordinates[1],
          events[0]
        ) 
      }
       
    if(events.length > 1){
      addPanel(
        events[1].image, 
        "images/rounded_alpha.png", 
        {
          position: Vector3.create(157.4, 4.65, 137.8),
          rotation: Quaternion.fromEulerDegrees(-33, 90, 0),
          scale: Vector3.create(2.8, 1.55, 1.55),
        },
        events[1].coordinates[0],
        events[1].coordinates[1],
        events[1]
      )  
    }

    if(events.length > 2){  
      addPanel(
        events[2].image, 
        "images/rounded_alpha.png", 
        {
          position: Vector3.create(160, 4.65, 135.25),
          rotation: Quaternion.fromEulerDegrees(-33, 0, 0),
          scale: Vector3.create(2.8, 1.55, 1.55),
        },
        events[2].coordinates[0],
        events[2].coordinates[1],
        events[2]
      )  
    }

    if(events.length > 3){
      addPanel(
        events[3].image, 
        "images/rounded_alpha.png", 
        {
          position: Vector3.create(162.6, 4.65, 137.8),
          rotation: Quaternion.fromEulerDegrees(-33, 270, 0),
          scale: Vector3.create(2.8, 1.55, 1.55),
        },
        events[3].coordinates[0],
        events[3].coordinates[1],
        events[3]
      )  
    }
    }  
  }
