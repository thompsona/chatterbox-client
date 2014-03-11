$(function(){

  var stringHtml = "";
  var username = null;
  var rooms = {};
  var selectedRoom;

  $("#sendBT").click(function() {
    var msg = {};
    msg.text = $("#toSend").val();
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
    //console.log();
    username = $("#username").val();
    $("#username").text = username;
  });

  $("#refreshMsgs").click(function() {
    getMsg();
    console.log(stringHtml);
  
  });


  var postMsg = function(message){
    
    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.log(data);
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
    //    console.log(data);
        parseMsg(data);
        getRooms(data);
        console.log('chatterbox: Message received');
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message');
      }
    });
  };

  var parseMsg = function(data, room){
    stringHtml = "";
    selectedRoom = $("#roomSelect").val();
    console.log("selectedRoom: " + selectedRoom);
    room = selectedRoom;
    for (var i = 0; i < data.results.length; i++) {
      if(!isScript(data.results[i].text) && !isScript(data.results[i].username) && !isScript(data.results[i].roomname)){
        if(data.results[i].roomname === room) {
          var timestamp = $.prettyDate.format(data.results[i].createdAt);
          stringHtml = stringHtml.concat("<p>"+data.results[i].username+": "+data.results[i].text+" @" +timestamp+ " room: " + data.results[i].roomname + "</p>");
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
