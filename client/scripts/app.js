$(function(){

  var stringHtml = "";
  var username = null;
  var rooms = {};
  var selectedRoom;
  var msg = {};
  var friends = {};

  $("#sendBT").click(function() {
    msg.text = $("#toSend").val() || "";
    if(username === null) {
      alert('please enter username');
    }
    else {
      msg.username = username;
      msg.roomname = selectedRoom;
      postMsg(msg);
    }
  });

  $("#usernameBT").click(function() {
    username = $("#username").val();
    $("#username").text = username;
  });

  $("#roomnameBT").click(function() {
    var newRoom = $("#roomname").val();
    username = $("#username").val();
    if(username === "" || newRoom === null) {
      alert('please enter username and roomname');
    }else {
      if(rooms[newRoom] === undefined) {
        rooms[newRoom] = true;
        $("#roomSelect").append("<option selected>" +newRoom+ "</option>")
      }
      msg.text = $("#toSend").val() || "";
      msg.username = username;
      msg.roomname = newRoom;
      msg.friend = "yea";
      postMsg(msg);
    }
  });

  $("#refreshMsgs").click(function() {
    getMsg();
  });

  var handleUserClicks = function(e) {
    var friend = $(e.target).data("name");
    if(friends[username] === undefined) {
      friends[username] = [];
    }
    friends[username].push(friend);
  };

  $(document).on("click",".chatUsername", handleUserClicks);

  var postMsg = function(message){
    
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
  }

  var getMsg = function(){
    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      contentType: 'application/json',
      data: {order: '-createdAt'},
      success: function (data) {
       console.log(data);
        parseMsg(data);
        getRooms(data);
        //console.log('chatterbox: Message received');
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message');
      }
    });
  };

  var parseMsg = function(data){
    stringHtml = "";
    selectedRoom = $("#roomSelect").val();
    for (var i = 0; i < data.results.length; i++) {
      var textFormat = "";
      if(!isScript(data.results[i].text) && !isScript(data.results[i].username) && !isScript(data.results[i].roomname)){
        if(data.results[i].roomname === selectedRoom) {
          var timestamp = $.prettyDate.format(data.results[i].createdAt);
          if(friends[username] !== undefined && friends[username].indexOf(data.results[i].username) !== -1) {
            textFormat = "<b>" + data.results[i].username + "</b>";
          }
          else {
            textFormat = data.results[i].username;
          }
          stringHtml = stringHtml.concat("<p><a class='chatUsername' href='#' data-name='"+data.results[i].username+"'>"+textFormat+"</a>: "+data.results[i].text+" @" +timestamp+ " room: " + data.results[i].roomname + "</p>");
        }
      }
    };
    $("#chatArea").html(stringHtml);
  };

  var getRooms = function(data) {
    for (var i = 0; i < data.results.length; i++) {
      if(!isScript(data.results[i].roomname) && rooms[data.results[i].roomname] === undefined) {
        rooms[data.results[i].roomname] = true;
        $("#roomSelect").append("<option>" + data.results[i].roomname + "</option>");
      }
    }
  };

var isScript = function(text) {
  if(typeof text === 'string' && !(/<[a-z][\s\S]*>/i.test(text))) {
    return false;
  }
  return true;
}

setInterval(getMsg, 2000);

});
