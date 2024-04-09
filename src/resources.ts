// import { TriggerBoxShape, TriggerSphereShape } from '@dcl/npc-scene-utils'
//import * as utils from "@dcl/ecs-scene-utils"

export default {
  sounds: {
    robots: {
      alice: "sounds/alice.mp3",
      bela: "sounds/bela.mp3",
      betty: "sounds/betty.mp3",
      bob: "sounds/bob.mp3",
      charlie: "sounds/charlie.mp3",
      marsha: "sounds/marsha.mp3",
      ron: "sounds/ron.mp3",
    },
    ui: {
      navigationForward: "sounds/navigationForward.mp3",
      navigationBackward: "sounds/navigationBackward.mp3",
    }
   
  },
  models: {
   
    robots: {
      alice: "models/robots/alice.glb",
      bela: "models/robots/bela.glb",
      betty: "models/robots/betty.glb",
      bob: "models/robots/bob.glb",
      charlie: "models/robots/charlie.glb",
      marsha: "models/robots/marsha.glb",
      ron: "models/robots/ron.glb",
      rings: "models/robots/rings.glb",
    },
  }  
}



// export const INVISIBLE_MATERIAL = new BasicMaterial()
// const INVISIBLE_MATERIAL_texture = new Texture('images/transparent-texture.png')
// INVISIBLE_MATERIAL.texture = INVISIBLE_MATERIAL_texture
// INVISIBLE_MATERIAL.alphaTest = 1


/*
const emissiveBoxMat = new Material()
emissiveBoxMat.castShadows = false
//emissiveBoxMat.texture = new Texture('images/black.png')

emissiveBoxMat.albedoColor = Color4.Black()//Color4.White()
emissiveBoxMat.emissiveColor = Color3.Black()
emissiveBoxMat.emissiveIntensity = 0 
emissiveBoxMat.reflectivityColor = Color3.Black()
emissiveBoxMat.specularIntensity = 0
emissiveBoxMat.metallic = 0
emissiveBoxMat.roughness = 1  


const emissiveBoxMatOutline = new Material()
emissiveBoxMatOutline.albedoColor = Color4.Purple()//Color4.White()
emissiveBoxMatOutline.emissiveColor = Color3.Purple()
emissiveBoxMatOutline.emissiveIntensity = 10 
emissiveBoxMatOutline.reflectivityColor = Color3.Purple()
emissiveBoxMatOutline.specularIntensity = 0
emissiveBoxMatOutline.metallic = 0
emissiveBoxMatOutline.roughness = 1  


const emissiveGreenMat = new Material()
emissiveGreenMat.albedoColor = Color4.Green()//Color4.White()
emissiveGreenMat.emissiveColor = Color3.Green()
emissiveGreenMat.emissiveIntensity = 10 
emissiveGreenMat.reflectivityColor = Color3.Green()
emissiveGreenMat.specularIntensity = 0
emissiveGreenMat.metallic = 0
emissiveGreenMat.roughness = 1  




const outerBoxMat = new Material()
outerBoxMat.albedoColor = Color4.Black()
outerBoxMat.emissiveColor = Color3.Black()
outerBoxMat.emissiveIntensity = 10 
outerBoxMat.reflectivityColor = Color3.Black()
outerBoxMat.metallic = 1
outerBoxMat.roughness = 0

let normalPlaneShape = new GLTFShape('models/opaque_plane.glb')

*/
// export const RESOURCES = {
//         models:{
//           names:{            
//           },
//           instances:{
//             //outerPlaneShape:normalPlaneShape
//           }
//         },
//         // textures: {
//         //   //sprite_sheet: spriteSheetTexture,
//         //   transparent: INVISIBLE_MATERIAL_texture,
//         //   dialogAtlas: new Texture('https://decentraland.org/images/ui/dark-atlas-v3.png')
//         // },
//         materials: {
//           //sprite_sheet: spriteSheetMaterial
//          // transparent: INVISIBLE_MATERIAL,
//           /*emissiveBoxMat: emissiveBoxMat,
//           emissiveBoxMatOutline: emissiveBoxMatOutline,
//           outerBoxMat: emissiveBoxMat,
//           rabbitCheckPoints: emissiveGreenMat*/
//         },
//         strings:{
           
//         },
//         images:{
//           portrait:{
//           },
//         }
// }