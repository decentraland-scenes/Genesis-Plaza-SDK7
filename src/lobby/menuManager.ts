import { HorizontalMenu } from "./horizontalScrollMenu"


export class MenuManager {
    items:HorizontalMenu[]


    constructor(){
        this.items = []
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