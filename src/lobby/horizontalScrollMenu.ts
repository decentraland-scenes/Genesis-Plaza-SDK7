import { EventMenuItem } from "./menuItemEvent";
import { getEvents } from "./checkApi";
import { MenuItem } from "./menuItem";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Entity, GltfContainer, InputAction, MeshCollider, Transform, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
import * as resource from "./resources/resources"
import { AnimatedItem } from "./simpleAnimator";



export class EventMenu {
    items:EventMenuItem[]
    itemRoots:Entity[]
    menuRoot:Entity
    spacing:number
    angleSpacing:number
    scrollerRoot:Entity
    radius:number

    constructor(){
        this.spacing = 3.3
        this.angleSpacing = 12
        this.items = []
        this.itemRoots = []
        this.radius = 16

        this.menuRoot = engine.addEntity()
        Transform.create(this.menuRoot, {
            position: Vector3.create(172, 1.5,172)
        })

        this.scrollerRoot = engine.addEntity()
         Transform.create(this.scrollerRoot, {
            position: Vector3.create(0,0,0),
            parent:this.menuRoot
        })
    }

    selectItem(_item: EventMenuItem) {

        this.deselectAll()
        _item.select()
        //if(_id < this.items.length){
        // this.items[_id].select()
        // if (AnimatedItem.getMutableOrNull(_item.entity) != null) {
        //   if (!_item.selected) {
        //     this.deselectAll()
        //     _item.getComponent(AnimatedItem).activate()
        //     _item.select()
        //   }
        // } else {
        //   _item.select()
        // }
      }
      deselectItem(_item: MenuItem, _silent: boolean) {
        
        if (_item.selected) {            
            _item.deselect(_silent)          
        } else {
          _item.deselect(_silent)
        }
      }
      deselectAll() {
        for (let i = 0; i < this.items.length; i++) {          
          //this.items[i].deselect()          
          this.deselectItem(this.items[i], true)
          //this.clickBoxes[i].getComponent(OnPointerDown).hoverText = 'SELECT'
        }
      }
    
    addMenuItem(_item: EventMenuItem) {

        let menuCenter = Transform.get(this.menuRoot).position
        let angle = this.items.length * this.angleSpacing
        let rotatedPosVector =  Vector3.rotate(Vector3.scale(Vector3.Forward(), this.radius), Quaternion.fromEulerDegrees(0,angle,0))

        //let pos = Vector3.add(menuCenter, rotatedPosVector)
        rotatedPosVector.y = 0

        console.log("menuCenter: " + menuCenter.x +", " + menuCenter.y + ", " + menuCenter.z)
        //console.log("card Position: " + + pos.x +", " + pos.y + ", " + pos.z)
        let itemRoot = engine.addEntity()
        Transform.create(itemRoot, {
          //  position: Vector3.create(this.items.length * this.spacing, 0, 0),
            position: rotatedPosVector,
            rotation: Quaternion.fromEulerDegrees(0, angle,0),
            parent: this.scrollerRoot
        }) 
        
        this.itemRoots.push(itemRoot)
        

        // COLLIDER BOX FOR USER INPUT
        let clickBox = engine.addEntity()
        Transform.create(clickBox,{
            parent: itemRoot,
        })
       // GltfContainer.create(clickBox, resource.shelfShape)
        MeshCollider.setBox(clickBox)
        
        pointerEventsSystem.onPointerDown(clickBox,
            (e) => {
                if (!_item.selected) {
                    this.selectItem(_item)
                    //clickBox.getComponent(OnPointerDown).hoverText = 'DESELECT'
                    //sfx.menuSelectSource.playOnce()
                } else {
                    this.deselectItem(_item, false)
                    //clickBox.getComponent(OnPointerDown).hoverText = 'SELECT'
                    //sfx.menuDeselectSource.playOnce()
                }   
            },
            { hoverText: 'SELECT', button: InputAction.IA_POINTER }
        )   
            let transform = Transform.getMutable(_item.entity)
            transform.parent = itemRoot       
            this.items.push(_item)
    }

    async updateEventsMenu(_count:number){

        let events = await getEvents(_count)
        if(events){
            if (events.length <= 0) {
                return
              } 
         
        for(let i=0; i < events.length; i++){
      
          if (i < this.items.length){
            this.items[i].updateItemInfo(events[i])
          }
          else{
            console.log(events[i])
            this.addMenuItem(new EventMenuItem({ 
                position: Vector3.create(0,0,0),
                rotation: Quaternion.Zero(),   
                scale: Vector3.create(2,2,2)
              },        
              "images/rounded_alpha.png",
              events[i]
            ))
          }    
        }
    } 
    }
}