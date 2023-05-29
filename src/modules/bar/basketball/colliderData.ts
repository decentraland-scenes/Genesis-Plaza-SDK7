import * as CANNON from 'cannon/build/cannon'

export let colliderData:CANNON.Body[] = [
    //WALL WEST
    new CANNON.Body({
        mass: 0, // static
        position: new CANNON.Vec3(1, 16, 24 ),
        shape: new CANNON.Box(new CANNON.Vec3(2,32,48))        
    }),
    //WALL EAST
    new CANNON.Body({
        mass: 0, // static
        position: new CANNON.Vec3(47, 16, 24 ),
        shape: new CANNON.Box(new CANNON.Vec3(2,32,48))        
    }),
    //WALL SOUTH
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(24, 16, 1 ), 
        shape: new CANNON.Box(new CANNON.Vec3(48,32,2))    
    }),
    //WALL NORTH
    new CANNON.Body({
        mass: 0, // kg
        position: new CANNON.Vec3(24, 16, 47 ), 
        shape: new CANNON.Box(new CANNON.Vec3(48,32,2))    
    })      
   ]