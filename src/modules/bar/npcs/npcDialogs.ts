import * as npcLib from 'dcl-npc-toolkit'
import type { Dialog } from 'dcl-npc-toolkit'
import { Entity } from "@dcl/sdk/ecs"
import { Vector3 } from '@dcl/sdk/math';
import * as utils from '@dcl-sdk/utils'
import { _teleportTo, log } from "../../../back-ports/backPorts";
import { boyArtist, girlArtist } from './artistCoupleNpcs';

const octopusYesDialog = 4
const octopusEndDialog = 3

export const octopusDialog = [
  {
    text: 'Welcome traveler, how can I help you!',
    skipable: true,
  },
  {
    text: 'I may look quite busy, but worry not, I still have like 2 free hands and/or tentacles to spare.',
    skipable: true,
  },
  {
    text: 'Is this your first time here? Do you want some pointers about how you can get around the place?',
    isQuestion: true,
    buttons: [
      { label: 'NO', goToDialog: octopusEndDialog },
      {
        label: 'YES',
        goToDialog: octopusYesDialog,
      },
    ],
  },
  {
    name: 'end',
    text: 'Oh well, if for any reason you need a hand and/or tentacle, I’ll be here!',
    isEndOfDialog: true,
    triggeredByNext: () => {
      //   if (!query(questProg).isTaskCompleted(taskIds.intro)) {
      //     octopus.talk(OctoQuest, 'questQ')
      //   } else {
      console.log('ended conversation')
      console.log("back to idle animation")
      //backToIdle()
      //   }
    },
  },
  {
    name: 'yes',
    text: 'Here you can also find funky characters like myself. Don’t be shy, chat them up, everyone has a story to tell.',
    skipable: true,
  },
  {
    text: 'You can also take that glowing beam of light back up to the happy place up in the clouds where you started out.',

    skipable: true,
  },
  {
    text: 'There you can find a whole bunch of suggestions of places inside Decentraland you can visit, including <color="red">live events</color> and other highlights.',

    skipable: true,
  },
  {
    text: 'You can also open up the map and <color="red">fast travel</color> anywhere! Just press <color="red">M</color> on your keyboard and explore it. You’ll see it’s pretty damn big!',

    skipable: true,
  },
  {
    text: 'Or you can just walk out the door and keep walking, and see what you run into.',

    skipable: true,
  },
  {
    text: 'Right now we’re in the center of the <color="red">Genesis Plaza</color>, a community-owned space that´s open to everyone. The roads fan out in all directions from here.',

    skipable: true,
  },
  {
    text: 'If you venture out into the world beyond the plaza, you’ll see that the content is created by our growing community. Randomly bumping into things you didn’t expect is half the fun here.',

    skipable: true,
    triggeredByNext: () => {
      //   if (!query(questProg).isTaskCompleted(taskIds.intro)) {
      //     octopus.talk(OctoQuest, 'questQ')
      //   } else {
      //npcLib.talk(octopus, octoHi, getDialogIndex('normalEnd', octoHi))
      //   }
    },
  },
  {
    name: 'normalEnd',
    text: 'Well that´s it from me. So what are you waiting for? Go and explore the world!',

    skipable: true,
    //triggeredByNext: () => {
    //console.log("back to idle animation")
    //backToIdle()
    //},
    isEndOfDialog: true,
  },
]

export const fashionistNoneDialog: number = 0
export const fashionistCommonDialog: number = 3
export const fashionistEpicDialog: number = 5
export const fashionistMythicDialog: number = 6
export const fashionistDefaultDialog: number = 7


