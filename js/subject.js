'use strict';

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
  window.location.href = "./signin.html";
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

    $(".fixed-action-btn").css('display', 'none');

    var math = $("#math").click(function() {
        math.css('background-color', '#bbdefb');
    });
    var english = $("#english").click(function() {
        english.css('background-color', '#bbdefb');
    })
    var psych = $("#psych").click(function() {
        psych.css('background-color', '#bbdefb');
    });
    var bio = $("#bio").click(function() {
        bio.css('background-color', '#bbdefb');
        $(".fixed-action-btn").css('display', 'block');
    });
    var spanish = $("#spanish").click(function() {
        spanish.css('background-color', '#bbdefb');
    });
    var film = $("#film").click(function() {
        film.css('background-color', '#bbdefb');
    })
    var chem = $("#chem").click(function() {
        chem.css('background-color', '#bbdefb');
    });
    var physics = $("#physics").click(function() {
        physics.css('background-color', '#bbdefb');
    });

    // add event listeners
    if (this.signupButton != null) {
        this.signupButton.addEventListener("click", function() {
            window.location.replace('/dash.html');
        });
    }
    if (this.backButton != null) {
        this.backButton.addEventListener("click", function() {
            window.location.replace('/dash.html');
        })
    }
    if(this.signoutButton != null) {
        this.signoutButton.addEventListener("click", function() {
            window.location.replace('/signin.html')
        })
    }

});
