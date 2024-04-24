import * as utils from '@dcl-sdk/utils'
import { Vector3 } from "@dcl/sdk/math";

//ideally 0
export const BEAM_SCALE_AMOUNT = -.06
//compensate welcome area too
export const WELCOME_OFFSET_Y_AMOUNT = -.5

//export const coreBuildingOffset = Vector3.create(8*16, 0, 7*16)
export const coreBuildingOffset = Vector3.create(0, 0, 0)


//utils.NO_LAYERS should work but it doesn't so using constant and layer8 as our dont interact with things layer
export const TRIGGER_LAYER_REGISTER_WITH_NO_LAYERS = utils.NO_LAYERS //utils.NO_LAYERS 

export const ParcelCountX = 20
export const ParcelCountZ = 19
export const ParcelCountMaxY = (Math.log((ParcelCountX*ParcelCountZ)) * Math.LOG2E) * 20
export const barCenter = Vector3.create((ParcelCountX*16)/2,0,(ParcelCountZ*16)/2)
//export const lobbyCenter = Vector3.create(160,0,150.22)
export const lobbyCenter = Vector3.create((ParcelCountX*16)/2 + 0.02,0,(ParcelCountZ*16)/2 - 1.83)
export const lobbyHeightLegacy = 104.73
export const lobbyHeight = 104.73 //shorten trees by 6 meters 72
//export const lobbyHeight = 0.5 //shorten trees by 6 meters 72
export const lobbyRadius = 14.8
export const basketballOffset = Vector3.create(184, 0, 92) 
export const barOffset = Vector3.create(128, 0, 112) 

export interface NoArgCallBack {
	() : void;
}
