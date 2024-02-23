import { Vector3 } from "@dcl/ecs-math"
import { TransformTypeWithOptionals } from "@dcl/sdk/ecs"
import { openExternalUrl, teleportTo } from "~system/RestrictedActions"

/**
 * back port logging
 * @param msg 
 */
export function log(...msg: any[]) {
  console.log(...msg)
}

export type TranformConstructorArgs = TransformTypeWithOptionals & {}

//export type GLTFShape = PBGltfContainer & {}

/**
 * place holder as does not exist in current SDK version
 * 
 * not working
 * https://github.com/decentraland/sdk/issues/665
 */
export async function _openExternalURL(url: string) {
  openExternalUrl({ url: url })
}

//TODO TAG:PORT-REIMPLEMENT-ME
export function _teleportTo(parcelX: number, parcelZ: number) {
  //sdk needs to prompt but this works
  //const split 
  log("_teleportTo - Coordinates:", parcelX, parcelZ)
  teleportTo({
    worldCoordinates: { x: parcelX, y: parcelZ }
  })
}

export function _teleportToString(coords:string) {
  //sdk needs to prompt but this works

  //const split 
  log("_teleportTo - Coordinates:", coords)
  let separator = ","  
  let coordsArray = coords.split(separator)
  //log("_Converted - Coordinates: X:", coordsArray[0] + " Y: " + coordsArray[1])
  teleportTo({
    worldCoordinates: { x: parseInt(coordsArray[0]) , y: parseInt(coordsArray[1]) }
  })
}
