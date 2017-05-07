$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBOgy9nqHfvd0ELtdzrOXimNRsjzFT63Ao",
    authDomain: "homework-f307f.firebaseapp.com",
    databaseURL: "https://homework-f307f.firebaseio.com",
    projectId: "homework-f307f",
    storageBucket: "homework-f307f.appspot.com",
    messagingSenderId: "342170253205"
  };
  firebase.initializeApp(config);
  //var dbRef = firebase.database().ref();
  var dbUser = firebase.database().ref().child('user');
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var storageRef = firebase.storage().ref();

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignOut = $('#btnSignOut');
  const $btnSignUp = $('#btnSignUp');
  const $signInfo = $('#sign-info');
  const $btnSubmit = $('#btnSubmit');
  var photoURL = '';


  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  }

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];
    var metadata = {'contentType': file.type};

    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      console.error('Upload failed:', error);
    });
  }//End handleFileSelect

  window.onload = function() {
    $('#file').change(handleFileSelect);
    // $file.disabled = false;
  }

  $btnSignIn.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();
    const promise =  auth.signInWithEmailAndPassword(email, password);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
  });

  $btnSignUp.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp User is " + user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.set({email: user.email, username:'', occupation:'', age:'', photourl:''});
    });
  });

  $btnSignOut.click(function(e){
    firebase.auth().signOut();
    console.log('Logout');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled');
    $btnSignUp.removeAttr('disabled');
    window.location.href = './index.html';
  });

  firebase.auth().onAuthStateChanged(function(user){
    if (user){
      console.log('SignIn ' + user.email);
      $signInfo.html(user.email + " is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled');
      LoadUserProfile();
      UpdateChatRoom();
    }
  });

  $btnSubmit.click(function(e){
    const user = firebase.auth().currentUser;
    if (user) {
      $('#file').change(handleFileSelect);//Load Image
      const dbUserid = dbUser.child(user.uid);
      const promise = dbUserid.update({
        username: $('#userName').val(),
        occupation: $('#occupation').val(),
        age:$('#age').val(),
        photourl: photoURL
      });
      console.log('Upload photo: ' + photoURL);
      promise.then(function(){
        console.log("Update info successful.");
        LoadUserProfile();
      });
    }
  });

  function LoadUserProfile()
  {
    const user = firebase.auth().currentUser;
    if (user) {
      firebase.database().ref('/user/' + user.uid).once('value').then(function(snapshot) {
        $('#profile-name').html(snapshot.val().username);
        $('#profile-email').html(snapshot.val().email);
        $('#profile-occupation').html(snapshot.val().occupation);
        $('#profile-age').html(snapshot.val().age);
        $('#profile-img').attr('src', snapshot.val().photourl);

        //Chat Room Name update
        $('#roomowner').html(snapshot.val().username || 'Anonymous');
      });
    }
  }

  $('#messageInput').keypress(function(e){
    if (e.keyCode == 13 && $('#messageInput').val())
    {
      const user = firebase.auth().currentUser;
      // var name = $('#roomowner').text();
      var uid = user.uid;
      var message = $('#messageInput').val();
      console.log(name + ' : ' + message);
      // dbChatRoom.push({name: name, uid: uid, text: message});
      dbChatRoom.push({uid: uid, text: message});
      $('#messageInput').val('');
    }
  });

  function UpdateChatRoom()
  {
    dbChatRoom.limitToLast(15).on('child_added', function(snapshot){
      var data = snapshot.val();
      var message = data.text;
      var uid = data.uid;
      //var username = data.name || "anonymous";

      var $messageElement = $("<li>");
      if (uid == firebase.auth().currentUser.uid){
        $messageElement.addClass('rightside');
        $messageElement.text(message);
      }
      else{
        var $senderImg = $("<img src='' class='chatroom-avatar'>");
        //var $nameElement = $("<strong class='chat-username'></strong>");
        //$nameElement.text(username);

        //Link Img Src
        firebase.database().ref('/user/' + uid).once('value').then(function(snapshot) {
          $senderImg.attr('src', snapshot.val().photourl);
        });
        //$messageElement.text(message).prepend($nameElement);
        $messageElement.text(message).prepend($senderImg);
      }
      $('#messages').append($messageElement);

      $('#messages')[0].scrollTop = $('#messages')[0].scrollHeight;
    });
  }
});