export function getFashionistDialog(npc: Entity): Dialog[] {
  let dialog = [
    {
      name: 'none',
      text: 'Why? … Umm, what would someone <i>dressed like you</i> have to say to me?',
      skipable: true,
    },
    {
      text: 'Clearly you just put on whatever rags you slept in and think that’s an outfit, let me tell you something: you don’t cause a good impression on me like that.',
      skipable: true,
    },
    {
      text: 'I guess you’re fine, I mean <i>we’re not going to be friends</i>, but I’m feeling generous today and will acknowledge that you exist.',
      skipable: true,
      triggeredByNext: () => {
        npcLib.talk(npc, dialog, fashionistDefaultDialog)
      },
    },
    {
      name: 'common',
      text: 'Well look at you, <i>all dressed up</i> with outlet-grade clothes that you probably bought at a gas station.',
      skipable: true,
    },
    {
      text: 'I guess you’re fine, I mean <i>we’re not going to be friends</i>, but I’m feeling generous today and will acknowledge that you exist.',
      skipable: true,
      triggeredByNext: () => {
        npcLib.talk(npc, dialog, fashionistDefaultDialog)
      },
    },
    {
      name: 'epic',
      text: 'I see that you know how to present yourself. If only everyone had a baseline of taste like yours. <i>Not that it’s a very high bar</i>, but it would be quite an improvement.',
      skipable: true,
      triggeredByNext: () => {
        npcLib.talk(npc, dialog, fashionistDefaultDialog)
      },
    },
    {
      name: 'mythic',
      text: 'Oh well <i>finally</i> someone I can talk to here without feeling embarrassed to be seen. You sir know how to dress, well done!',
      skipable: true,
      triggeredByNext: () => {
        npcLib.talk(npc, dialog, fashionistDefaultDialog)
      },
    },
    {
      // had to add a dummy to skip to
      name: 'default',
      text: 'I always say <i>“you are what you wear”</i>. So true. Dressing up is all about expressing who you want to be in the eyes of others.',
      skipable: true,
    },
    {
      text: 'I always say <i>“you are what you wear”</i>. So true.\nDressing up is all about expressing who you want to be in the eyes of others.',
      skipable: true,
    },
    {
      text: 'Me, as you can tell, I’m <i>one of a kind</i>. Dressed in the finest Non-Fungible Tokens in the marketplace. Worthy of a queen!',
      skipable: true,
    },
    {
      text: 'And you, who do your clothes say you are?\n<i>Have a think about that, hun</i>.',
      skipable: true,
      isEndOfDialog: true,
      triggeredByNext: () => {
        console.log("barNpcs", "end dialog")
        npcLib.playAnimation(npc, `Idle`, false)
        /*
        utils.timers.tweens.startRotation(npc,
          Transform.get(npc).rotation,
          Quaternion.fromEulerDegrees(0, 0, 0),
          3,
          utils.timers.InterpolationType.EASEINSINE
        )
        */
        /*
        wearablesC.endInteraction()
        wearablesC.playAnimation('TurnOut', true, 1.47)
        wearablesC.addComponentOrReplace(
          new utils.timers.RotateTransformComponent(
            wearablesC.getComponent(Transform).rotation.clone(),
            Quaternion.Euler(0, 0, 0),
            1
          )
        )
        */
      },
    },
  ]
  return dialog
}

const no: number = 1
const dummy: number = 2
const voltaire: number = 3
const museum: number = 4
const rapture: number = 5
const hunderedX: number = 6
const momus: number = 7
const vegas: number = 8
const skate: number = 9
const end: number = 10

const boyFirstDialog: number = 0
const boySecondDialog: number = 1
const boyThirdDialog: number = 2
const boyFourthDialog: number = 3
const boyFifthDialog: number = 4

const girlFirstDialog: number = 0
const girlSecondDialog: number = 2
const girlThirdDialog: number = 3
const girlFourthDialog: number = 5
const girlFifthDialog: number = 6
const girlSixthDialog: number = 7


