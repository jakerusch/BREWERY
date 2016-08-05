var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

// my personal API Key and url string for BreweryDB.com
var myAPIKey = '';

// create main loading window
var splashWindow = new UI.Window({
  backgroundColor: 'white' 
});

// create beer glass logo
var image = new UI.Image({
  position: new Vector2(0, 12),
  size: new Vector2(144, 144),
  image: 'images/GLASS.PNG',
});
image.compositing('set');

// add image to window
splashWindow.add(image);

var text = new UI.Text({
  position: new Vector2(0, 152),
  size: new Vector2(144, 16),
  font: 'gothic-14',
  textAlign: 'center',
  color: 'black',
  text: 'fetching brewery data...'
});

// add text to window
splashWindow.add(text);

// load window
splashWindow.show();

// grab data
getLocation();

// parse data and return for menu
var parseFeed = function(data) {
  var quantity = data.totalResults;
  console.log('Number of locations ' + quantity);

  var items = [];
  var shortName = '';
  var locationType = '';
  var distance = '';
    
  for(var i=0; i<quantity; i++) {
    if(data.data[i].brewery.nameShortDisplay) {
      shortName = data.data[i].brewery.nameShortDisplay;
      console.log('shortName = ' + shortName);
    }
    if(data.data[i].locationType) {
      locationType = data.data[i].locationType;
      locationType = capitalizeFirstLetter(locationType);
      console.log('locationType = ' + locationType);
    }    
    if(data.data[i].distance) {
      distance = data.data[i].distance;
      console.log('distance = ' + distance);
    }        
    items.push({
      title:shortName,
      subtitle:distance + 'mi ' + locationType,
    });
  }
  return items;
};

function getData(pos) {
  // make request to brewerydb.com
//   pos.coords.latitude = '29.5416669';
//   pos.coords.longitude = '-98.5772314';
  ajax(
    {
      url: 'http://api.brewerydb.com/v2/search/geo/point?key=' + myAPIKey + 
      '&lat=' + pos.coords.latitude + 
      '&lng=' + pos.coords.longitude + 
      '&radius=10&unit=mi',
      type: 'json'
    },
    function(data) {
      var menuItems = parseFeed(data);
      
      // get locality
      var city = data.data[0].locality;
      
      var resultsMenu = new UI.Menu({
        sections: [{
          title: city + ' Breweries',
          items: menuItems,
        }]
      });
      
      // get detailed results and create card
      resultsMenu.on('select', function(e) {
        var name = '';
        var shortName = '';
        var phone = '';
        var hours = '';
        var locationTypeDisplay = '';
        var distance = '';        
        
        if(data.data[e.itemIndex].brewery.name) {
          name = data.data[e.itemIndex].brewery.name;
          console.log('name = ' + name);
        }
        if(data.data[e.itemIndex].brewery.nameShortDisplay) {
          shortName = data.data[e.itemIndex].brewery.nameShortDisplay;
          console.log('shortName = ' + shortName);
        }
        if(data.data[e.itemIndex].phone) {
          phone = data.data[e.itemIndex].phone;
          phone = fixPhone(phone);
          console.log('phone = ' + phone);
        }
        if(data.data[e.itemIndex].hoursOfOperation) {
          hours = data.data[e.itemIndex].hoursOfOperation;
          console.log('hours = ' + hours);
        }
        if(data.data[e.itemIndex].locationTypeDisplay) {
          locationTypeDisplay = data.data[e.itemIndex].locationTypeDisplay;
          console.log('locationTypeDisplay = ' + locationTypeDisplay);
        }    
        if(data.data[e.itemIndex].distance) {
          distance = data.data[e.itemIndex].distance;
          console.log('distance = ' + distance);
        }     
        
        // create detailed card
        var detailCard = new UI.Card({
          title:name,
          subtitle:distance + 'mi\n' + locationTypeDisplay + '\n' + phone,
          body:hours,
          scrollable:true,
          style:'small'
        });
        detailCard.show();    
      });
      
      resultsMenu.show();
      splashWindow.hide();
    },
    function(error) {
      console.log('Download failed: ' + error);
    }
  );
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    getData,
    getDataError,
    {timeout: 15000, maximumAge: 60000}
  );
}

function getDataError(err) {
  console.log("Error requesting location!");
}

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function fixPhone(str) {
  // remove unwanted characters
  var temp = '';
  for(var i=0; i<str.length; i++) {
    if(str[i]!=' ' && str[i]!='(' && str[i]!=')' && str[i]!='.' && str[i]!='-') {
      temp = temp + str[i];
    }
  }
//   var temp = str.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').replaceAll('.', '').replaceAll('-', '');
  console.log('temp = ' + temp);
  // remove leading 1
  if(temp.length==11) {
    temp = temp.substring(1);
  }
  if(temp.length==10) {
    var oneTemp = temp.substring(0, 3);
    var twoTemp = temp.substring(3, 6);
    var threeTemp = temp.substring(6);
    temp = '(' + oneTemp + ') ' + twoTemp + '-' + threeTemp;
  }
  return temp;
}
