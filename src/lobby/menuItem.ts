import { ThumbnailPlane } from "./thumbnail"
import { monthToString, wordWrap } from "./helperFunctions"
import * as resource from "./resources/resources"
import { Vector3 } from "@dcl/sdk/math"


export class MenuItem {
    selected:boolean = false
    defaultItemScale:Vector3

    constructor(){

        this.defaultItemScale = Vector3.create(2,2,2)
    }
    updateItemInfo(_info:any){

    }
           
    select(){    
    }
    deselect(_silent?:boolean){
        // this.selected = false            
              
    }
    show(){

    }
    hide(){

    }
}