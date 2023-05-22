import { Vector3 } from "@dcl/sdk/math";


export const coreBuildingOffset = Vector3.create(128, 0, 112)

export const ParcelCountX = 4
export const ParcelCountZ = 5
export const lobbyCenter = Vector3.create(160,0,150.22)
export const lobbyHeightLegacy = 104.73
export const lobbyHeight = 76
export const lobbyRadius = 14.8

export interface NoArgCallBack {
	() : void;
}