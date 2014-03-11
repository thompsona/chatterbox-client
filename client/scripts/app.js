  var app = window.app;
  
  app = {

    server: 'https://api.parse.com/1/classes/chatterbox',
    stringHtml: "",
    username: null,
    rooms: {},
    selectedRoom: "",
    msg: {userphoto: ""},
    friends: {},
    msgPhotoString: "<p>{{userphoto}}<a class='chatUsername' href='#' data-name='{{username}}'>{{friendName}}</a>: {{message}} @ {{timestamp}} room: {{roomname}}</p>",
    msgString: "<p><a class='chatUsername' href='#' data-name='{{username}}'>{{friendName}}</a>: {{message}} @ {{timestamp}} room: {{roomname}}</p>",
    rmSelectString: "<option>{{roomname}}</option>",
    friendString: "<b>{{username}}</b>",


    init: function() {

        $("#sendBT").click(app.sendBTfn);
        $("#userphotoBT").click(app.userphotoBTfn);
        $("#usernameBT").click(app.usernameBTfn);
        $("#roomnameBT").click(app.roomnameBTfn);
        $("#refreshMsgs").click(function() {
          app.fetch();
        });
        $(document).on("click",".chatUsername", app.handleUserClicks);
       
        setInterval(app.fetch, 2000);

    },

    send: function(message) {
      $.ajax({
        // always use this url
        url: 'https://api.parse.com/1/classes/chatterbox',
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function (data) {
          // console.log('chatterbox: Message sent');
        },
        error: function (data) {
          // console.log(data);
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message');
        }
      });
    },

    parseMsg: function(data) {
      app.stringHtml = "";
      app.selectedRoom = $("#roomSelect").val();
      for (var i = 0; i < data.results.length; i++) {
        var friendName = "";
        if(!app.isScript(data.results[i].text) && !app.isScript(data.results[i].username) && !app.isScript(data.results[i].roomname)){
          if(data.results[i].roomname === app.selectedRoom) {
            var timestamp = $.prettyDate.format(data.results[i].createdAt);
            if(app.friends[app.username] !== undefined && app.friends[app.username].indexOf(data.results[i].username) !== -1) {
              friendName = makeTemplate(app.friendString, {username: data.results[i].username});
            }
            else {
              friendName = data.results[i].username;
            }
            if(friendName === app.username) {
              app.stringHtml = app.stringHtml.concat(makeTemplate(app.msgPhotoString, {userphoto: app.msg.userphoto, username: data.results[i].username, friendName: friendName, timestamp: timestamp, roomname: data.results[i].roomname, message: data.results[i].text}));
            }
            else {
              app.stringHtml = app.stringHtml.concat(makeTemplate(app.msgString, {username: data.results[i].username, friendName: friendName, timestamp: timestamp, roomname: data.results[i].roomname, message: data.results[i].text}));
            }
          }
        }
      };
      $("#chatArea").html(app.stringHtml);
      },

      fetch: function() {
        $.ajax({
          // always use this url
          url: 'https://api.parse.com/1/classes/chatterbox',
          type: 'GET',
          contentType: 'application/json',
          data: {order: '-createdAt'},
          success: function (data) {
          // console.log(data);
            app.parseMsg(data);
            getRooms(data);
            //console.log('chatterbox: Message received');
          },
          error: function (data) {
            // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
            console.error('chatterbox: Failed to get message');
          }
       });
      },

      getRooms: function(data) {
        for (var i = 0; i < data.results.length; i++) {
          if(!app.isScript(data.results[i].roomname) && app.rooms[data.results[i].roomname] === undefined) {
            app.rooms[data.results[i].roomname] = true;
            $("#roomSelect").append(makeTemplate(app.rmSelectString, {roomname: data.results[i].roomname}));
          }
        }
      },

      handleUserClicks: function(e) {
        var friend = $(e.target).data("name");
        if(app.friends[app.username] === undefined) {
          app.friends[app.username] = [];
        }
        app.friends[app.username].push(friend);
      },

      isScript: function(text) {
        if(typeof text === 'string' && !(/<[a-z][\s\S]*>/i.test(text))) {
          return false;
        }
        return true;
      },

      sendBTfn: function() {
        app.msg.text = $("#toSend").val() || "";
        if(app.username === null) {
          alert('please enter username');
        }
        else {
          app.msg.username = app.username;
          app.msg.roomname = app.selectedRoom;
          app.postMsg(app.msg);
        }
      },
/*
      userphotoBTfn: function() {
        app.msg.userphoto = $("#userphoto").val() || "";
        if(app.msg.userphoto === "" || app.msg.userphoto === undefined) {
          alert('please enter a url for your photo');
        }else{
          app.msg.userphoto = makeTemplate("<img src='{{userphoto}}' style='height:30px; width:40px;'/>", {userphoto: $("#userphoto").val()});
        }
      },

      usernameBTfn: function() {
        app.username = $("#username").val();
        $("#username").text = app.username;
      },

      roomnameBTfn: function() {
        var newRoom = $("#roomname").val();
        app.username = $("#username").val();
        if(app.username === "" || newRoom === null) {
          alert('please enter username and roomname');
        }else {
          if(app.rooms[newRoom] === undefined) {
            app.rooms[newRoom] = true;
            $("#roomSelect").append("<option selected>" +newRoom+ "</option>")
          }
          app.msg.text = $("#toSend").val() || "";
          app.msg.username = app.username;
          app.msg.roomname = newRoom;
          app.postMsg(app.msg);
        }
      },
*/
  };

  $(function(){
    app.init();
  })

