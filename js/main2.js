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

$(document).ready(function () {
    // // checkSetup();
    //  localStorage.setItem('user', user);
    // input = localStorage.getItem('schoolName');
    // if (input != null) {
    //     localStorage.removeItem('schoolName');
    // }

    // shortcuts for DOM elements
    var userPic = document.getElementById('user-pic');
    var userName = document.getElementById('user-name');
    var signupButton = document.getElementById("sign-in-button");
    var backButton = document.getElementById('back-button');
    var signoutButton = document.getElementById("sign-out");
    var math = $("#math").click(function() {
        localStorage.setItem('subject', math.attr("value"));
        window.location.href = "./questions.html";
    });
    var english = $("#english").click(function() {
        localStorage.setItem('subject', english.attr("value"));
        window.location.href = "./questions.html";
    })
    var psych = $("#psych").click(function() {
        localStorage.setItem('subject', psych.attr("value"));
        window.location.href = "./questions.html";
    });
    var bio = $("#bio").click(function() {
        localStorage.setItem('subject', bio.attr("value"));
        window.location.href = "./questions.html";
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
