// var config = {
//     apiKey: "AIzaSyBS-_ltv2Ba09OWG5xlr-8jZvEXfexnnJk",
//     authDomain: "pulo-934f2.firebaseapp.com",
//     databaseURL: "https://pulo-934f2.firebaseio.com",
//     projectId: "pulo-934f2",
//     storageBucket: "pulo-934f2.appspot.com",
//     messagingSenderId: "97969479543"
// };
// firebase.initializeApp(config);

var input;

function PeerIo() {

  
  this.checkSetup();

  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  this.initFirebase();
}

PeerIo.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

PeerIo.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);

};

// Signs-out of Friendly Chat.
PeerIo.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
PeerIo.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    $('#messages-card').css('display', 'block');
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
    window.location.href = "./index.html";

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    $('#messages-card').css('display', 'none');
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

PeerIo.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Checks that the Firebase SDK has been correctly setup and configured.
PeerIo.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

$(document).ready(function () {
    window.peerio = new PeerIo();
    input = localStorage.getItem('schoolName');
    if (input != null) {
        localStorage.removeItem('schoolName');
    }
    d3.csv("./data/Oct1_SchoolLevel_20170118.csv", function(data) {
        // var schools = new Map();
        var schools = {};
        // console.log(data[0]["District Name"]);
        // firebase.database().ref();

        // var school = firebase.database().ref('school');
        
        
        // subject.push({
        //     name: 'Algebra I',
        //     students: null,
        //     questions: null
        // })
        // subject.push({
        //     name: 'AP English',
        //     students: null,
        //     questions: null
        // })
        // subject.push({
        //     name: 'AP Psychology',
        //     students: null,
        //     questions: null
        // })
        // subject.push({
        //     name: 'Geometry',
        //     students: null,
        //     questions: null
        // })
        // subject.push({
        //     name: 'Spanish II',
        //     students: null,
        //     questions: null
        // })

        
        $.each(data, function(index, value) {
            // var newRef = school.push({
            //     name: value["School Name"],
            //     subjects: null
            // });
            // console.log(newRef.key)
            // var subject = firebase.database().ref('school/' + newRef.key + '/subject');

            // subject.push({
            //     name: 'Algebra I',
            //     students: null,
            //     questions: null
            // })
            // subject.push({
            //     name: 'AP English',
            //     students: null,
            //     questions: null
            // })
            // subject.push({
            //     name: 'AP Psychology',
            //     students: null,
            //     questions: null
            // })
            // subject.push({
            //     name: 'Geometry',
            //     students: null,
            //     questions: null
            // })
            // subject.push({
            //     name: 'Spanish II',
            //     students: null,
            //     questions: null
            // })
            schools[value["School Name"]] = null;
            // schools.push(value["School Name"], null);
            // schools.set(value["School Name"], null);
            // console.log(value["School Name"])
            
        });
        // $('input.autocomplete').autocomplete({
        //         source: schools,
        //         limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
        //         onAutocomplete: function(val) {
        //         // Callback function when value is autcompleted.
        //         console.log("kk")
        //         },
        //         minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
        //     });
        $('input.autocomplete').autocomplete({
            data: schools,
            limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
            onAutocomplete: function(val) {
            // Callback function when value is autcompleted.
            },
            minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
        });
    });

    $("#homeSubmit").click(function() {
        input = $("#autocomplete-input").val();
        localStorage.setItem('schoolName', input);
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            localStorage.setItem('user', user);
            window.location.href = "./index.html";
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
        console.log(input)
    })
})