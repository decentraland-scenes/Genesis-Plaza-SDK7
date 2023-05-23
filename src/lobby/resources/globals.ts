import { Vector3 } from "@dcl/sdk/math";

export const coreBuildingOffset = Vector3.create(0,0,0)
export const lobbyCenter = Vector3.create(160,0,150.22)
export const lobbyHeight = 104.73
//export const lobbyHeight = 1
export const lobbyRadius = 14.8

export interface NoArgCallBack {
	() : void;
}