//Success variables. These check to make sure criteria is met before submit
var usernameValid = false;
var passwordValid = false;
var confirmValid = false;
var emailValid = true;
var usernameCheck = /^[a-zA-Z0-9-_]*$/i;
var usernameFirstLetter = /^[a-zA-Z]+$/i;
var usernameMax = 16;

//Client details. fetched through ajax and if variables aren't set, page returns guest.
var clientUsername;
var clientPassword;
var clientEmail;
var isLogged = false;
var loginIsSet = true;

$(function(){

  /*****************
    USER IF EXISTS
  *****************/

  $.ajax({
    type: 'POST',
    url: '/getClientUsername',
    data: {clientUsername},
    success: function(data){
      clientUsername = data;
      if(clientUsername !== ''){
        $('#helloText').text('Hello '+clientUsername+'!');
        $('.create-section').toggle();
        $('.login-section').toggle();
        isLogged = true;
        setContent();
      }else{
        $('#helloText').text('Kervingames');
        setContent();
      }
    }
  });


  $.ajax({
    type: 'POST',
    url: '/getClientPassword',
    data: {clientPassword},
    success: function(data){
      if(data !== ''){
        clientPassword = data;
        isLogged = true;
      }
    }
  });



  $.ajax({
    type: 'POST',
    url: '/getClientEmail',
    data: {clientEmail},
    success: function(data){
      if(data !== ''){
        clientEmail = data;
        isLogged = true;
      }
    }
  });


  /*****************
     SITE CONTENT
  *****************/
  var pieces = ['#cUser','#cPass','#cConfirm','#cEmail'];

  $('#sendAccount h2').toggle();

  function setBorders(counter){
    $(pieces[counter]).css({
      'border-top' : '2px solid red',
      'border-bottom' : '2px solid red'
    });
    $('#sendAccount h2:nth-of-type('+(counter+1)+')').css({
      'display' : 'inherit'
    });
  }

  function unsetBorders(counter){
    $(pieces[counter]).css({
      'border-top' : '2px solid #339',
      'border-bottom' : '2px solid #339'
    });
    $('#sendAccount h2:nth-of-type('+(counter+1)+')').css({
      'display' : 'none'
    });
  }

  setInterval(function(){
    if(clientUsername === ''){
      if(!usernameValid && $('#cUser').val().length > 0){
        $(this).bind(setBorders(0));
      }else{
        $(this).bind(unsetBorders(0));
      }
      if(!passwordValid && $('#cPass').val().length > 0){
        $(this).bind(setBorders(1));
      }else{
        $(this).bind(unsetBorders(1));
      }
      if(!confirmValid && $('#cConfirm').val().length > 0){
        $(this).bind(setBorders(2));
      }else{
        $(this).bind(unsetBorders(2));
      }
      if(!emailValid && $('#cEmail').val().length > 0){
        $(this).bind(setBorders(3));
      }else{
        $(this).bind(unsetBorders(3));
      }
    }
  },25);

  //Toggle Create Account Initially

  $('.create-section').toggle();

  $('.launch-create-pane').on('click', function(){
    if(loginIsSet){
      $('.login-section').fadeOut();
      $('.create-section').fadeIn();
      loginIsSet = false;
    }else{
      $('.login-section').fadeIn();
      $('.create-section').fadeOut();
      loginIsSet = true;
    }
  });

  $('#getAccount input, #sendAccount input').on('click', function(e){
    try{
      var textBox = $(e.target).closest('input');
      $(textBox).bind($(textBox).css({'text-align':'left','color':'#339'}));
    }catch(error){
      //Nothing
    }
  });

  $('#getAccount input, #sendAccount input').on('blur', function(e){
    try{
      var textBox = $(e.target).closest('input');
      $(textBox).bind($(textBox).css({'text-align':'center','color':'black'}));
    }catch(error){
      //Nothing
    }
  });

  function setContent(){
    if(isLogged){
      $('.navbar').css({height:'35vh'});
      paymentsFile();
    }
    if(!isLogged){
      $('.navbar li:nth-of-type(4)').toggle();
    }
  }

  /*****************
      USERNAME
  *****************/

  function setExists(){
    $('#cUserPrompt').text('Username is taken.');
    usernameValid = false;
  }

  function setDNE(){
    if(!usernameCheck.test($('#cUser').val()) && $('#cUser').val().length !== 0){
      $('#cUserPrompt').text('Special characters not allowed.');
      usernameValid = false;
    }else if(!usernameFirstLetter.test($('#cUser').val().charAt(0)) && $('#cUser').val().length !== 0){
      $('#cUserPrompt').text('First character must be a letter.');
      usernameValid = false;
    }else if($('#cUser').val().length < 6 && $('#cUser').val().length !== 0){
      $('#cUserPrompt').text('Not long enough.');
      usernameValid = false;
    }else if($('#cUser').val().length == 0){
      $('#cUserPrompt').text('');
      usernameValid = false;
    }else{
      $('#cUserPrompt').text('');
      usernameValid = true;
    }
  }

  function getUsernameAvailable(username){
    $.ajax({
      type: 'PUT',
      url: '/getUsernameAvailable',
      data: {username},
      success: function(data){
        if(data == 'exists'){
          setExists();
        }else{
          setDNE();
        }
      }
    });
  }

  $('#cUser').on('input', function(){
    var username = $('#cUser').val();
    getUsernameAvailable(username);
  });

  $('#cUser').on('input', function(){
    if($(this).val().length == usernameMax){
      $('#cUser').html().slice(0,usernameMax);
    }
  });

  /*****************
      PASSWORD
  *****************/

  $('#cPass').on('input', function(){
    if($(this).val().length < 6 && $(this).val().length !== 0){
      passwordValid = false;
      $('#cPassPrompt').text('Password not long enough.');
    }else if($(this).val().length == 0){
      passwordValid = false;
      $('#cPassPrompt').text('');
    }else{
      passwordValid = true;
      $('#cPassPrompt').text('');
    }
  });

  /*****************
   PASSWORD CONFIRM
  *****************/

  $('#cConfirm').on('input', function(){
    if($(this).val() !== $('#cPass').val() && $(this).val() !== 0){
      $('#cConfirmPrompt').text('Passwords do not match!');
      confirmValid = false;
    }else{
      $('#cConfirmPrompt').text('');
      confirmValid = true;
    }
  });

  /*****************
        E-MAIL
  *****************/

  function setEmailTaken(){
    emailValid = false;
    $('#cEmailPrompt').text('E-Mail is in use.');
  }

  function setEmailAvailable(){
    emailValid = true;
    $('#cEmailPrompt').text('');
  }

  function getEmailAvailable(email){
    $.ajax({
      type: 'PUT',
      url: '/getEmailAvailable',
      data: {email},
      success: function(data){
        if(data === 'exists'){
          setEmailTaken();
        }else{
          setEmailAvailable();
        }
      }
    });
  }

  $('#cEmail').on('input', function(){
    var email = $('#cEmail').val();
    getEmailAvailable(email);
  });

  /*****************
   SUBMIT VALIDATOR
  *****************/

  function defaultPreventer(e){
    alert('Error when creating an account.');
    e.preventDefault();
  }

  function createAccount(username, password, email){
    $.ajax({
      type: 'POST',
      url: '/createAccount',
      data: {username, password, email},
      success: function(data){
        if(data === 'true'){
          location.reload();
          alert('New user created!');
        }else{
          alert('Failed to create a new account.');
        }
      }
    });
  }

  $('#sendAccount').on('submit', function(e){
    if(usernameValid && passwordValid && confirmValid && emailValid){
      var username = $('#cUser').val();
      var password = $('#cPass').val();
      var email = $('#cEmail').val();
      createAccount(username, password, email);
    }else{
      $('#sendAccount').bind(defaultPreventer(e));
    }
  });

  /*****************
        LOGIN
  *****************/

  function noDefaultUntilExists(e){
    e.preventDefault();
  }

  function login(userEmail, password, e){
    $.ajax({
      type: 'POST',
      url: '/loginAttempt',
      data: {userEmail, password},
      success: function(data){
        if(data === 'exists'){
          alert('Logged in!');
          location.reload();
        }else{
          alert('Username/Password incorrect.');
        }
      }
    });
  }

  $('#getAccount').on('submit', function(e){
    var userEmail = $('#lUser').val();
    var password = $('#lPass').val();
    login(userEmail, password, e);
    $('#getAccount').bind(noDefaultUntilExists(e));
  });

  /*****************
       LOGOUT
  *****************/

  function logoutConfirm(){
    $.ajax({
      type: 'POST',
      url: '/logoutAttempt',
      data: {clientUsername, clientPassword, clientEmail},
      success: function(data){
        location.reload();
      }
    });
  }

  $('.logout').on('click', function(){
    var logoutAttempt = confirm('Are you sure you want to log out?');
    if(logoutAttempt){
      logoutConfirm();
    }
  });

  /*****************
        PAGES
  *****************/

  function requestAccountPage(value){
    $.ajax({
      type: 'POST',
      url: '/getAccountPage',
      data: {value},
      success: function(data){
        window.location.href = '/'+value+'/account';
      }
    });
  }

  function requestPaymentsPage(value){
    $.ajax({
      type: 'POST',
      url: '/getPaymentsPage',
      data: {value},
      success: function(data){
        window.location.href = '/'+value+'/payments';
      }
    });
  }

  $('#accountPage').on('click', function(){
    if(clientUsername !== ''){
      requestAccountPage(clientUsername);
    }else{
      alert('Must be logged in!');
    }
  });

  $('#paymentsPage').on('click', function(){
    if(clientUsername !== ''){
      requestPaymentsPage(clientUsername);
    }else{
      alert('Must be logged in!');
    }
  });


});
