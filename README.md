# Carma Bootstrap #
A simple HTML5 and JavaScript application that illustrates how to use the Carma APIs within a web application. 

This is intended to be used as a reference application for developers who wish to use the Carma API, particularly those who are interested in entering the [Carma Prize](http://carmacarpool.com/prize)

This reference app will continue to be extended to illustrate more of the APIs. 

At present the application covers the login and signup flows. 

### Client Keys ###
Note that the [fast access](https://api.car.ma/apidoc/authentication.action#authdev) authentication to the Carma development server. If you are using the Carma API it is recommended to request [access to the API](https://api.car.ma/apidoc/signup.action). 

### Running this example application ###
To run this application, simply host the folder on any web server, and open index.html from your web browser.

## Login ##

Login to the Carma app is achieved through a two steps. First the token is retrieved by calling https://api-dev.car.ma/security/oauth/token 

```javascript

$.ajax({
		url: AUTH_URL,
		type: "POST",
		data: {
			username: username,
			password: password,
			grant_type: "password",
			//NOTE: you will need to provide your own client id and secret.
			client_id: "example-client",
			client_secret: "example"
		}
	})
		.done(function(data) {
			//get the token
			token = data.access_token;
		})
		.error(function(error){
			alert("There was an error logging in " + JSON.stringify(error));
		});
```

Following this step, the full account details can be retrieved by making a call to the [user endpoint] (https://api-dev.car.ma/apidoc/endpoints/rest.v2.object.users.id.action) https://api-dev.car.ma/api/rtr/v2.0/object/users/self


```javascript
var ACCOUNT_DETAILS = "https://api-dev.car.ma/api/rtr/v2.0/object/users/self";
function getAccountDetails() {
	
	$.ajax({
		url: ACCOUNT_DETAILS,
		type: "GET",
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + token);
		}
	})
		.done(function(data) {
			user.id = data.userId; 
			user.firstName = data.firstName; 
			user.alias = data.alias;	
		}
		)
		.error(function(error){
			alert("There was an error retrieving the user details");
		});
}	
```

## Signup ##

Sign up is achieved by making a call to the [user creation endpoint](https://api-dev.car.ma/apidoc/endpoints/rest.v1.object.users.create.action). 


```javascript
var CREATE_ACCOUNT_URL = "https://api-dev.car.ma/v1/object/users/create?client_id=example-client&client_secret=example";

function createAccount(){
	var firstName, lastName, email, password, gender; 
	//get details from HTML page

	var userObject = {"firstName": firstName, "lastName" : lastName, "email": email, "password": password, "gender": gender};


	//send account creation details 
$.ajax({
		url: CREATE_ACCOUNT_URL,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(userObject)
	})
		.done(function(data) {
			if (console && console.log) {
				console.log("Data returned from signup" + JSON.stringify(data));
			}
			//now get the user details
 			user.userId = data.userId;
 			//close the modal dialog.
 			$('#signupForm').modal('hide')
 			//log the user into the system 
 			$("#email").val(email); 
 			$("#password").val(password);
 			login();

		})
		.error(function(error){
		     var errorDesc = $.parseJSON(error.responseText).description;
		     alert(errorDesc);
		});
}
```

For further questions about use of the API, send an email to carma-apis@car.ma


## Carma Widgets ##

Widgets are using jQuery and underscore. In order to avoid conflicts with user's own plugins we have used browserify to encapuslate these js libraries.

You can find information about this package here: http://browserify.org

