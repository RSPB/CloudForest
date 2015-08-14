CloudForest
=========

The CloudForest is a repository of scripts for calculation and visualisation of deforestation using Google Earth Engine (GEE), a cloud computing platform dedicated to geo-spatial analysis. The JavaScript code is meant to be executed on GEE Playground, a web-based programming interface to the Engine. 

Information on deforestation was obtained from the Global Forest Change (GFC) map (Hansen et al. 2013). 

ecoregions.js
---------
Calculation of forest area in 2000 and the sustained loss in 2001 - 2012 for the selected WWF ecoregion. Since the GFC map algorithm evaluates as tree any vegetation taller than 5 metres, and we were mostly interested in natural forest, we excluded from our analysis known wood fibre and oil palm plantations. 

grid_30km.js
---------
Computation of global deforestation for a 30km x 30km grid cells.
