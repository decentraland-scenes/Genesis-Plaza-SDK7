import { Vector3 } from "@dcl/ecs-math"
import { TransformTypeWithOptionals } from "@dcl/sdk/ecs"
import {openExternalUrl, teleportTo} from "~system/RestrictedActions"

/**
 * back port logging
 * @param msg 
 */
export function log(...msg:any[]){
  console.log(msg)
}

export type TranformConstructorArgs = TransformTypeWithOptionals  & {}

//export type GLTFShape = PBGltfContainer & {}

/**
 * place holder as does not exist in current SDK version
 * 
 * not working
 * https://github.com/decentraland/sdk/issues/665
 */
export async function _openExternalURL(url:string){
  log("_openExternalURL IMPLEMENT ME!!!!",url)
  log("_openExternalURL IMPLEMENT ME2!!!!")
  log("_openExternalURL IMPLEMENT ME3!!!!")
  openExternalUrl({url:url})
} 

//TODO TAG:PORT-REIMPLEMENT-ME
export function _teleportTo(parcelX:number,parcelZ:number){
  log("_teleportTo IMPLEMENT ME!!!!",parcelX,parcelZ)
  log("_teleportTo IMPLEMENT ME2!!!!")
  log("_teleportTo IMPLEMENT ME3!!!!")
  //const split 
  teleportTo({
    worldPosition: Vector3.create(parcelX * 16,1,parcelZ*16)
  })  
}
