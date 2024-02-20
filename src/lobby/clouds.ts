import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import {coreBuildingOffset, lobbyCenter, lobbyHeight, lobbyHeightLegacy, lobbyRadius} from './resources/globals'
import * as resource from "./resources/resources"
import { ComponentType, Entity, GltfContainer, Schemas, Transform, engine } from '@dcl/sdk/ecs'
import { log } from '../back-ports/backPorts'


function addClouds(_count:number, _radius:number, _center:Vector3){
  log("addClouds",_radius,_center) 
  
    let angle = 0
    let pos = Vector3.Forward()
    let stepAngle = 360/_count
    let randScale = 1 

    for(let i = 0; i< _count; i++){
        angle = i*stepAngle

        //pos = _center.add(Vector3.Forward().rotate(Quaternion.Euler(0,angle+Math.random()*20,0)).multiplyByFloats(offset, offset ,offset))
        

        let offset = _radius + Math.random()*20
        const rot = Quaternion.fromEulerDegrees(0,angle+Math.random()*20,0)
        /*rot.x *= offset
        rot.y *= offset
        rot.z *= offset*/

        pos = Vector3.add(_center,Vector3.multiply(Vector3.rotate(Vector3.Forward(),rot),{x:offset,y:offset,z:offset}))
        //pos = _center.add(Vector3.Forward().rotate()
        randScale = 1+Math.random()*3
        let cloudDissolve = engine.addEntity()
        GltfContainer.create(cloudDissolve,resource.cloudPuffShape)
        
        Transform.create(cloudDissolve,{
              position: Vector3.create(pos.x, pos.y-Math.random()*3, pos.z),
              rotation: Quaternion.fromEulerDegrees(Math.random()*360, Math.random()*360, Math.random()*360),
              scale: Vector3.create(randScale, randScale, randScale)
          })
        
        
    }
}

function addCloudRotate(entity:Entity,left: boolean, speed: number) {
  //cloudsBig.addComponent(new CloudRotate(true,1))
  /*CloudRotateComponent.create(entity,{
    left:left,
    speed: speed
  })*/
  utils.perpetualMotions.startRotation(entity,Quaternion.fromEulerDegrees(0, left ? speed : speed * -1,0))
}

export function initClouds(){
      addClouds(
        16, 
        20, 
        Vector3.create(lobbyCenter.x - coreBuildingOffset.x, lobbyHeight, lobbyCenter.z - coreBuildingOffset.z)
      )


      let cloudsSmall = engine.addEntity()
      
      
      Transform.create(cloudsSmall,{
          position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x,lobbyHeight -0.2 ,lobbyCenter.z - coreBuildingOffset.z),
          rotation: Quaternion.fromEulerDegrees(0, 0, 0),
          scale: Vector3.create(1.0,1.0,1.0)          
      })
    
      GltfContainer.create(cloudsSmall,resource.cloudSmallShape)
      addCloudRotate(cloudsSmall,false,2)
      

      let cloudsSmall2 = engine.addEntity()
      
      Transform.create(cloudsSmall2,{
            position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x,lobbyHeight-0.2,lobbyCenter.z - coreBuildingOffset.z),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),          
        })
      
      GltfContainer.create(cloudsSmall2,resource.cloudSmall2Shape)
      addCloudRotate(cloudsSmall2,true,1.5)
      

      let cloudsBig = engine.addEntity()
      
      //have to lower because when scaled down gets in way of models
      const bigCloudOffset = -1
      Transform.create(cloudsBig,{
            position: Vector3.create(lobbyCenter.x - coreBuildingOffset.x ,lobbyHeight + bigCloudOffset ,lobbyCenter.z - coreBuildingOffset.z),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),          
            //scale: Vector3.create(.45,.45,.45)
            scale: Vector3.create(1.2,1.2,1.2)
        })
      
      GltfContainer.create(cloudsBig, resource.cloudBigShape)

      let cloudSpiral = engine.addEntity()      
      
      Transform.create(cloudSpiral,{
            position: Vector3.create(lobbyCenter.x  ,lobbyHeight +5  ,lobbyCenter.z),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),          
            //scale: Vector3.create(.45,.45,.45)
            scale: Vector3.create(1,1,1)
        })
      
      GltfContainer.create(cloudSpiral, resource.cloudSpiralShape)
      //FIXME //cannot rotate these for now due to shape of parcel and shape of clouds. maybe ping pong them for now?
      //addCloudRotate(cloudsBig,true,1)

    
      
}