import { ThumbnailPlane } from "./subItems/thumbnail"
import { monthToString, wordWrap } from "./helperFunctions"
import * as resource from "./resources/resources"
import { Vector3 } from "@dcl/sdk/math"
import { Entity, engine } from "@dcl/sdk/ecs"
import { ProximityScale } from "./simpleAnimator"


export class MenuItem {
    entity:Entity
    selected:boolean = false
    defaultItemScale:Vector3

    constructor(){
        this.entity = engine.addEntity()
        
        this.defaultItemScale = Vector3.create(2,2,2)
    }
    updateItemInfo(_info:any){

    }
           
    select(_silent:boolean){    
    }
    deselect(_silent?:boolean){
        // this.selected = false            
              
    }
    show(){

    }
    hide(){

    }
}