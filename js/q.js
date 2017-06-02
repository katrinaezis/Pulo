'use strict';

var sid = localStorage.getItem('subject');

// Initializes PeerIo.
function PeerIo() {

  
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.questionList = document.getElementById('questions');
  this.questionForm = document.getElementById('question-form');
  this.questionInput = document.getElementById('question');
  this.submitButton = document.getElementById('submit');
  this.questionBody = document.getElementById('textBody');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.questionForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.questionInput.addEventListener('keyup', buttonTogglingHandler);
  this.questionInput.addEventListener('change', buttonTogglingHandler);

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
PeerIo.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
PeerIo.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.

  this.messagesRef = this.database.ref('subject/' + sid + '/questions');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.title, val.body, val.photoUrl, val.time);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// Saves a new message on the Firebase DB.
PeerIo.prototype.saveMessage = function(e) {
    $('#modal1').modal('close');
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.questionInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    var dt = getISODateTime();
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      title: this.questionInput.value,
      body: this.questionBody.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
      time: dt
    //   Format(Now, "yyyy-mm-dd hh\:nn\:ss")
    }).then(function() {
      // Clear message text field and SEND button state.
      PeerIo.resetMaterialTextfield(this.questionInput);
      PeerIo.resetMaterialTextfield(this.questionBody);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Signs-in Friendly Chat.
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

    // We load currently existing chant messages.
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
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

// Returns true if user is signed-in. Otherwise false and displays a message.
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

// Saves the messaging device token to the datastore.
PeerIo.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
          .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
PeerIo.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
PeerIo.resetMaterialTextfield = function(element) {
  element.value = '';
//   element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
PeerIo.MESSAGE_TEMPLATE =
    '<div onclick="qclick(this.id)" class="message-container row">' +
    //   '<div class="spacing"></div>' +
      '<h4 class="message col s12"></h4>' +
      '<p class="dateTime col s12 grey-text text-darken-1"></p>' +
      '<div class="messageBody grey-text text-darken-2 col s12"></div>' +
      '<div class="col s12 right-align">' +
      '<div class="chip">' +
        '<img class="chipimg" src="" alt="Contact Person">' +
        '</div>'+
    //   '<div class="pic"></div><div class="name"></div>' +
      '</div>' +
    '</div>';

// A loading image URL.
PeerIo.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
PeerIo.prototype.displayMessage = function(key, name, title, body, picUrl, time) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = PeerIo.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.questionList.appendChild(div);
  }
  if (picUrl) {
    // div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
    $(".chipimg").attr("src", picUrl);
    // div.querySelector('.chipimg').attr("src") = picUrl;
  }
    div.querySelector('.chip').append(name);
  var messageElement = div.querySelector('.message');
  var messageBodyElement = div.querySelector('.messageBody');
  var dateElement = div.querySelector('.dateTime');
  if (title) { // If the message is text.
    messageElement.textContent = title;
    messageBodyElement.textContent = body;
    dateElement.append(time);
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    messageBodyElement.innerHTML = messageBodyElement.innerHTML.replace(/\n/g, '<br>');
    // dateElement.innerHTML = dateElement.innerHTML.replace(/\n/g, '<br>');
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.questionList.scrollTop = this.questionList.scrollHeight;
  this.questionInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
PeerIo.prototype.toggleButton = function() {
  if (this.questionInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
PeerIo.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

function getISODateTime(d){
    // padding function
    var s = function(p){
        return (''+p).length<2?'0'+p:''+p;
    };
    
    // default parameter
    if (typeof d === 'undefined'){
        var d = new Date();
    };
    
    // return ISO datetime
    return d.getFullYear() + '-' +
        s(d.getMonth()+1) + '-' +
        s(d.getDate()) + ' ' +
        s(d.getHours()) + ':' +
        s(d.getMinutes());
}

function qclick(id) {
    localStorage.setItem('questionID', id);
    window.location.href = "./answers.html";
}

function showQuestion() {
    var form = document.getElementById('question-form');
    if (form.style.display === 'none') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

window.onload = function() {
    
  window.peerio = new PeerIo();
  var x = $('#header');
  var headText = $('#header-text');
  var subject = firebase.database().ref('subject/' + sid);
  subject.on('value', function(snapshot) {
    var data = snapshot.val();
    var imgUrl = data['image'];
    var ht = data['class'];
    x.css('background-image', 'url(' + imgUrl + ')');
    x.css('background-size', 'cover');
    headText.text(ht);
  });

  $('.modal').modal();
};