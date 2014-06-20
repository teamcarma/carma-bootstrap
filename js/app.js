var accessToken = null;
var user = {};

/** 
 * LOGIN RELATED FUNCTIONS
 **/
//endpoint for authentication 
var AUTH_URL = "https://api-dev.car.ma/security/oauth/token";
//login
function login() {
	var username = $("#email").val();
	var password = $("#password").val();

	//get the oauth token for this user. 
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
			if (console && console.log) {
				console.log("Sample of data:" + JSON.stringify(data));
			}
			token = data.access_token;
			//now get the user details
			getAccountDetails();
		})
		.error(function(error){
			alert("There was an error logging in " + JSON.stringify(error));
		});
}

/** 
 * This function retrieves the user details after a token has been obtained 
 **/
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
			updateUserInterface();
		}
		)
		.error(function(error){
			alert("There was an error retrieving the user details");
		});
}	


/** 
 * This function updates the user interface so that the user appears as logged in 
 **/
function updateUserInterface(){

	$("#loginForm").hide();
	$("#username").text(user.alias);
	$("#userDetails").show();
}


/** 
 * FUNCTIONS TO CREATE ACCOUNTS 
 **/

var CREATE_ACCOUNT_URL = "https://api-dev.car.ma/v1/object/users/create?client_id=example-client&client_secret=example";

function createAccount(){
	var firstName, lastName, email, password, gender; 
	
	firstName = $("#firstName").val();
	lastName = $("#lastName").val();
	email = $("#signup_email").val();
	password = $("#signup_password").val();
	gender = $("#gender").val();

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

