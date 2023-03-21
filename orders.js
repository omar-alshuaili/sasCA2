const orders = [];

  fetch('/orders', {
    method: 'POST',
    credentials: 'same-origin'
  }).
  then(res => {
    console.log(res)
    if(!res.ok) {
      return res.text().then(text => {
         throw new Error(text) 
        })
     }
    else {
      
      return res.json();
    }    
  })
  .then(orders => {
    console.log(orders);
  })
  .catch(err => {

  });
