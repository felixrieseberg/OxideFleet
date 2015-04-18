/* global QUnit */
/* global require */
// dead stupid script to format test output from nw.js to the console
if(!window._phantom){
  var totalTestCount = 0;
  var testCount = 0;
  QUnit.begin(function( details ){
    if(details.totalTests >= 1){
      totalTestCount = details.totalTests;
      console.log('1...' + details.totalTests);
    }
  });

  QUnit.testDone(function(details){
    testCount++;

    if(details.failed === 0){
      console.log('ok ' + testCount + ' - ' + details.module + ' # ' + details.name);
    }


  });

  QUnit.log(function( details ) {

    if (details.result !== true) 
    {
      var actualTestCount = testCount + 1;
      console.log('not ok ' + actualTestCount + ' - ' + details.module + ' - ' + details.name);
      console.log('#    actual: -');
      console.log('#      ' + details.actual);
      console.log('#    expected: -');
      console.log('#      ' + details.expected);
      console.log('#    message: -');
      console.log('#      ' + details.message);
      if(details.source){
        console.log('#      ' + details.source);
      }
      console.log('#    Log:');

      if(details.log){
        console.log('#      ' + details.log);
      }
    }

  });

  QUnit.done(function( details ){
    var gui = require('nw.gui');
    if(details.failed === 0){
    // quit with no error
      gui.App.quit();
    }
    else{
      // fail out
      //gui.App.crashRenderer();
    }
  });
}