export let artistRecommendations: Dialog[] = [
  {
    text: 'Hey so you want to find out where you can find good art to admire?',
    isQuestion: true,
    buttons: [
      { label: 'no', goToDialog: no },
      { label: 'yes', goToDialog: voltaire },
    ],
  },
  {
    name: 'no',
    text: 'Alright, I’ll be around if you want to hear more.',
    isEndOfDialog: true,
    triggeredByNext: () => {
      turnOutAritsts(() => nextGirlDialog(girlFirstDialog))
    },
  },
  {
    name: 'dummy',
    text: '',
    isEndOfDialog: true,
  },
  {
    name: 'voltaire',
    text: 'Ok, so first there’s <color="red">Voltaire District</color>, at 55,97. Lots of big players in the crypto art space have spot there.',
    // isQuestion: true,
    //   buttons: [
    //     { label: 'More', goToDialog: museum },
    //     {
    //       label: 'Visit',
    //       goToDialog: dummy,
    //       triggeredActions: () => {
    //         artistsTalkToEachOther()
    //         teleportPlayer(55, 97)
    //       },
    //     },
    //   ],
  },
  {
    name: 'museum',
    text: 'There’s the <color="red"> Museum District</color> at 20,80, quite a pioneer of the metaverse.',
    // isQuestion: true,
    // buttons: [
    //   { label: 'More', goToDialog: rapture },
    //   {
    //     label: 'Visit',
    //     goToDialog: 'dummy',
    //     triggeredActions: () => {
    //       //artist1.endInteraction()
    //       artistsTalkToEachOther()
    //       teleportPlayer(20, 80)
    //     },
    //   },
    // ],
  },
  {
    name: 'rapture',
    text: 'The  <color="red">Rapture Gallery</color> at -88,-65 is also a really hip spot worth visiting',
    // isQuestion: true,
    // buttons: [
    //   { label: 'More', goToDialog: hunderedX },
    //   {
    //     label: 'Visit',
    //     goToDialog: 'dummy',
    //     triggeredActions: () => {
    //       //artist1.endInteraction()
    //       artistsTalkToEachOther()
    //       teleportPlayer(-88, -65)
    //     },
    //   },
    // ],
  },
  {
    name: '100x',
    text: 'Also  <color="red">100x Gallery</color>, at 86,-24, there’s a whole bunch of things around that area.',
    // isQuestion: true,
    // buttons: [
    //   { label: 'More', goToDialog: momus },
    //   {
    //     label: 'Visit',
    //     goToDialog: 'dummy',
    //     triggeredActions: () => {
    //       //artist1.endInteraction()
    //       artistsTalkToEachOther()
    //       teleportPlayer(86, -24)
    //     },
    //   },
    // ],
  },
  {
    name: 'momus',
    text: ' <color="red">Momus Park</color> covers a huge area made up of passages, it’s quite a scenic route. You could start your visti at 8,43.',
    // isQuestion: true,
    // buttons: [
    //   { label: 'More', goToDialog: vegas },
    //   {
    //     label: 'Visit',
    //     goToDialog: 'dummy',
    //     triggeredActions: () => {
    //       //artist1.endInteraction()
    //       artistsTalkToEachOther()
    //       teleportPlayer(8, 43)
    //     },
    //   },
    // ],
  },
  {
    name: 'vegas',
    text: 'Also the <color="red">Vegas Art Village</color> at -125,100 includes a whole assortment of very creative small museums from the community.',
    // isQuestion: true,
    // buttons: [
    //   { label: 'More', goToDialog: skate },
    //   {
    //     label: 'Visit',
    //     goToDialog: 'dummy',
    //     triggeredActions: () => {
    //       //artist1.endInteraction()
    //       artistsTalkToEachOther()
    //       teleportPlayer(-125, 100)
    //     },
    //   },
    // ],
  },
  {
    name: 'skate',
    text: 'If you´re looking for a place with a more edgy underground vibe, check out the <color="red">Vegas City Skatepark Gallery</color> at -100,150.',
    // isQuestion: true,
    // buttons: [
    //   { label: 'Done', goToDialog: end },
    //   {
    //     label: 'Visit',
    //     goToDialog: 'dummy',
    //     triggeredActions: () => {
    //       //artist1.endInteraction()
    //       artistsTalkToEachOther()
    //       teleportPlayer(-100, 150)
    //     },
    //   },
    // ],
  },
  {
    name: 'end',
    text: 'Those are the ones that come to mind to me right now. But there´s a LOT more to explore too.',
  },
  {
    isEndOfDialog: true,
    text: 'Hope you have fun exploring!',
    triggeredByNext: () => {
      turnOutAritsts(() => { nextGirlDialog(girlFirstDialog) })
    },
  },
]

// Artists Conversation


