import { Schemas, Transform, engine } from '@dcl/sdk/ecs'
import { NoArgCallBack } from './resources/globals'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

export const AnimatedItem = engine.defineComponent('animated-id', {
    wasClicked: Schemas.Boolean,
    isHighlighted: Schemas.Boolean,
    defaultPosition: Schemas.Vector3 ,
    highlightPosition: Schemas.Vector3 ,
    defaultScale: Schemas.Vector3 ,
    highlightScale: Schemas.Vector3 ,
    animFraction:Schemas.Number,
    animVeclocity:Schemas.Number,
    speed:Schemas.Number,   
    done:Schemas.Boolean,    
})

export const SlerpItem = engine.defineComponent('slerped-id', {    
    targetRotation: Schemas.Quaternion,   
    speed:Schemas.Number,   
    done:Schemas.Boolean,    
})

const SPRING_CONSTANT = 50

function LerpTowards(
    a_Target:Vector3,
    a_Current:Vector3,
    speed:number
    ):Vector3{
  
    return Vector3.lerp(a_Current, a_Target, speed)
  }
  
function distance(vec1:Vector3, vec2:Vector3):number{
    const a = vec1.x - vec2.x
    const b = vec1.y - vec2.y
    const c = vec1.z - vec2.z
    return Math.sqrt(a * a + b * b + c * c )
}
  
  //simple animator handler
export function ItemAnimationSystem(dt: number) {
    const animatedItems = engine.getEntitiesWith(AnimatedItem, Transform)
    const slerpedItems = engine.getEntitiesWith(SlerpItem, Transform)
    const snapThreshold = 0.25

    // POSITION AND SCALE
    for (const [entity] of animatedItems) {
        const info = AnimatedItem.getMutable(entity)
        const transform = Transform.getMutable(entity)
        let scaleDone = false
        let positionDone = false
        
        if(info.isHighlighted){     
            if(!info.done){         
                    
                if(distance(info.highlightPosition, transform.position) > snapThreshold){
                    transform.position = LerpTowards(info.highlightPosition, transform.position, info.speed)  
                }
                else{
                    Vector3.copyFrom(info.highlightPosition, transform.position)
                    positionDone = true
                }

                if(distance(info.highlightScale, transform.scale) > snapThreshold){
                    transform.scale = LerpTowards(info.highlightScale, transform.scale, info.speed)  
                }
                else{
                    Vector3.copyFrom(info.highlightScale, transform.scale)
                    scaleDone = true
                }

                if(positionDone && scaleDone){
                    info.done = true
                }
            }                   
        }
        else{
            if(!info.done){                    

                if(distance(info.defaultPosition, transform.position) > snapThreshold){
                    transform.position = LerpTowards(info.defaultPosition, transform.position, info.speed) 
                }
                else{
                    Vector3.copyFrom(info.defaultPosition, transform.position)
                    positionDone = true     
                } 

                if(distance(info.defaultScale, transform.scale) > snapThreshold){
                    transform.scale = LerpTowards(info.defaultScale, transform.scale, info.speed) 
                }
                else{
                    Vector3.copyFrom(info.defaultScale, transform.scale)
                    scaleDone = true     
                } 

                if(positionDone && scaleDone){
                    info.done = true
                }
            
            }
        }
    }

    //ROTATION
    for (const [entity] of slerpedItems) {
        const info = SlerpItem.getMutable(entity)
        const transform = Transform.getMutable(entity)

        if(Quaternion.angle(transform.rotation, info.targetRotation) > 1){
            transform.rotation = Quaternion.slerp(transform.rotation, info.targetRotation, 0.5)
        }
        else{
            transform.rotation = Quaternion.slerp(transform.rotation, info.targetRotation, 1)
        }
            
        
    }
}

engine.addSystem(ItemAnimationSystem)

