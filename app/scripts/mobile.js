$(function(){

  function postDateToFooter(value){
    $('#getDate').text('© Brandon Kervin '+value);
  }

  $(document).ready(function(){
    $.ajax({
      type: 'GET',
      url: '/getDate',
      success: function(data){
        postDateToFooter(data);
      }
    });
  });

  var ids = document.querySelectorAll('[id]');
  var initialIDs = [];
  for(var i = 0;i<ids.length;i++){
    initialIDs[i] = ids[i].id;
  }
  setInterval(function(){
    for(var i = 0;i<ids.length;i++){
      if(initialIDs[i] !== ids[i].id){
        location.reload();
      }
    }
  },500);

  $('#logout').on('click', function(){
    $.ajax({
      url: '/logoutAttempt',
      type: 'POST',
      success: function(data){
        location.reload();
      }
    });
  });

});
