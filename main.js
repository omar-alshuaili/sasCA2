// Client-side JavaScript code
const passwordInput = document.getElementById('password');
const errorSpan = document.getElementById('error-message');
errorSpan.classList.add('error-message');
const orders = [];
passwordInput.addEventListener('input', () => {
  errorSpan.textContent = ''; // Clear any previous error messages
});

const form = document.getElementById('login-form');

form.addEventListener('submit',  (event) => {
  errorSpan.textContent = ""
  event.preventDefault();
  const formData = new FormData(event.target);

  const email = formData.get('email');
  const password = formData.get('password');

  

  fetch('/login', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({ email: email, password: password })
  }).
  then(res => {
    console.log(res)
    if(!res.ok) {
      return res.text().then(text => {
         throw new Error(text) 
        })
     }
    else {
      
      // orders = res
     window.location.href = '/orders'
     console.log(res.json())
    }    
  })
  .catch(err => {
    errorSpan.textContent = err
  });
  


  

});


  
if( window.location.href == '/orders'){

  fetch('/orders', {
    method: "GET"
  }).
  then(res => {
    console.log(res)
    if(!res.ok) {
      return res.text().then(text => {
         throw new Error(text) 
        })
     }
    else {
      
      // orders = res
    //  window.location.href = '/home'
     console.log(res.json())
    }    
  })
  .catch(err => {
    errorSpan.textContent = err
  });
  
  
}