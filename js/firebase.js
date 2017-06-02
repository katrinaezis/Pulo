$(function() {
    var subject = firebase.database().ref('subject');
    subject.on('value', function(snapshot) {
        var data = snapshot.val();
        console.log(data);
        Object.keys(data).forEach(function(key) {
            var value = data[key];

            console.log(value)
        })
    })
})