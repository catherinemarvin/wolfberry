$(document).ready(function () {
  $("#openRoomBtn").click(function () {
    $.post("createRoom", function (data) {
      console.log(data);
      window.location.href = "/room/"+data.roomId;
    });
  });
});