export let girlArtistTalk: Dialog[] = [
  {
    name: '1st',
    text: 'So there I was, questioning what my work really meant to me as an artist, after having spent <b>so much</b> time on it and put <b>so much</b> of myself into it.',
  },
  {
    text: 'Now locked up in a container where no one can see my work, where it would hopefully gain value with time or if I die in some <i>flamboyant scandalous way</i>.',
    isEndOfDialog: true,
    triggeredByNext: () => {
      log("DebugSession", "--")
      nextBoyDialog(boyFirstDialog)
    },
  },
  {
    name: '2nd',
    text: 'Well yeah, but back then there wasn’t much of a market for NFTs, <i>or I didn’t know about it at least</i>. I was just trying to make a living by selling canvases, like everyone else.',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextBoyDialog(boySecondDialog)
    },
  },
  {
    name: '3rd',
    text: ' The thing is <b>I would still be removing my work from the public view</b>, the form of payment doesn’t change that.',
  },
  {
    text: 'My audience suddenly got reduced to some rich guy and <i>maybe</i> his occasional dinner guests. That’s the part that upset me.',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextBoyDialog(boyThirdDialog)
    },
  },
  {
    name: '4th',
    text: 'Kinda… <i>yes and no</i>. The owner of the work might be just one person, but it’s still available for any curious eyes out there.',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextBoyDialog(boyFourthDialog)
      turnInBoy()
    },
  },
  {
    name: '5th',
    text: 'Yeah, otherwise our rambling would have bored you to death by now. If all of this space is new to you, <i>you’re in for a treat!</i>',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextBoyDialog(boyFifthDialog)
      npcLib.playAnimation(boyArtist, 'Talk')
    },
  },
  {
    name: '6th',
    text: 'Yeah and well… it’s <i>good</i> art too. A lot of it, at least.',
  },
  {
    text: 'Ask me and I’ll give you some hints.',
    triggeredByNext: async () => {
      turnOutAritsts(() => nextGirlDialog(girlFirstDialog))
    },

    isEndOfDialog: true,
  },
]

export let boyArtistTalk: Dialog[] = [
  {
    name: '1st',
    text: 'And that was <i>such a good time</i> to get into ether, so cheap back then. Imagine if you sold those for eth then?',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextGirlDialog(girlSecondDialog)
    },
  },
  {
    name: '2nd',
    text: ' Just imagine if you sold a painting for 200 eth, it was <b>nothing</b> back then.',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextGirlDialog(girlThirdDialog)
    },
  },
  {
    name: '3rd',
    text: 'But your NFTs also end up going to the wallet of some rich whale just the same.',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextGirlDialog(girlFourthDialog)
    },
  },
  {
    name: '4th',
    text: 'Speaking of audiences, looks like we have one here. Hey! I take it that you have an interest in art',
    isEndOfDialog: true,

    triggeredByNext: () => {
      turnInGirl()
      nextGirlDialog(girlFifthDialog)
    },
  },
  {
    name: '5th',
    text: 'A ton of places you can check out. With <b>crazy expensive</b> virtual art on display. You can’t imagine what some of these cost!',
    isEndOfDialog: true,

    triggeredByNext: () => {
      nextGirlDialog(girlSixthDialog)
    },
  },
]

// Helper Functions
function teleportPlayer(xCoordinate: number, yCoordinate: number) {
  console.log("Try teleporting to ", xCoordinate, ',', yCoordinate);
  _teleportTo(xCoordinate, yCoordinate)
}

export function girlArtistTalkToUser() {
  npcLib.playAnimation(girlArtist, 'TalkToUser', true, 0.5)
  npcLib.playAnimation(boyArtist, 'Talk', true, 0.5)
}

export function boyArtistTalkToUser() {
  npcLib.playAnimation(girlArtist, 'Talk', true, 0.5)
  npcLib.playAnimation(boyArtist, 'TalkToUser', true, 0.5)
}

function artistsTalkToEachOther() {
  npcLib.playAnimation(boyArtist, 'Talk', false)
  npcLib.playAnimation(girlArtist, 'Talk', false)
}

function nextBoyDialog(index: number) {
  npcLib.talkBubble(boyArtist, boyArtistTalk, index)
}

function nextGirlDialog(index: number): void {
  npcLib.talkBubble(girlArtist, girlArtistTalk, index)
}

function turnInBoy() {
  npcLib.playAnimation(boyArtist, 'TurnIn', true, 0.57)
  utils.timers.setTimeout(() => {
    npcLib.playAnimation(boyArtist, 'TalkToUser')
  }, 570)
}

function turnInGirl() {
  npcLib.playAnimation(girlArtist, 'TurnIn', true, 0.57)
  utils.timers.setTimeout(() => {
    npcLib.playAnimation(girlArtist, 'TalkToUser')
  }, 570)
}

function turnOutAritsts(callback?: () => void) {
  log("DebugSession", "Start Timer")
  npcLib.playAnimation(boyArtist, 'TurnOut', true, 0.5)
  npcLib.playAnimation(girlArtist, 'TurnOut', true, 0.5)

  utils.timers.setTimeout(() => {
    log("DebugSession", "Timer Reached")
    artistsTalkToEachOther()
    callback?.()
  }, 500)
}