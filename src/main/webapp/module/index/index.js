function onIndexPageLoaded(){
 	LUI.ImportPage.createNew({
 		"component":"importSubpage",
 		"label":"examples",
 		"name":"import_examples",
 		"autoLoad":"true",
 		"renderto":"#rightContent",
 		"pageURL":"examples/dataset/gnDataset/gnDataset.html"
 	}); 
}