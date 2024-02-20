import { GltfContainer, Material, PBGltfContainer, PBMaterial_PbrMaterial, Texture, TextureUnion } from "@dcl/sdk/ecs"
import { Color3, Color4 } from "@dcl/sdk/math"

const modelFolder = "models/lobby/"


export let roundedSquareAlpha:TextureUnion =  Material.Texture.Common({src:"images/rounded_alpha_square.png"})
export let dummySceneBG =  Material.Texture.Common({src:"images/dummy_scene.png"})
export let beamUIBG = Material.Texture.Common({src:"images/ui_beam_up_bg.png"})

//USAGE
/*
GltfContainer.create( discordShape )
*/
//SOCIAL LINKS
export let discordShape:PBGltfContainer =           {src:modelFolder + "icons/discord.glb"}
export let twitterShape:PBGltfContainer =           {src:modelFolder + "icons/twitter.glb"}

//BEAM
export let portalSpiralShape:PBGltfContainer =      {src:modelFolder + "portal_lift_spiral.glb"}
export let beamShape:PBGltfContainer =              {src:modelFolder + "beam_cutout.glb"}//{src:modelFolder + "beam.glb"}

//MENU
export let menuPillarsShape:PBGltfContainer =       {src:modelFolder + "menu_pillars.glb"}
export let menuBaseShape:PBGltfContainer =          {src:modelFolder + "menu_base.glb"}
export let menuTopEventsShape:PBGltfContainer =     {src:modelFolder + "menu_top_events.glb"}
export let menuTopCrowdShape:PBGltfContainer =      {src:modelFolder + "menu_top_crowd.glb"}
export let menuTopClassicsShape:PBGltfContainer =   {src:modelFolder + "menu_top_classics.glb"}
export let dateBGShape:PBGltfContainer =            {src:modelFolder + "date_bg.glb"}
export let shelfShape:PBGltfContainer =             {src:modelFolder + "shelf_clickable.glb"}
export let jumpInButtonShape:PBGltfContainer =      {src:modelFolder + "jump_in_btn.glb"}
export let detailsBGShape:PBGltfContainer =         {src:modelFolder + "details_bg.glb"}
export let highlightFrameShape:PBGltfContainer =    {src:modelFolder + "highlight_frame.glb"}
export let highlightFrameFullShape:PBGltfContainer ={src:modelFolder + "highlight_frame_full.glb"}
export let highlightRaysShape:PBGltfContainer =     {src:modelFolder + "highlight_rays.glb"}
export let readMoreBtnShape:PBGltfContainer =       {src:modelFolder + "read_more_btn.glb"}
export let coordsPanelShape:PBGltfContainer =       {src:modelFolder + "coords_panel.glb"}
export let menuTitleBGShape:PBGltfContainer =       {src:modelFolder + "menu_title_bg.glb"}
export let liveSignShape:PBGltfContainer =          {src:modelFolder + "live_bg.glb"}
export let timePanelShape:PBGltfContainer =         {src:modelFolder + "time_panel.glb"}
export let scrollInstructionShape:PBGltfContainer = {src:modelFolder + "scroll_instructions.glb"}
export let playerCounterBGShape:PBGltfContainer =   {src:modelFolder + "player_counter_bg.glb"}
export let refreshShape:PBGltfContainer =           {src:modelFolder + "refresh_button.glb"}
export let loadMoreShape:PBGltfContainer =          {src:modelFolder + "load_more_btn.glb"}
export let menuArrowShape:PBGltfContainer =         {src:modelFolder + "menu_arrow.glb"}
export let remainingBGShape:PBGltfContainer =       {src:modelFolder + "remaining_time_bg.glb"}

// CLOUDS
export let cloudDissolveShape:PBGltfContainer=      {src:modelFolder + "cloud_dissolve.glb"}
export let cloudPuffShape:PBGltfContainer=          {src:modelFolder + "cloud_puff.glb"}
export let cloudSmallShape:PBGltfContainer=         {src:modelFolder + "clouds_small.glb"}
export let cloudSmall2Shape:PBGltfContainer=        {src:modelFolder + "clouds_small2.glb"}
export let cloudBigShape:PBGltfContainer=           {src:modelFolder + "clouds_big_cutout.glb"}//{src:modelFolder + "clouds_big.glb"}
export let cloudSpiralShape:PBGltfContainer=        {src:modelFolder + "cloud_spirals.glb"}


// PLATFORM
export let vortex1Shape:PBGltfContainer=            {src:modelFolder + "vortex1.glb"}
export let vortex2Shape:PBGltfContainer=            {src:modelFolder + "vortex2.glb"}
export let divingSignShape:PBGltfContainer=         {src:modelFolder + "diving_sign.glb"}

// BAR NPCs
export const octopusModelPath = 'models/core_building/BobOctorossV46.glb'
export const fashionistModelPath = 'models/core_building/WearableConnoisseurRotatedV08.glb'
export const aritst1ModelPath = 'models/core_building/ch1_crowdV5.glb'
export const aritst2ModelPath = 'models/core_building/ch2_crowdV5.glb'
export const dogeModelPath = 'models/core_building/doge.glb'
export const simoneModelPath = 'models/core_building/Simone.glb'
export const robModelPath = 'models/core_building/'
export const aishaModelPath = 'models/core_building/Aisha.glb'


//Audio
export const navigationForwardSfx = `sounds/navigationForward.mp3`



export const dateBGColor:Color4 = Color4.fromHexString("#cdcdcdff")
export const dateMonthColor:Color4 = Color4.fromHexString("#ff3333ff")
export const dateDayColor:Color4 = Color4.fromHexString("#000000ff")
export const remainingWhite:Color4 = Color4.fromHexString("#ffffffff")
export const remainingRed:Color4 =  Color4.fromHexString("#ff5533ff")

export let dateUIBGMaterial:PBMaterial_PbrMaterial = {
    albedoColor : dateBGColor,
    alphaTexture : roundedSquareAlpha,
    transparencyMode : 2,
    metallic : 0,
    roughness : 1,
    specularIntensity : 0
}


