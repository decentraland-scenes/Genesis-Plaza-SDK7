import { ThumbnailPlane } from './thumbnail'
import { cleanString, monthToString, wordWrap } from './helperFunctions'
import { AnimatedItem } from './simpleAnimator'
import * as resource from './resources/resources'
import { MenuItem } from './menuItem'
import * as sfx from './resources/sounds'
import { lobbyCenter } from './resources/globals'
import { getCurrentTime, getTimeStamp } from './checkApi'
import { Entity, GltfContainer, InputAction, TextAlignMode, TextShape, Transform, TransformTypeWithOptionals, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { liveSignShape } from './resources/resources'
import { _openExternalURL, _teleportTo } from '../back-ports/backPorts'

let dummyLiveBadge = engine.addEntity()
Transform.create(dummyLiveBadge, {
  position: Vector3.create(lobbyCenter.x, lobbyCenter.y - 20, lobbyCenter.z),
})

GltfContainer.create(dummyLiveBadge, { 
	src: resource.liveSignShape.src 
})

//const clickableGroup = engine.getComponentGroup(ClickableItem, Transform)

export class EventMenuItem extends MenuItem {
  public thumbNail: ThumbnailPlane
  public scale: Vector3
  public scaleMultiplier: number

  entity:Entity
  itemBox: Entity
  title: Entity  
  leftDetailsRoot: Entity
  dateRoot: Entity
  dateMonthRoot: Entity
  dateBG: Entity
  date: Date
  live: boolean
  liveSign: Entity  
  detailsRoot: Entity
  jumpInButton: Entity  
  jumpButtonText: Entity
  detailText: Entity
  detailTextPanel: Entity
  highlightRays: Entity
  highlightFrame: Entity
  detailEventTitle: Entity
  readMoreButton: Entity
  coordsPanel: Entity
  coords: Entity  
  timePanel: Entity
  startTime: Entity  
  

  constructor(
    _transform: TransformTypeWithOptionals,
    _alphaTexture: string,
    _event: any
  ) {
    super()
    this.entity = engine.addEntity()
    Transform.create(this.entity,_transform)

   
    // event card root
    this.itemBox = engine.addEntity()
    Transform.create(this.itemBox, {
      position: Vector3.create(0, 0, 0),
      scale: Vector3.create(1, 1, 1),
    })    
    GltfContainer.createOrReplace(this.itemBox, resource.menuTitleBGShape )    
    Transform.getMutable(this.itemBox).parent = this.entity

    this.defaultItemScale = Vector3.create(2, 2, 2)
    this.scale = Vector3.create(1, 0.5, 1)
    this.scaleMultiplier = 1.2

    this.thumbNail = new ThumbnailPlane(
      _event.image,
      {
        position: Vector3.create(0.25, 0.27, 0),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(1.1, 0.55, 1),
        parent: this.entity
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

    // LIVE SIGN
    this.live = _event.live
    this.liveSign = engine.addEntity()

    Transform.create(this.liveSign, {
      position: Vector3.create(-0.25, 0, 0),
      scale: Vector3.create(0.4, 0.4, 0.4),
    })   

    GltfContainer.createOrReplace(this.liveSign, resource.liveSignShape )   

    // TextShape.create(this.liveSign,{
    //   text:"",
    //   fontSize: 3})    
    // this.liveText.fontSize = 3
    // this.liveText.color = Color3.Green()    
   
    this.dateBG = engine.addEntity()
    Transform.create(this.dateBG, {
      position: Vector3.create(-0.25, 0, 0),
      scale: Vector3.create(0.4, 0.4, 0.4),
    })       
    GltfContainer.createOrReplace(this.dateBG, resource.dateBGShape)    


    this.date = new Date(_event.next_start_at)

    this.dateRoot = engine.addEntity()
    Transform.create(this.dateRoot, {
      position: Vector3.create(0, -0.15, -0.05),
      parent: this.dateBG
    })       

    this.dateMonthRoot = engine.addEntity()
    Transform.create(this.dateMonthRoot, {
      position: Vector3.create(0, 0.25, -0.05),
      parent: this.dateBG
    })   

    TextShape.create(this.dateRoot, {
      text:this.date.getDate().toString(),
      fontSize:5,
      textColor: resource.dateDayColor,
      outlineColor: resource.dateDayColor,
      outlineWidth: 0.2
    })

    TextShape.create(this.dateMonthRoot, {
      text: monthToString(this.date.getMonth()).toUpperCase(),
      fontSize:3,
      textColor: resource.dateMonthColor,      
    })   

    

    if (this.live) {
      //add live badge
      
      Transform.getMutable(this.liveSign).parent = this.leftDetailsRoot
    } else {
      // add calendar panel
      Transform.getMutable( this.dateBG).parent = this.leftDetailsRoot
      
    }

    AnimatedItem.create(this.entity, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0, 0),
      highlightPosition: Vector3.create(0, 0, -0.6),
      defaultScale: Vector3.create(
        this.defaultItemScale.x,
        this.defaultItemScale.y,
        this.defaultItemScale.z
      ),
      highlightScale: Vector3.create(2.3, 2.3, 2.3),
      animFraction: 0,
      animVeclocity: 0,
      speed: 2,
      done: false
    })    

    // DETAILS APPEARING ON SELECTION EVENT
    this.detailsRoot = engine.addEntity()

    Transform.create(this.detailsRoot, {
      parent: this.entity
    })   

    this.timePanel = engine.addEntity()
    Transform.create(this.timePanel, {
      position: Vector3.create(-0.4, 0, -0.2),
      rotation: Quaternion.fromEulerDegrees(0, -30, 0),
      parent: this.detailsRoot
    })
    GltfContainer.createOrReplace(this.timePanel, resource.timePanelShape)    

    AnimatedItem.create(this.timePanel, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(-0.7, 0.25, 0.1),
      highlightPosition: Vector3.create(-1.1, 0.25, -0.2),
      defaultScale: Vector3.create(0, 0, 0),
      highlightScale:  Vector3.create(1, 1, 1),
      animFraction: 0,
      animVeclocity: 0,
      speed: 2,
      done: false
    })   

    this.startTime = engine.addEntity()

    Transform.create(this.startTime, {
      scale: Vector3.create(0.1, 0.1, 0.1),
      parent: this.timePanel
    })
    TextShape.create(this.startTime, {
      text: _event.next_start_at.substring(11, 16) + '\nUTC'

    })
    
    //this.startTimeText.font = new Font(Fonts.SanFrancisco_Heavy)
   

    // TITLE    
    this.title = engine.addEntity()
    Transform.create(this.title, {
      position: Vector3.create(0, -0.15, -0.01),
      scale: Vector3.create(0.3, 0.3, 0.3),
      parent: this.itemBox
    })
    let rawText: string = _event.name
    //  remove non-UTF-8 characters
    rawText = cleanString(rawText)
    rawText = wordWrap(rawText, 36, 3)

    TextShape.create(this.title, {
      text: rawText,
      height: 20,
      width: 2,
      fontSize: 2,
      textColor: Color4.Black(),
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER
    })
    

    // -- COORDS PANEL
    this.coordsPanel = engine.addEntity()

    Transform.create(this.coordsPanel, {
      position: Vector3.create(-0.3, -0.2, 0),
        scale: Vector3.create(0.4, 0.4, 0.4),
        parent: this.detailsRoot
    })
    GltfContainer.create(this.coordsPanel, resource.coordsPanelShape)
    AnimatedItem.create(this.coordsPanel, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0.0, 0.2),
      highlightPosition: Vector3.create(-0.4, -0.25, -0.05),
      defaultScale:Vector3.create(0.1, 0.1, 0.1),
      highlightScale: Vector3.create(0.5, 0.5, 0.5),
      animFraction: 0,
      animVeclocity: 0,
      speed: 1.9,
      done: false
    })  

    pointerEventsSystem.onPointerDown(this.coordsPanel,
      (e) => {
        _teleportTo(_event.coordinates[0] + ',' + _event.coordinates[1])      
      },
      { hoverText: 'GO THERE', button: InputAction.IA_POINTER }
    )
    

    this.coords = engine.addEntity()
    Transform.create(this.coords,{
      position: Vector3.create(0.18, -0.33, -0.05),
      scale: Vector3.create(0.18, 0.18, 0.18),
      parent: this.coordsPanel
    })  
    TextShape.create(this.coords, {
      text: _event.coordinates[0] + ',' + _event.coordinates[1],
      textColor: Color4.fromHexString('#111111FF')
    })      
    

    // -- JUMP IN BUTTON
    this.jumpInButton = engine.addEntity()
    Transform.create(this.jumpInButton, {
      position: Vector3.create(0, -0.2, 0),
      scale: Vector3.create(0.4, 0.4, 0.4),
      parent: this.detailsRoot
    })
    GltfContainer.create(this.jumpInButton, resource.jumpInButtonShape)
    
    AnimatedItem.create(this.jumpInButton, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0.0, 0.2),
      highlightPosition:  Vector3.create(0.4, -0.25, -0.05),
      defaultScale:Vector3.create(0.1, 0.1, 0.1),
      highlightScale: Vector3.create(0.5, 0.5, 0.5),
      animFraction: 0,
      animVeclocity: 0,
      speed: 1.8,
      done: false
    })     

    this.jumpButtonText = engine.addEntity()
    Transform.create( this.jumpButtonText, {
      position: Vector3.create(0, -0.33, -0.05),
      scale: Vector3.create(0.22, 0.22, 0.22),
      parent: this.jumpInButton
    })
    TextShape.create(this.jumpButtonText, {
      text:  ' ',
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_CENTER
    })      

    if (this.live) {
      TextShape.getMutable(this.jumpButtonText).text = 'JUMP IN'
      
      pointerEventsSystem.onPointerDown(this.jumpInButton,
        (e) => {
          _teleportTo(_event.coordinates[0] + ',' + _event.coordinates[1])      
        },
        { hoverText: 'JUMP IN', button: InputAction.IA_POINTER }
      )
    } 
    else {
      TextShape.getMutable(this.jumpButtonText).text = 'SIGN UP'

      pointerEventsSystem.onPointerDown(this.jumpInButton,
        async (e) => {
          _openExternalURL(
            'https://events.decentraland.org/en/?event=' + _event.id
          )    
        },
        { hoverText: 'CHECK EVENT PAGE', button: InputAction.IA_POINTER }
      )
      
    }

    // EVENT DETAILS TEXT
    this.detailTextPanel = engine.addEntity()
    Transform.create(this.detailTextPanel, {
      position: Vector3.create(0.8, 0, 0.2),
        scale: Vector3.create(0, 0.8, 0),
        rotation: Quaternion.fromEulerDegrees(0, 30, 0),
        parent: this.detailsRoot
    })
    GltfContainer.create(this.detailTextPanel, resource.detailsBGShape)    
    
    AnimatedItem.create(this.detailTextPanel, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition:  Vector3.create(0.8, 0, 0.2),
      highlightPosition:  Vector3.create(0.9, 0, -0.1),
      defaultScale: Vector3.create(0, 0.8, 0),
      highlightScale:  Vector3.create(1, 1, 1),
      animFraction: 0,
      animVeclocity: 0,
      speed: 2.2,
      done: false
    }) 

    // EVENT DETAILS TITLE
    this.detailEventTitle = engine.addEntity()
    Transform.create(this.detailEventTitle, {
      position: Vector3.create(0.1, 0.55, 0),
      scale: Vector3.create(0.3, 0.3, 0.3),
      parent: this.detailTextPanel
    })
    TextShape.create(this.detailEventTitle, {
      text: wordWrap(cleanString(_event.name), 45, 3),
      height: 20,
      width: 2,
      fontSize: 2,
      textColor: Color4.Black(),
      textAlign: TextAlignMode.TAM_TOP_LEFT
    })
   
    
 // EVENT DETAILS TEXT BODY
    this.detailText = engine.addEntity()
    Transform.create(this.detailText, {
      position: Vector3.create(0.1, 0.48, 0),
        scale: Vector3.create(0.4, 0.4, 0.4),
        parent: this.detailTextPanel
    })
    TextShape.create(this.detailText, {
      text:  '\n\n' + wordWrap(cleanString(_event.description), 75, 11) + '</cspace>',
      fontSize: 1,
      height: 20,
      width: 2,
      textColor: Color4.fromHexString("#111111FF"),
      textAlign: TextAlignMode.TAM_TOP_LEFT,
      lineSpacing: 0
    })   

    //details website button
    this.readMoreButton = engine.addEntity()
    Transform.create(this.readMoreButton, {
      position: Vector3.create(0.23, -0.2, 0),
      parent: this.detailTextPanel
    })    
    GltfContainer.create(this.readMoreButton, resource.readMoreBtnShape) 

    pointerEventsSystem.onPointerDown(this.readMoreButton,
      async (e) => {
        _openExternalURL(
          'https://events.decentraland.org/en/?event=' + _event.id
        )   
      },
      { hoverText: 'READ MORE', button: InputAction.IA_POINTER }
    )    

    // highlights BG on selection
    this.highlightRays = engine.addEntity()
    Transform.create(this.highlightRays, {
      parent: this.detailsRoot
    })
    GltfContainer.create(this.highlightRays, resource.highlightRaysShape) 
    
    AnimatedItem.create(this.highlightRays, {
      wasClicked:false,
      isHighlighted:false,
      defaultPosition: Vector3.create(0, 0, 0.05),
      highlightPosition:  Vector3.create(0, 0, 0.05),
      defaultScale: Vector3.create(0, 0, 0),
      highlightScale:  Vector3.create(1, 1, 1),
      animFraction: 0,
      animVeclocity: 0,
      speed: 3,
      done: false
    })     
   

    this.highlightFrame = engine.addEntity()
    Transform.create(this.highlightFrame, {
      parent: this.highlightRays
    })
    GltfContainer.create(this.highlightFrame, resource.highlightFrameShape)    
    
  }

  updateItemInfo(_event: any) {
    //image
    this.thumbNail.updateImage(_event.image)

    //live or not
    this.live = _event.live
    if (this.live) {
      //add live badge
      Transform.getMutable(this.liveSign).parent = this.leftDetailsRoot      

      //update jump in button
      TextShape.getMutable(this.jumpButtonText).text = 'JUMP IN'

      pointerEventsSystem.onPointerDown(this.jumpInButton,
        (e) => {
          _teleportTo(_event.coordinates[0] + ',' + _event.coordinates[1])      
        },
        { hoverText: 'JUMP IN', button: InputAction.IA_POINTER }
      )      
      
      Transform.getMutable(this.dateBG).parent = engine.RootEntity
      
    } 
    else {
      // add calendar panel
      Transform.getMutable(this.dateBG).parent = this.leftDetailsRoot

      //update jump in button to sign up button
      TextShape.getMutable(this.jumpButtonText).text = 'SIGN UP'
      

      pointerEventsSystem.onPointerDown(this.jumpInButton,
        (e) => {
          _openExternalURL(
            'https://events.decentraland.org/en/?event=' + _event.id
          )     
        },
        { hoverText: 'CHECK EVENT PAGE', button: InputAction.IA_POINTER }
      )          
      
      Transform.getMutable(this.liveSign).parent = engine.RootEntity
    }

    //date
    this.date = new Date(_event.next_start_at)
    TextShape.getMutable(this.dateRoot).text = this.date.getDate().toString()
    TextShape.getMutable(this.dateMonthRoot).text =  monthToString(
      this.date.getMonth()
    ).toUpperCase()

    //time
    TextShape.getMutable(this.startTime).text = _event.next_start_at.substring(11, 16) + '\nUTC'    

    //title
    let rawText: string = _event.name
    //  remove non-UTF-8 characters
    rawText = cleanString(rawText)
    rawText = wordWrap(rawText, 36, 3)

    TextShape.getMutable(this.title).text = rawText
    

    //coords
    TextShape.getMutable(this.coords).text = (_event.coordinates[0] + ',' + _event.coordinates[1])
    
    pointerEventsSystem.onPointerDown(this.coordsPanel,
      (e) => {
        _teleportTo(_event.coordinates[0] + ',' + _event.coordinates[1])     
      },
      { hoverText: 'GO THERE', button: InputAction.IA_POINTER }
    )      
    
    //detail text
    //remove non-UTF-8 characters and wrap
    TextShape.getMutable(this.detailEventTitle).text =  wordWrap(cleanString(_event.name), 45, 3)

    //remove non-UTF-8 characters and wrap
    TextShape.getMutable(this.detailText).text = '\n\n' + wordWrap(cleanString(_event.description), 75, 11) + '</cspace>'
    
    //details website button (read more)
    pointerEventsSystem.onPointerDown(this.readMoreButton,
      (e) => {
        _openExternalURL('https://events.decentraland.org/en/?event=' + _event.id)    
      },
      { hoverText: 'READ MORE', button: InputAction.IA_POINTER }
    )  

  }

  select() {

    let jumpInButtonInfo = AnimatedItem.getMutable(this.jumpInButton)
    let detailTextInfo = AnimatedItem.getMutable(this.detailTextPanel)
    let highlightRaysInfo = AnimatedItem.getMutable(this.highlightRays)
    let coordsPanelInfo = AnimatedItem.getMutable(this.coordsPanel)
    let timePanelInfo = AnimatedItem.getMutable(this.timePanel)

    if (!this.selected) {
      
      this.selected = true
      jumpInButtonInfo.isHighlighted = true
      jumpInButtonInfo.done = false

      detailTextInfo.isHighlighted = true
      detailTextInfo.done = false

      highlightRaysInfo.isHighlighted = true
      highlightRaysInfo.done = false

      coordsPanelInfo.isHighlighted = true
      coordsPanelInfo.done = false

      timePanelInfo.isHighlighted = true
      timePanelInfo.done = false      

    }
  }

  deselect(_silent?: boolean) {
    if (this.selected) {
      this.selected = false      
    }
    let jumpInButtonInfo = AnimatedItem.getMutable(this.jumpInButton)
    let detailTextInfo = AnimatedItem.getMutable(this.detailTextPanel)
    let highlightRaysInfo = AnimatedItem.getMutable(this.highlightRays)
    let coordsPanelInfo = AnimatedItem.getMutable(this.coordsPanel)
    let timePanelInfo = AnimatedItem.getMutable(this.timePanel)

    jumpInButtonInfo.isHighlighted = false
    jumpInButtonInfo.done = false

    detailTextInfo.isHighlighted = false
    detailTextInfo.done = false

    highlightRaysInfo.isHighlighted = false
    highlightRaysInfo.done = false

    coordsPanelInfo.isHighlighted = false
    coordsPanelInfo.done = false

    timePanelInfo.isHighlighted = false
    timePanelInfo.done = false  

    // if(!_silent){
    //     sfx.menuDeselectSource.playOnce()
    // }
  }
  show() {}
  hide() {}
}
