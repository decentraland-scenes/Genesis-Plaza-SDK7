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
        
        this.defaultItemScale = Vector3.create(1,1,1)
    }
    updateItemInfo(_info:any){

    }
    updateItemTime(){
        
    }
           
    select(_silent:boolean){   
        this.selected = true 
    }
    deselect(_silent?:boolean){
         this.selected = false                   
    }
    show(){

    }
    hide(){

    }
}