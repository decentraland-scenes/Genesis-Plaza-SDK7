import { Vector3 } from "@dcl/sdk/math";

//ideally 0
export const BEAM_SCALE_AMOUNT = -.06
//compensate welcome area too
export const WELCOME_OFFSET_Y_AMOUNT = -.5

export const coreBuildingOffset = Vector3.create(8*16, 0, 7*16)


export const ParcelCountX = 4
export const ParcelCountZ = 5
export const ParcelCountMaxY = (Math.log((ParcelCountX*ParcelCountZ)) * Math.LOG2E) * 20
export const barCenter = Vector3.create((ParcelCountX*16)/2,0,(ParcelCountZ*16)/2)
export const lobbyCenter = Vector3.create(160,0,150.22)
export const lobbyHeightLegacy = 104.73
export const lobbyHeight = 72 //shorten trees by 6 meters
export const lobbyRadius = 14.8

export interface NoArgCallBack {
	() : void;
}
