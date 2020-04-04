/* Load me if AJAX is involved */
//. AJAX BUILDER
  function makeAjaxCall(url, methodType, string){
    let promiseObj = new Promise(function(resolve, reject){
       const xhr = new XMLHttpRequest();
       xhr.open(methodType, url, true);
       if (string) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(string); 
       }
       else {
        xhr.send();
       }
       xhr.onreadystatechange = function(){
       if (xhr.readyState === 4){
          if (xhr.status === 200){ // xhr done successfully
             let resp = xhr.responseText;
             resolve(resp);
          } else { // xhr failed
             reject(xhr.status);
          }
       } else {
          // xhr processing going on
       }
    }
    // request sent succesfully
   });
   return promiseObj;
  }
  //. AJAX JSON ENCODER
  function encodeData(data) {
    let urlEncodedDataPairs = [];
    let name;
    // Turn the data object into an array of URL-encoded key/value pairs.
    for( name in data ) {
    urlEncodedDataPairs.push( encodeURIComponent( name ) + '=' + encodeURIComponent( data[name] ) );
    }
    // Combine the pairs into a single string and replace all %-encoded spaces to the '+' character; matches the behaviour of browser form submissions.
    let urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' );
    return urlEncodedData
  }
  //. BUILD FORM DATA
  function formData(form) {
   const elements = form.elements;
   let data = new Object();
   for (let i = 0; i < elements.length; i++) {
     let element = elements[i];
     data[element.name] = element.value;
   }
   return data
  }