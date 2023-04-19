import { engine, executeTask, Material } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { addBuildings } from './modules/buildings'
//import { placeDoors } from './modules/bar/doors'
import { barPlatforms } from './modules/platforms'
import { addCloudLobby } from './lobby/cloudLobby'


// export all the functions required to make the scene work
export * from '@dcl/sdk'

//// ADD CLOUD LOBBY

addCloudLobby()

//// ADD BUILDINGS

addBuildings()

///////// BAR STUFF

// BAR DOORS

/*
//TODO TAG:PORT-REIMPLEMENT-ME
placeDoors()
*/
barPlatforms()

/*
//TODO TAG:PORT-REIMPLEMENT-ME

utils.setTimeout(20000, () => {
  if (!areNPCsAdded) {
    handleQuests()
    addBarNPCs()
  }
})

/// TRIGGER FOR STUFF OUTSIDE BAR

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(50, 25, 50), new Vector3(160, 10, 155)),
  {
    onCameraEnter: () => {
      //debugger
      //insideBar()
    },
    onCameraExit: async () => {
      await lowerVolume()
      outsideBar()
      log('stepped out')
    },
  }
)

// proper bar interior
addRepeatTrigger(
  new Vector3(160, 50, 155),
  new Vector3(50, 102, 50),
  () => {
    setBarMusicOn()
    log('went in')
  },
  null,
  false,
  () => {
    outOfBar()
    endArtistTalk()
    lowerVolume()
    log('mid distance')

    //setBarMusicOff()
  }
)

//outer perimeter
addRepeatTrigger(
  new Vector3(160, 30, 155),
  new Vector3(75, 60, 75),
  () => {
    lowerVolume()
    log('got closer')
  },
  null,
  false,
  () => {
    setBarMusicOff()
    log('got far')
  }
)

/// TRIGGERS AROUND PLAZA

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(2, 5, 305), new Vector3(0, 2, 160)),
  {
    onCameraEnter: () => {
      log('WEST BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(2, 5, 320), new Vector3(320, 2, 155)),
  {
    onCameraEnter: () => {
      log('EAST BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(320, 5, 2), new Vector3(165, 2, 0)),
  {
    onCameraEnter: () => {
      log('SOUTH BORDER')
      outsideBar()
    },
  }
)

utils.addOneTimeTrigger(
  new utils.TriggerBoxShape(new Vector3(320, 5, 2), new Vector3(155, 2, 300)),
  {
    onCameraEnter: () => {
      log('NORTH BORDER')

      outsideBar()
    },
  }
)
*/

/**
 * @public
 */
declare class ObservableComponent {
  private subscriptions;
  static component(target: ObservableComponent, propertyKey: string): void;
  static field(target: ObservableComponent, propertyKey: string): void;
  static uiValue(target: ObservableComponent, propertyKey: string): void;
  static readonly(target: ObservableComponent, propertyKey: string): void;
  onChange(fn: ObservableComponentSubscription): this;
  toJSON(): any;
}

/** @public */
declare type ObservableComponentSubscription = (key: string, newVal: any, oldVal: any) => void;


/**
 * @public
 */
declare class AudioStreaming extends ObservableComponent {
  readonly url: string;
  playing: boolean;
  volume: number;
  constructor(url: string);
}

export let audioStream: AudioStreaming
/**
 * @public
 */
declare class AnimationState extends ObservableComponent {
  /**
   * Name of the animation in the model
   */
  readonly clip: string;
  /**
   * Does the animation loop?, default: true
   */
  looping: boolean;
  /**
   * Weight of the animation, values from 0 to 1, used to blend several animations. default: 1
   */
  weight: number;
  /**
   * Is the animation playing? default: true
   */
  playing: boolean;
  /**
   * Does any anyone asked to reset the animation? default: false
   */
  shouldReset: boolean;
  /**
   * The animation speed
   */
  speed: number;
  /**
   * Layering allows you to have two or more levels of animation on an object's parameters at the same time
   */
  layer: number;
  constructor(clip: string, params?: AnimationParams);
  /**
   * Sets the clip parameters
   */
  setParams(params: AnimationParams): this;
  toJSON(): any;
  /**
   * Starts the animation
   */
  play(reset?: boolean): void;
  /**
   * Pauses the animation
   */
  pause(): void;
  /**
   * Resets the animation state to the frame 0
   */
  reset(): void;
  /**
   * Resets and pauses the animation
   */
  stop(): void;
}

/** @public */
declare type AnimationParams = {
  looping?: boolean;
  speed?: number;
  weight?: number;
  layer?: number;
};

/**
 * @public
 */
declare enum ActionButton {
  POINTER = "POINTER",
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  ANY = "ANY",
  FORWARD = "FORWARD",
  BACKWARD = "BACKWARD",
  RIGHT = "RIGHT",
  LEFT = "LEFT",
  JUMP = "JUMP",
  WALK = "WALK",
  ACTION_3 = "ACTION_3",
  ACTION_4 = "ACTION_4",
  ACTION_5 = "ACTION_5",
  ACTION_6 = "ACTION_6"
}

/**
 * @public
 */
declare type OnPointerUUIDEventOptions = {
  button?: ActionButton;
  hoverText?: string;
  showFeedback?: boolean;
  distance?: number;
};