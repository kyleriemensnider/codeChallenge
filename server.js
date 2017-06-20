'use strict';
var request = require("request");
var express = require('express');
var app = express();
var sassMiddleware = require('node-sass-middleware');

app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
var path = require('path');

app.use(sassMiddleware({
    src: __dirname + '/sass',
    dest: __dirname + '/public',
    debug: true,
    outputStyle: 'compressed'
  }),
);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
  res.render('index');
});
app.get('/events', function(req, res){
  request({
      url: 'https://api.zoomcare.com/zoomapi-service/v2/rest/content/type/event',
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var postsLists = Object.keys(body).map(function(value){

          return body[value];
        });
        function ordinal_suffix_of(i) {
          var j = i % 10,
              k = i % 100;
          if (j == 1 && k != 11) {
              return i + "st";
          }
          if (j == 2 && k != 12) {
              return i + "nd";
          }
          if (j == 3 && k != 13) {
              return i + "rd";
          }
          return i + "th";
        }
        function getFormattedTime(fourDigitTime) {
          var hours24 = parseInt(fourDigitTime.substring(0, 2),10);
          var hours = ((hours24 + 11) % 12) + 1;
          var amPm = hours24 > 11 ? 'pm' : 'am';
          return hours + amPm;
        };
          var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          var weekdayNames = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
          for (var p in postsLists) {
            if( postsLists[p].day  ) {
              var date = postsLists[p].day.replace(/-/g,'');
              var date = new Date(postsLists[p].day);
              postsLists[p].weekday = weekdayNames[date.getDay()];
              postsLists[p].day = ' '+ monthNames[date.getMonth()] + ' ' + ordinal_suffix_of(date.getDate()) + '';
            }
            if( postsLists[p].start  ) {
              var startTime = getFormattedTime(postsLists[p].start);
              postsLists[p].start = startTime;
            }
            if( postsLists[p].finish  ) {
              var finishTime = getFormattedTime(postsLists[p].finish);
              postsLists[p].finish = finishTime;
            }
            if( postsLists[p].description.length > 300  ) {
              postsLists[p].more = 'read-more';
              postsLists[p].summary = postsLists[p].description.substr( 0, postsLists[p].description.lastIndexOf( ' ', 300 ) ) + '...';
              //console.log(postsLists[p].summary);
            }
          }
          // console.log(postsLists)
          res.status(503);
          res.render('events', {
            posts: postsLists,
            json : JSON.stringify(postsLists)
          });

      }
    });
});
app.listen(3000, function(){
  console.log('The frontend server is running port 3000');
});
