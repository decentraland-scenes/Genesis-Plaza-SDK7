import * as CANNON from 'cannon/build/cannon'
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math"
import { basketballOffset } from '../../../lobby/resources/globals'

const quat90 = Quaternion.fromEulerDegrees(-90,0,0)
const quat45 = Quaternion.fromEulerDegrees(0,-45,0)

export let colliderData:CANNON.Body[] = [
    // //WALL WEST
    // new CANNON.Body({
    //     mass: 0, // static
    //     position: new CANNON.Vec3(barOffset.x +7, 16, 40 ),
    //     shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +1,32,80))        
    // }),
    // //WALL EAST
    // new CANNON.Body({
    //     mass: 0, // static
    //     position: new CANNON.Vec3(barOffset.x +57, 16, 40 ),
    //     shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +1,32,80))        
    // }),
    // //WALL SOUTH
    // new CANNON.Body({
    //     mass: 0, // kg
    //     position: new CANNON.Vec3(barOffset.x +32, 16, 15 ), 
    //     shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +48,32,1))    
    // }),
    // //WALL NORTH
    // new CANNON.Body({
    //     mass: 0, // kg
    //     position: new CANNON.Vec3(barOffset.x +32, 16, 60 ), 
    //     shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +48,32,1))    
    // }),
    // //WALL NORTHWEST ANGLE
    // new CANNON.Body({
    //     mass: 0, // kg
    //     position: new CANNON.Vec3(barOffset.x +16.7, 2, 51.41 ), 
    //     quaternion: new CANNON.Quaternion(quat45.x, quat45.y, quat45.z, quat45.w),
    //     shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,10,1))    
    // }),
    //CENTER BEAM
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x + 32, 20, basketballOffset.z + 38 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 3.6, 3.6, 40, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   ,   
    //LEFT TABLE BACK
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +24.5, 0.5, basketballOffset.z + 48 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   ,   
    //RIGHT TABLE BACK
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +39, 0.5, basketballOffset.z + 47.6), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })  , 
    //LEFT TABLE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +22.3, 0.5, basketballOffset.z + 33.9 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   ,   
    //RIGHT TABLE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +41, 0.5, basketballOffset.z + 33.58), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })  , 
    
    //LEFT ELEVATOR
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +19, 10, basketballOffset.z + 39.65 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.9, 1.9, 20, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   , 
    //LEFT ELEVATOR BASE CYLINDER
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +19, 0.25, basketballOffset.z + 39.65 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 2.9, 2.9, 0.5, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   , 
    //RIGHT ELEVATOR
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +45, 10, basketballOffset.z + 39.65 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.9, 1.9, 20, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   , 
    //RIGHT ELEVATOR BASE CYLINDER
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +45, 0.25, basketballOffset.z + 39.65 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 2.9, 2.9, 0.5, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   , 

    //BAR
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +32, 0.5, basketballOffset.z + 25.8 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 5, 5, 1.5, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   , 
    //BAR CYLINDER 2
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +32, 4, basketballOffset.z + 25.8 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 3.0, 3.0, 10, 12)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(barOffset.x +4,40,4))   
    })   , 
    //STAGE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +32, 0, basketballOffset.z + 58 ), 
        shape: new CANNON.Box(new CANNON.Vec3(10,0.75,4))    
    }),
    //BOOTH PILLAR LEFT1
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +21.5, 0.5, basketballOffset.z + 23.5 ), 
        shape: new CANNON.Box(new CANNON.Vec3(1.4,1.2,2.4)),   
        quaternion: new CANNON.Quaternion(quat45.x, quat45.y, quat45.z, quat45.w), 
    }),
    //BOOTH PILLAR LEFT2
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +15.6, 0.5, basketballOffset.z + 29.08 ), 
        shape: new CANNON.Box(new CANNON.Vec3(2.4,1.2,1.4)),   
        quaternion: new CANNON.Quaternion(quat45.x, quat45.y, quat45.z, quat45.w), 
    }),
    //BOOTH PILLAR RIGHT1
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +43.5, 0.5, basketballOffset.z + 23.5 ), 
        shape: new CANNON.Box(new CANNON.Vec3(1.4,1.2,2.4)),   
        quaternion: new CANNON.Quaternion(quat45.x, quat45.y, quat45.z, quat45.w), 
    }),
    //BOOTH PILLAR RIGHT2
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(basketballOffset.x +47.8, 0.5, basketballOffset.z + 29.08 ), 
        shape: new CANNON.Box(new CANNON.Vec3(2.4,1.2,1.4)),   
        quaternion: new CANNON.Quaternion(quat45.x, quat45.y, quat45.z, quat45.w), 
    }),
   ]