import * as CANNON from 'cannon/build/cannon'
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math"

const quat90 = Quaternion.fromEulerDegrees(-90,0,0)
const quat45 = Quaternion.fromEulerDegrees(0,-45,0)

export let colliderData:CANNON.Body[] = [
    //WALL WEST
    new CANNON.Body({
        mass: 0, // static
        position: new CANNON.Vec3(7, 16, 40 ),
        shape: new CANNON.Box(new CANNON.Vec3(1,32,80))        
    }),
    //WALL EAST
    new CANNON.Body({
        mass: 0, // static
        position: new CANNON.Vec3(57, 16, 40 ),
        shape: new CANNON.Box(new CANNON.Vec3(1,32,80))        
    }),
    //WALL SOUTH
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(32, 16, 15 ), 
        shape: new CANNON.Box(new CANNON.Vec3(48,32,1))    
    }),
    //WALL NORTH
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(32, 16, 60 ), 
        shape: new CANNON.Box(new CANNON.Vec3(48,32,1))    
    }),
    //WALL NORTHWEST ANGLE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(16.7, 2, 51.41 ), 
        quaternion: new CANNON.Quaternion(quat45.x, quat45.y, quat45.z, quat45.w),
        shape: new CANNON.Box(new CANNON.Vec3(4,10,1))    
    }),
    //CENTER BEAM
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(32, 20, 38 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 3.6, 3.6, 40, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   ,   
    //LEFT TABLE BACK
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(24.5, 0.5, 48 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   ,   
    //RIGHT TABLE BACK
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(39, 0.5, 47.6), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })  , 
    //LEFT TABLE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(22.3, 0.5,33.9 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   ,   
    //RIGHT TABLE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(41, 0.5, 33.58), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 1.5, 1.5, 1.5, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })  , 
    
    //LEFT ELEVATOR
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(19, 10, 39.65 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 2, 2, 20, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   , 
    //RIGHT ELEVATOR
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(45, 10, 39.65 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 2, 2, 20, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   , 

    //BAR
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(32, 0.5, 25.8 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 5, 5, 1.5, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   , 
    //BAR CYLINDER 2
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(32, 4, 25.8 ), 
        quaternion: new CANNON.Quaternion(quat90.x, quat90.y, quat90.z, quat90.w),
        shape: new CANNON.Cylinder( 4, 4, 10, 16)   ,
        fixedRotation:true 
        //shape: new CANNON.Box(new CANNON.Vec3(4,40,4))   
    })   , 
    //STAGE
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(32, 0, 58 ), 
        shape: new CANNON.Box(new CANNON.Vec3(10,0.75,4))    
    }),
   ]