import { Entity, Transform } from "@dcl/sdk/ecs";
import { Vector3, Quaternion } from "@dcl/sdk/math";


export function ToRadian(degrees:number)
{
    var pi = Math.PI;
    return degrees * (pi/180);
}

export function ToDegrees(radians:number)
{
    var pi = Math.PI;
    return radians * (180/pi);
}

export function realDistance(pos1: Vector3, pos2: Vector3): number 
{
    const a = pos1.x - pos2.x
    const b = pos1.y - pos2.y
    const c = pos1.z - pos2.z
    return Math.sqrt(a * a + b * b + c * c)
}

export function moveLineBetween(line:Entity, A:Vector3, B:Vector3){
  
    let dist = realDistance(A,B)
    let rotAngle = ToDegrees( Vector3.getAngleBetweenVectors(Vector3.Forward(), Vector3.subtract(A,B),Vector3.Up()) )  

   const transform = Transform.getMutable(line)

   transform.position = Vector3.lerp(A,B,0.5)
   transform.position.y += 0.02
   transform.scale =  Vector3.create(dist,0.02,1)
   transform.rotation = Quaternion.fromEulerDegrees(0,90+rotAngle,0)
   //transform.rotation *= Quaternion. (Vector3.Right(),90)        
}