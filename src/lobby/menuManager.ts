import { engine } from "@dcl/sdk/ecs"
import { HorizontalMenu } from "./horizontalScrollMenu"


export class MenuManager {
    items:HorizontalMenu[]


    constructor(){
        this.items = []

        engine.addSystem((dt: number) => {

            for(let menu of this.items){
                menu.update(dt)
            }
            
          })
    }

    addMenu(menu:HorizontalMenu){
        this.items.push(menu)
    }

    deselectAllMenus(){
        for(let i=0; i< this.items.length; i++){
            this.items[i].deselectAll()
        }
    }
    deselectAllMenusExceptID(_exceptID:number){

        for(let i=0; i< this.items.length; i++){

            if(this.items[i].menuID != _exceptID){
                this.items[i].deselectAll()
            }
            
        }
    }
}