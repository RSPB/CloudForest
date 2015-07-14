// Ecoregions - selected realm
/* Script allows calculation of forest area in 2000 and the loss it sustained
   in 2001 - 2012 from the Global Forest Change map, Hansen et al. (2013) */

// Parameters 
var display = true; // draw deforestation maps
var scale = 100; // scale in metres which will be used for computations

/* WWF ecoregions downloaded from http://assets.worldwildlife.org/publications/15/files/original/official_teow.zip?1349272619
   Legend: https://stuff.mit.edu/afs/athena/course/11/11.951/ecoplan/data/ecoregions/wwf_terr_ecos.htm */
var ecoregions = ee.FeatureCollection('ft:1GzN7apqS42eIZNUoS4uZoXyspckUuPh4dzLe0wMI', 'geometry'); // Vector map with ecoregions
var selectedRegion = ecoregions.filterMetadata('REALM', 'equals', 'IM'); // select particular realm; GEE will also handle complete data set

// Concessions: https://sites.google.com/site/earthengineapidocs/tutorials/global-forest-change-tutorial/reference-guide
var oilPalm = ee.FeatureCollection('ft:1Q-5XgXQpAeRhILPoPTx8gnGTzUpSJx-EtKu_BCw', 'geometry');
var woodFibre = ee.FeatureCollection('ft:1uqBi75K8AtJa3q4C-DuKUPYRMGvFHtp0c7E-VTA', 'geometry');
oilPalm = oilPalm.filterBounds(selectedRegion); // Limit selection to specific area
woodFibre = woodFibre.filterBounds(selectedRegion);
var oilPalmAndWoodFibre = oilPalm.merge(woodFibre); // Merge into a single feature collection

// Ref: https://sites.google.com/site/earthengineapidocs/tutorials/global-forest-change-tutorial/reference-guide
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2013').clip(selectedRegion); 
var treecover2000 = gfcImage.select('treecover2000');
var treecover2000_noConcessions = treecover2000.paint(oilPalmAndWoodFibre, 0); // remove oil palm and wood fibre plantations

/* Get elevation map and clip it to 500m. Output of this operation will be an image 
   with '1' up to 500m and '0' above this value */
var gtopo30 = ee.Image('USGS/GTOPO30').lte(500); 
// Multiplication of both images produces an area with altitude clipped to 500m
var treecover2000_noConcessions_elev = treecover2000_noConcessions.multiply(gtopo30);

/* To calculate the total forest area we need to sum all pixels in an image.
   This what ee.Reducer.sum() does */
var forest2000 = treecover2000_noConcessions_elev.divide(100).reduceRegions({
  'collection': selectedRegion,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});

// Similar procedure is applied to calculate the forest loss
var lossImage = gfcImage.select('loss');
var lossArea = treecover2000.mask(lossImage).multiply(ee.Image.pixelArea());
var lossArea_noConcessions = lossArea.paint(oilPalmAndWoodFibre, 0);
var lossArea_noConcessions_elev = lossArea_noConcessions.multiply(gtopo30);

var loss2012 = lossArea_noConcessions_elev.divide(100).reduceRegions({
  'collection': selectedRegion,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});

// Until now no computations have taken place. Here we define tasks that will perform the calculations 
var taskParams = { 'driveFolder' : '', 'fileFormat' : 'CSV' };
Export.table(forest2000, 'forest_area_2000', taskParams);
Export.table(loss2012, 'forest_loss_total', taskParams);

// Visualisation
var vis = {'min': [1], 'max': [100], 'palette': '000000, 00FF00'}; // define range of colours (100 shades of green)
Map.addLayer(treecover2000.mask(treecover2000), vis, 'Tree cover in 2000 with concessions excluded and altitude clipped - green', display);
Map.addLayer(lossImage.mask(lossImage), {'palette': 'FF0000'}, 'Loss - red', display); // Add the loss layer in red          
var gainImage = gfcImage.select('gain');
Map.addLayer(gainImage.mask(gainImage), {'palette': '0000FF'}, 'Gain - blue', display); // Add the gain layer in blue   
Map.addLayer(oilPalm, {'color': '00FFFF'}, 'Oil palm - aqua', display);
Map.addLayer(woodFibre, {'color': 'FF00FF'}, 'Wood fibre - pink', display);
Map.centerObject(selectedRegion); // Centre the map
