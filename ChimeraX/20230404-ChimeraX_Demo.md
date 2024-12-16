# ChimeraX Visualization

## File Locations

`
open X:\For_Brandon\WIL2S-Eating\Cropped\*_488nm_*.tif format images
open X:\For_Brandon\WIL2S-Eating\Cropped\*_405nm_*.tif format images
open X:\For_Brandon\WIL2S-Eating\Cropped\*_560nm_*.tif format images
`

## Mesh/Surface Settings

`
volume #1 style surface step 2 level 36.6 color #b2b2b2;
volume #2 style surface step 2 level 22 color #7db95c;
volume #3 style surface step 2 level 15 color #008ed0;
lighting depthCue false;
material dull;
lighting full;
`

## Volume Settings

`
volume #3 style image maximumIntensityProjection true step 1
volume #3.1 color magenta color magenta color magenta color white
volume #3.1 level 0,0 level 130,1 level 289,1
`

## Playthrough Once

`
surface dust #1,2 size 20
surface dust #3 size 5
`

## Camera Positions

`
view matrix camera 0.6801,0.036946,-0.73219,-355.86,-0.62791,0.54487,-0.55575,-60.108,0.37841,0.83771,0.39376,489.88
`

`
view name eating;
`

`
transparency #1 75
`