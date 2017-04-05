var payments;

function paymentsFile(value){

  $('.payment-selector').css({'margin-top':'5vh'});

  $('.payment-header h1').text(""+clientUsername+"'s payments");

  if(!payments){
    $('#noPayments').text('Nothing here yet...');
    $('#paymentsMessage').text('Click here to add payments');
  }

  function requestPaymentsPage(value){
    $.ajax({
      type: 'POST',
      url: '/getPaymentsPage',
      data: {value},
      success: function(data){
        window.location.href = '/'+value.toLowerCase()+'/payments';
      }
    });
  }

  $('#paymentsMessage').on('click', () => {
    requestPaymentsPage(clientUsername);
  });

}
