/* The code is also available at:
   https://ee-api.appspot.com/ae2e427b6f82c5a2cbf8e91403724604
   where it can be directly executed */

var scale = 200; // in metres

var gfcImage = ee.Image('UMD/hansen/global_forest_change_2013');
var grid = ee.FeatureCollection('ft:1twk3A1sU5XNeWBSezKMXoUrpIkHqJrIRQlh-JcUV');
var forest2000Image = gfcImage.select('treecover2000').divide(100);
var forestArea2000Image = forest2000Image.multiply(ee.Image.pixelArea());

var forest2000 = forestArea2000Image.reduceRegions({
 'collection': grid,
 'reducer': ee.Reducer.sum(),
 'scale': scale,
});

var taskParams = {
 'driveFolder' : '',
 'fileFormat' : 'CSV'
};

Export.table(forest2000, 'Tree_cover_area_in_2000_per_cell', taskParams);

var lossImage = gfcImage.select('loss');
var totalTreeCoverLoss = forest2000Image.mask(lossImage);
var totalTreeCoverLossArea = totalTreeCoverLoss.multiply(ee.Image.pixelArea());

var totalLoss = totalTreeCoverLossArea.reduceRegions({
 'collection': grid,
 'reducer': ee.Reducer.sum(),
 'scale': scale,
});

Export.table(totalLoss, 'Gross_tree_cover_loss_per_cell', taskParams);

var gainImage = gfcImage.select('gain');
var gainOnly = gainImage.and(lossImage.not());
var gainOnlyArea = gainOnly.multiply(ee.Image.pixelArea());

var totalGain = gainOnlyArea.reduceRegions({
 'collection': grid,
 'reducer': ee.Reducer.sum(),
 'scale': scale,
});

Export.table(totalGain, 'Gross_tree_cover_gain_per_cell', taskParams);
