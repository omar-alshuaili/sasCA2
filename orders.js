let orders = [];
let cardsDiv = document.getElementsByClassName("orders")[0];
let params = new URL(document.location).searchParams;
let searchParams = {
  name: params.get("search"),
};
console.log(searchParams);

// searchParams = encodeURIComponent(searchParams);


fetch("/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "same-origin",
  body: JSON.stringify({search: searchParams}),
})
  .then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        text = JSON.parse(text);
        const searchResult = document.createElement("div");
        searchResult.innerHTML = `<p>No results were found for the query:<br><br>${text.mess}</p>`;
        cardsDiv.appendChild(searchResult);
      });
    } else {
      return res.json();
    }
  })
  .then((data) => {
    createCards(data);
    orders = data;
    console.log(orders);
  })
  .catch((err) => {});

function createCards(orders) {
  console.log(1);
  for (let index = 0; index < orders.length; index++) {
    let card = document.createElement("div");
    card.classList.add("order-detail-card");
    let price = document.createElement("span");
    price.textContent = "Price: €" + orders[index].price;

    let name = document.createElement("p");
    name.textContent = "Product Name: " + orders[index].product;

    let quantity = document.createElement("p");
    quantity.textContent = "quantity: " + orders[index].quantity;

    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(quantity);

    cardsDiv.appendChild(card);
  }
}

// searchForm = document.getElementById("search-form");

// searchForm.addEventListener("submit", function (evt) {
//   evt.preventDefault();
//   searchInput = document.getElementById("search");

//   FilteredOrders = orders.filter((name) =>
//     name.product.toLowerCase().includes(searchInput.value.toLowerCase())
//   );
//   console.log(orders);

//   cardsDiv.replaceChildren();

//   createCards(FilteredOrders);
// });

// searchInput.addEventListener("submit", () => {
//   console.log(orders);
//   let filteredOrders = orders.filter((name) =>
//     name.includes(searchInput.value)
//   );
//   console.log(filteredOrders);
//   createCards(filteredOrders);
// });
