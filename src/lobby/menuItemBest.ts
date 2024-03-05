import { ThumbnailPlane } from './subItems/thumbnail'
import { cleanString, getTitleFontSize, monthToString, wordWrap } from './helperFunctions'
import { AnimatedItem } from './simpleAnimator'
import * as resource from './resources/resources'
import { MenuItem } from './menuItem'
import * as sfx from './resources/sounds'
import { lobbyCenter } from './resources/globals'
import { getCurrentTime, getTimeStamp } from './checkApi'
import { AudioSource, Entity, GltfContainer, InputAction, TextAlignMode, TextShape, Transform, TransformType, TransformTypeWithOptionals, VisibilityComponent, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { _openExternalURL, _teleportToString } from '../back-ports/backPorts'
import { getImageOrFallback } from '../utils/allowedMediaHelper'
import { TrackingElement, generateGUID, getRegisteredAnalyticsEntity, trackAction } from '../modules/stats/analyticsComponents'
import { ANALYTICS_ELEMENTS_IDS, ANALYTICS_ELEMENTS_TYPES } from '../modules/stats/AnalyticsConfig'
import { teleportTo } from '~system/RestrictedActions'

 

export class BestMenuItem extends MenuItem {
  public thumbNail: ThumbnailPlane
  public scale: Vector3
  public scaleMultiplier: number

  entity:Entity  
  itemBox: Entity
  title: Entity  
  leftDetailsRoot: Entity    
  likeCounterBG: Entity
  likeScore: number
  jumpInButton: Entity  
  jumpButtonText: Entity  
  highlightRays: Entity
  highlightFrame: Entity 
  coordsPanel: Entity
  coords: Entity  
  detailsRoot: Entity
  likeCountRoot: Entity
  likesTitleRoot: Entity
  //: Entity
  userCount: number
  scene: any
  

  constructor(
    _transform: TransformType,
    _alphaTexture: string,
    _analyticParent: Entity,
    _scene: any
  ) {
    super()
    this.entity = engine.addEntity()
    Transform.create(this.entity,_transform)

    this.scene = _scene

    // event card root
    this.itemBox = engine.addEntity()
    Transform.create(this.itemBox, {
      position: Vector3.create(0, 0, 0),
      scale: Vector3.create(1, 1, 1),
    })    
    GltfContainer.createOrReplace(this.itemBox, resource.menuTitleBGShape )    
    VisibilityComponent.create(this.itemBox, {visible: true})
    Transform.getMutable(this.itemBox).parent = this.entity

    TrackingElement.create(this.itemBox, 
      {
        guid: generateGUID(),
        elementType: ANALYTICS_ELEMENTS_TYPES.interactable, 
        elementId: ANALYTICS_ELEMENTS_IDS.menuItemCrowd,
        parent: _analyticParent
    })


    this.defaultItemScale = Vector3.create(1, 1, 1)
    this.scale = Vector3.create(1, 1, 1)
    this.scaleMultiplier = 1.2

    
    // this.thumbNail = new ThumbnailPlane(
    //   getImageOrFallback(_scene.image,"images/fallback-scene-thumb.png"),
    //   {
    //     position: Vector3.create(0.25, 0.27, 0),
    //     rotation: Quaternion.Zero(),
    //     scale: Vector3.create(1.1, 0.55, 1),
    //     parent: this.entity
    //   },
    //   _alphaTexture
    // )  

    this.thumbNail = new ThumbnailPlane(
      getImageOrFallback(_scene.image,"images/fallback-scene-thumb.png"),
      {
        position: Vector3.create(0.0, 3.3-(27/16 *0.5), 0),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(3, 27/16, 1),
        parent: this.itemBox
      },
      _alphaTexture
    )  
       

    this.leftDetailsRoot = engine.addEntity()
    
    Transform.create( this.leftDetailsRoot, {      
        position: Vector3.create(-0.32, 0.28, -0.02),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(0.9, 0.9, 0.9),    
        parent: this.itemBox  
    })    

    // main root animation states
    AnimatedItem.create(this.entity, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: _transform.position,
      highlightPosition: Vector3.create(_transform.position.x,_transform.position.y, _transform.position.z-0.6),
      defaultScale: Vector3.create(
        this.defaultItemScale.x,
        this.defaultItemScale.y,
        this.defaultItemScale.z
      ),
      highlightScale: Vector3.scale(this.defaultItemScale,this.scaleMultiplier),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.7,
      done: false
    })    


    this.likeScore = 100
    if (_scene.like_score) {
      this.likeScore = _scene.like_score
      this.likeScore = this.likeScore *100
      //this.likeScoreText.value = this.likeScore.toPrecision(3)
      
    }

    // -- USER COUNTER PANEL
    this.likeCounterBG = engine.addEntity()
    Transform.create(this.likeCounterBG, {
        position: Vector3.create(-0.7, 0.38, 0),
        scale: Vector3.create(0.9, 0.9, 0.9),
        parent:this.leftDetailsRoot
    })
    GltfContainer.createOrReplace(this.likeCounterBG, resource.likeCounterBGShape )    
    VisibilityComponent.create(this.likeCounterBG, {visible: true})
      

    this.likeCountRoot = engine.addEntity()
    Transform.create(this.likeCountRoot,{
        position: Vector3.create(0.5, -0.4, -0.025),
        scale: Vector3.create(0.80, 0.80, 0.80),
        parent: this.likeCounterBG
    })        
    VisibilityComponent.create(this.likeCountRoot, {visible: true})
   
    TextShape.create(this.likeCountRoot,{
        text: this.likeScore.toPrecision(3),
        fontSize: 4,
        textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
        textColor: resource.dateDayColor,
        outlineColor: resource.dateDayColor,
        outlineWidth: 0.2
    })

    this.likesTitleRoot = engine.addEntity()
    Transform.create(this.likesTitleRoot, {
        position: Vector3.create(0, -0.12, -0.01),
        scale: Vector3.create(0.8, 0.8, 0.8),
        parent: this.likeCounterBG
    })  
    TextShape.create(this.likesTitleRoot,{
        text: '',
        fontSize: 2,
        textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
        textColor: Color4.White(),
        outlineColor: Color4.White(),
        outlineWidth: 0.1
    }) 
    VisibilityComponent.create(this.likesTitleRoot, {visible: true})  


   // DETAILS APPEARING ON SELECTION EVENT  
   this.detailsRoot = engine.addEntity()

   Transform.create(this.detailsRoot, {
     parent: this.entity
   })   
    // TITLE    
    this.title = engine.addEntity()
    Transform.create(this.title, {
      position: Vector3.create(0, 1.3, -0.01),
      scale: Vector3.create(0.3, 0.3, 0.3),
      parent: this.itemBox
    })
    let rawText: string = _scene.title
   
    //  remove non-UTF-8 characters
    rawText = cleanString(rawText)
    rawText = wordWrap(rawText, 36, 3)

    TextShape.create(this.title, {
      text: rawText,
      height: 20,
      width: 2,
      fontSize: getTitleFontSize(rawText),      
      textColor: Color4.White(),
      outlineColor: Color4.White(),
      outlineWidth: 0.2,
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    })
    VisibilityComponent.create(this.title, {visible: true})

    // -- COORDS PANEL
    this.coordsPanel = engine.addEntity()

    Transform.create(this.coordsPanel, {
      position: Vector3.create(0.9 , 0.5, 0),
        scale: Vector3.create(0.6, 0.6, 0.6),
        parent: this.detailsRoot
    })
    GltfContainer.create(this.coordsPanel, resource.coordsPanelShape)
    VisibilityComponent.create(this.coordsPanel, {visible: true})
    // AnimatedItem.create(this.coordsPanel, {
    //   wasClicked:false,
    //   isHighlighted:false,
    //   defaultPosition: Vector3.create(0, 0.5, 0.3),
    //   highlightPosition: Vector3.create(-0.4, -0.25, 0),
    //   defaultScale:Vector3.create(0.0, 0.0, 0.0),
    //   highlightScale: Vector3.create(0.5, 0.5, 0.5),
    //   animFraction: 0,
    //   animVeclocity: 0,
    //   speed: 0.4,
    //   done: false
    // })  

    if(false){
      pointerEventsSystem.onPointerDown(
        {
          entity:this.coordsPanel,
          opts: { hoverText: 'YOU ARE HERE', button: InputAction.IA_POINTER }
        },
        (e) => {
          //__teleportToString(_scene.baseCoords[0], _scene.baseCoords[1])      
        }
      )
    }
    else{
      pointerEventsSystem.onPointerDown(
        {
          entity:this.coordsPanel,
          opts: { hoverText: 'GO THERE', button: InputAction.IA_POINTER }
        },
        (e) => {
          trackAction(this.itemBox, "button_go_there", _scene.base_position, _scene.name)
          _teleportToString(_scene.base_position)      
        }
      )
    }
    

    this.coords = engine.addEntity()
    Transform.create(this.coords,{
      position: Vector3.create(0.18, -0.36, -0.05),
      scale: Vector3.create(0.18, 0.18, 0.18),
      parent: this.coordsPanel
    })  
    TextShape.create(this.coords, {
      text: _scene.base_position,
      textColor: Color4.fromHexString('#111111FF'),
      outlineColor: Color4.fromHexString('#111111FF'),
      outlineWidth: 0.1
    })      
    VisibilityComponent.create(this.coords, {visible:true})

    // -- JUMP IN BUTTON
    this.jumpInButton = engine.addEntity()
    Transform.create(this.jumpInButton, {
      position: Vector3.create(0.77, 1, 0),
      scale: Vector3.create(0.8, 0.8, 0.8), 
      parent: this.detailsRoot
    })
    GltfContainer.create(this.jumpInButton, resource.jumpInButtonShape)
    VisibilityComponent.create(this.jumpInButton, {visible:true})
    
    
    this.jumpButtonText = engine.addEntity()
    Transform.create( this.jumpButtonText, {
      position: Vector3.create(0, -0.33, -0.05),
      scale: Vector3.create(0.22, 0.22, 0.22),
      parent: this.jumpInButton
    })
    TextShape.create(this.jumpButtonText, {
      text:  ' ',
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
      outlineColor: Color4.White(),
      outlineWidth: 0.2
    })      
    VisibilityComponent.create(this.jumpButtonText, {visible:true})

    //skip genesis plaza
    if(false){
      TextShape.getMutable(this.jumpButtonText).text = 'HERE'    
    
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'YOU ARE HERE', button: InputAction.IA_POINTER }
        },
        (e) => {
          //__teleportToString(_scene.baseCoords[0], _scene.baseCoords[1])      
        }
      )    
    }
    else{
      TextShape.getMutable(this.jumpButtonText).text = 'JUMP IN'    
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'JUMP IN', button: InputAction.IA_POINTER }
        },
        (e) => {
          trackAction(this.itemBox, "button_jump_in", _scene.base_position, _scene.name)
          _teleportToString(_scene.base_position)       
        }
      )
    }
          

   
    this.highlightFrame = engine.addEntity()
    Transform.create(this.highlightFrame, {
      parent: this.detailsRoot
    })
    GltfContainer.create(this.highlightFrame, resource.highlightFrameFullShape)    

    AnimatedItem.create(this.highlightFrame, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0, 0.05),
      highlightPosition:  Vector3.create(0, 0, 0.05),
      defaultScale: Vector3.create(0, 0, 0),
      highlightScale:  Vector3.create(1, 1, 1),
      animFraction: 0,
      animVeclocity: 0,
      speed: 0.9,
      done: false
    })    
    // highlights BG on selection
    this.highlightRays = engine.addEntity()
    Transform.create(this.highlightRays, {
      position: Vector3.create(0,1.8,0),
      scale: Vector3.create(3,3,3),
      parent: this.highlightFrame
    })
    GltfContainer.create(this.highlightRays, resource.highlightRaysShape) 
    
  }

  updateItemInfo(_scene: any) {
    //image
    this.thumbNail.updateImage(_scene.image)

    //counter
    this.likeScore = _scene.like_score
    TextShape.getMutable(this.likeCountRoot).text = this.likeScore.toString()
        
     //scene title
     let rawText: string = _scene.title
     //exception for unnamed scenes
     if (rawText === 'interactive-text') {
        TextShape.getMutable(this.title).text = 'Unnamed Scene'
      } else {
        rawText = wordWrap(rawText, 36, 3)
        TextShape.getMutable(this.title).text = rawText
      }

      
    
    // remove non-UTF-8 characters
    rawText = cleanString(rawText)
    rawText = wordWrap(rawText, 36, 3)

    TextShape.getMutable(this.title).text = rawText
    

    //coords
    TextShape.getMutable(this.coords).text = (_scene.base_position)
    
    //exclusion for genesis plaza   
    if(false){
      pointerEventsSystem.onPointerDown(
        {
          entity:this.coordsPanel,
          opts: { hoverText: 'YOU ARE HERE', button: InputAction.IA_POINTER }
        },
        (e) => {
          //__teleportToString(_scene.baseCoords[0], _scene.baseCoords[1])      
        }
      )

      TextShape.getMutable(this.jumpButtonText).text = "HERE"
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'YOU ARE HERE', button: InputAction.IA_POINTER }
        },
        (e) => {
          //__teleportToString(_scene.baseCoords[0], _scene.baseCoords[1])      
        }
      )
    }
    else{
      pointerEventsSystem.onPointerDown(
        {
          entity:this.coordsPanel,
          opts: { hoverText: 'GO THERE', button: InputAction.IA_POINTER }
        },
        (e) => {
          trackAction(this.itemBox, "button_go_there", _scene.base_position, _scene.name)
          _teleportToString(_scene.base_position)      
        }
      )

      TextShape.getMutable(this.jumpButtonText).text = "JUMP IN"
      pointerEventsSystem.onPointerDown(
        {
          entity:this.jumpInButton,
          opts: { hoverText: 'JUMP IN', button: InputAction.IA_POINTER }
        },
        (e) => {
          trackAction(this.itemBox, "button_jump_in", _scene.base_position, _scene.name)
          _teleportToString(_scene.base_position)      
        }
      )
    }
  }


  select(_silent:boolean) {

    let rootInfo = AnimatedItem.getMutable(this.entity)     
    let highlightFrameInfo = AnimatedItem.getMutable(this.highlightFrame)
      
       

    if (!this.selected) {
      
      if(!_silent){
        this.playAudio(sfx.menuSelectSource, sfx.menuSelectSourceVolume)
      }

      trackAction(this.itemBox, "select_card", this.scene.base_position,this.scene.name) 
      
      this.selected = true
      rootInfo.isHighlighted = true
      rootInfo.done = false

      highlightFrameInfo.isHighlighted = true
      highlightFrameInfo.done = false


    }
  }

  deselect(_silent?: boolean) {
    if (this.selected) {
      if(!_silent){
        this.playAudio(sfx.menuDeselectSource, sfx.menuDeselectSourceVolume)
      }
      
      this.selected = false      
    }
    let rootInfo = AnimatedItem.getMutable(this.entity)      
    let highlightFrameInfo = AnimatedItem.getMutable(this.highlightFrame)   

    rootInfo.isHighlighted = false
    rootInfo.done = false

    highlightFrameInfo.isHighlighted = false
    highlightFrameInfo.done = false   


    // if(!_silent){
    //     sfx.menuDeselectSource.playOnce()
    // }
  }
  show() {
    VisibilityComponent.getMutable(this.itemBox).visible = true    
    VisibilityComponent.getMutable(this.title).visible = true    
    VisibilityComponent.getMutable(this.likeCounterBG).visible = true
    VisibilityComponent.getMutable(this.likeCountRoot).visible = true
    VisibilityComponent.getMutable(this.likesTitleRoot).visible = true
    VisibilityComponent.getMutable(this.coordsPanel).visible = true 
    VisibilityComponent.getMutable(this.jumpInButton).visible = true 
    VisibilityComponent.getMutable(this.coords).visible = true 
    VisibilityComponent.getMutable(this.jumpButtonText).visible = true 
    this.thumbNail.show()
    Transform.getMutable(this.entity).scale = Vector3.One()
  }
  hide() {
    VisibilityComponent.getMutable(this.itemBox).visible = false   
    VisibilityComponent.getMutable(this.title).visible = false    
    VisibilityComponent.getMutable(this.likeCounterBG).visible = false    
    VisibilityComponent.getMutable(this.likeCountRoot).visible = false    
    VisibilityComponent.getMutable(this.likesTitleRoot).visible = false    
    VisibilityComponent.getMutable(this.coordsPanel).visible = false 
    VisibilityComponent.getMutable(this.jumpInButton).visible = false 
    VisibilityComponent.getMutable(this.coords).visible = false 
    VisibilityComponent.getMutable(this.jumpButtonText).visible = false  
    this.thumbNail.hide()
    Transform.getMutable(this.entity).scale = Vector3.Zero()
  }

  playAudio(sourceUrl:string, volume:number){
      AudioSource.createOrReplace(this.entity, {
        audioClipUrl: sourceUrl,
        playing: true,
        loop:false,
        volume: volume
    })
  }
}
