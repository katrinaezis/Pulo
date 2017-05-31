// var config = {
//     apiKey: "AIzaSyBS-_ltv2Ba09OWG5xlr-8jZvEXfexnnJk",
//     authDomain: "pulo-934f2.firebaseapp.com",
//     databaseURL: "https://pulo-934f2.firebaseio.com",
//     projectId: "pulo-934f2",
//     storageBucket: "pulo-934f2.appspot.com",
//     messagingSenderId: "97969479543"
// };
// firebase.initializeApp(config);
'use strict';

var sid = localStorage.getItem('subject');
var qid = localStorage.getItem('questionID');

// Initializes PeerIo.
function PeerIo() {

  
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.questionList = document.getElementById('questions');
  this.questionForm = document.getElementById('question-form');
  this.questionInput = document.getElementById('question');
  this.submitButton = document.getElementById('submit');
  this.questionBody = document.getElementById('textBody');
//   this.submitImageButton = document.getElementById('submitImage');
//   this.imageForm = document.getElementById('image-form');
//   this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // this.postInput = document.getElementById('post');
  // this.forum = document.getElementById('forum');

  // Saves message on form submit.
  this.questionForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.questionInput.addEventListener('keyup', buttonTogglingHandler);
  this.questionInput.addEventListener('change', buttonTogglingHandler);
  // this.postInput.addEventListener('keyup', buttonTogglingHandler);
  // this.postInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
//   this.submitImageButton.addEventListener('click', function(e) {
//     e.preventDefault();
//     this.mediaCapture.click();
//   }.bind(this));
//   this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

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

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
// PeerIo.prototype.setImageUrl = function(imageUri, imgElement) {
//   // If the image is a Cloud Storage URI we fetch the URL.
//   if (imageUri.startsWith('gs://')) {
//     imgElement.src = PeerIo.LOADING_IMAGE_URL; // Display a loading image first.
//     this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
//       imgElement.src = metadata.downloadURLs[0];
//     });
//   } else {
//     imgElement.src = imageUri;
//   }
// };

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
// PeerIo.prototype.saveImageMessage = function(event) {
//   event.preventDefault();
//   var file = event.target.files[0];

//   // Clear the selection in the file picker input.
//   this.imageForm.reset();

//   // Check if the file is an image.
//   if (!file.type.match('image.*')) {
//     var data = {
//       message: 'You can only share images',
//       timeout: 2000
//     };
//     this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
//     return;
//   }

//   // Check if the user is signed-in
//   if (this.checkSignedInWithMessage()) {

//     // We add a message with a loading icon that will get updated with the shared image.
//     var currentUser = this.auth.currentUser;
//     this.messagesRef.push({
//       name: currentUser.displayName,
//       imageUrl: PeerIo.LOADING_IMAGE_URL,
//       photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
//     }).then(function(data) {

//       // Upload the image to Cloud Storage.
//       var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
//       return this.storage.ref(filePath).put(file).then(function(snapshot) {

//         // Get the file's Storage URI and update the chat message placeholder.
//         var fullPath = snapshot.metadata.fullPath;
//         return data.update({imageUrl: this.storage.ref(fullPath).toString()});
//       }.bind(this));
//     }.bind(this)).catch(function(error) {
//       console.error('There was an error uploading a file to Cloud Storage:', error);
//     });
//   }
// };

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

////////// ################################################### Forum Stuff ####################################### /////////////

// // Loads chat messages history and listens for upcoming ones.
// PeerIo.prototype.loadPosts = function() {
//   // Reference to the /posts/ database path.
//   this.postsRef = this.database.ref('posts');
//   // Make sure we remove all previous listeners.
//   this.postsRef.off();


// };

// // Template for posts. (same as messages for now)
// PeerIo.POST_TEMPLATE =
//     '<div class="message-container">' +
//       '<div class="spacing"><div class="pic"></div></div>' +
//       '<div class="message"></div>' +
//        '<div class="close"><i class="material-icons">close</i></div>' +
//       '<div class="name"></div>' +
//     '</div>';

// PeerIo.prototype.displayPost = function(key, name, text, picUrl, imageUri) {
//   var div = document.getElementById(key);
//   // If an element for that message does not exists yet we create it.
//   if (!div) {
//     var container = document.createElement('div');
//     container.innerHTML = PeerIo.POST_TEMPLATE;
//     div = container.firstChild;
//     div.setAttribute('id', key);
//     this.forum.appendChild(div);
//   }
//   if (picUrl) {
//     div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
//   }
//   div.querySelector('.name').textContent = name;
//   var messageElement = div.querySelector('.message'); // the message in the post
//   if (text) { // If the message is text.
//     messageElement.textContent = text;
//     // Replace all line breaks by <br>.
//     messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
//   } else if (imageUri) { // If the message is an image. 
//     var image = document.createElement('img');
//     image.addEventListener('load', function() {
//       this.forum.scrollTop = this.forum.scrollHeight;
//     }.bind(this));
//     this.setImageUrl(imageUri, image);
//     messageElement.innerHTML = '';
//     messageElement.appendChild(image);
//   }
//   // Show the card fading-in and scroll to view the new message.
//   setTimeout(function() {div.classList.add('visible')}, 1);
//   this.forum.scrollTop = this.forum.scrollHeight;
//   this.postInput.focus();
// };

// // Saves a new post on the Firebase DB.
// PeerIo.prototype.savePost = function(e) {
//   e.preventDefault();
//   // Check that the user entered a post and is signed in.
//   if (this.postInput.value && this.checkSignedInWithMessage()) {
//     var currentUser = this.auth.currentUser;
//     // Add a new message entry to the Firebase Database.
//     var date = $.now();
//     console.log(date);
//     alert("kk")
//     this.postsRef.push({
//       name: currentUser.displayName,
//       title: this.postInput.value,
//       text: this.postInput.value,
//       answered: false,
//       time: date
//       // subject: some way to pull the subject
//     }).then(function() {
//       // Clear message text field and SEND button state.
//       PeerIo.resetMaterialTextfield(this.postInput);
//       this.toggleButton();
//     }.bind(this)).catch(function(error) {
//       console.error('Error writing new post to Firebase Database', error);
//     });
//   }
// };



window.onload = function() {
  window.peerio = new PeerIo();
  var question = firebase.database().ref('subject/' + sid + '/questions/' + qid);
  console.log(sid);
  question.on('value', function(snapshot) {
    var data = snapshot.val();
    console.log(data);
    // var imgUrl = data['image'];
    // var ht = data['class'];
    // x.css('background-image', 'url(' + imgUrl + ')');
    // x.css('background-size', 'cover');
    // headText.text(ht);
  });
};