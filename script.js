const searchBar = document.getElementById("searchBar");
const resultList = document.getElementById("resultList");
const showMoreBtn = document.getElementById("show-more-btn");
const showLessBtn = document.getElementById("show-less-btn");

let searchQuery;
let productsData;
let totalItems;
let visibleItemCount = 20; // Number of items to show initially
let items;

const fetchAllProducts = async () => {
  return fetch(
    `https://8ky35k70oc.execute-api.ap-northeast-1.amazonaws.com/products/all`,
    {
      headers: {
        "x-api-key": "YHTdXURDcXamPN8x5vBTT2gljyI6umrR2rjISE5m",
      },
    }
  )
    .then(res => res.json())
    .then(productData => {
      console.log("productData: ", productData);
      return productData.hits.hits;
    });
};

const fetchListProducts = async input => {
  return fetch(
    `https://8ky35k70oc.execute-api.ap-northeast-1.amazonaws.com/products?keyword=${input}`,
    {
      headers: {
        "x-api-key": "YHTdXURDcXamPN8x5vBTT2gljyI6umrR2rjISE5m",
      },
    }
  )
    .then(res => res.json())
    .then(productData => {
      return productData.hits.hits;
    });
};

const filteringData = data => {
  let finalResult = [];
  data.forEach(item => {
    const productsTmp = item._source.products;
    for (const prod of productsTmp) {
      finalResult.push(prod);
    }
  });

  let uniqueProducts = finalResult.reduce((accumulator, current) => {
    if (!accumulator.find(item => item._id === current._id)) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);

  uniqueProducts = uniqueProducts.sort((a, b) => a.price - b.price);

  return uniqueProducts;
};

const renderProducts = data => {
  const arrLength = data.length;
  const column = 5;
  const row = Math.floor(arrLength / 5);

  for (let i = 0; i < row; i++) {
    let htmlRow = `<div class="row" style="display: flex; justify-content: center; align-item: center">`;
    for (let j = i * column; j < (i + 1) * column; j++) {
      if (j < 20) {
        htmlRow += `<div class="item col-md-2 col-sm-6 custom-col">
        <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
        <img src="https://www.naturalbedcompany.co.uk/wp-content/uploads/WALNUT-LEITH-MODERN-BED-WITH-CHARCOAL-LINEN-BEDDING.jpg" alt="Bed image" style="width: 100%; object-fit: contain">
        <div class="card-body" style="padding: 10px">
          <h5 class="card-title" style="font-weight: bold;">${data[j].product_name}</h5>
          <p class="card-text">${data[j].category}</p>
          <p class="card-text">${data[j].price} JP¥</p>
        </div>
      </div>
      </div>`;
      } else {
        htmlRow += `<div class="hidden item col-md-2 col-sm-6 custom-col">
        <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
        <img src="https://www.naturalbedcompany.co.uk/wp-content/uploads/WALNUT-LEITH-MODERN-BED-WITH-CHARCOAL-LINEN-BEDDING.jpg" alt="Bed image" style="width: 100%; object-fit: contain">
        <div class="card-body" style="padding: 10px">
          <h5 class="card-title" style="font-weight: bold;">${data[j].product_name}</h5>
          <p class="card-text">${data[j].category}</p>
          <p class="card-text">${data[j].price} JP¥</p>
        </div>
      </div>
      </div>`;
      }
    }
    htmlRow += `</div>`;
    resultList.innerHTML += htmlRow;
  }

  let htmlRowFinal = `<div class="row" style="display: flex; justify-content: center; align-item: center">`;
  for (let i = row * column; i < arrLength; i++) {
    if (i < 20) {
      htmlRowFinal += `<div class="item col-md-2 col-sm-6 custom-col">
        <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
        <img src="https://www.naturalbedcompany.co.uk/wp-content/uploads/WALNUT-LEITH-MODERN-BED-WITH-CHARCOAL-LINEN-BEDDING.jpg" alt="Bed image" style="width: 100%; object-fit: contain">
        <div class="card-body" style="padding: 10px">
          <h5 class="card-title" style="font-weight: bold;">${data[i].product_name}</h5>
          <p class="card-text">${data[i].category}</p>
          <p class="card-text">${data[i].price} JP¥</p>
        </div>
      </div>
      </div>`;
    } else {
      htmlRowFinal += `<div class="hidden item col-md-2 col-sm-6 custom-col">
      <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
      <img src="https://www.naturalbedcompany.co.uk/wp-content/uploads/WALNUT-LEITH-MODERN-BED-WITH-CHARCOAL-LINEN-BEDDING.jpg" alt="Bed image" style="width: 100%; object-fit: contain">
      <div class="card-body" style="padding: 10px">
        <h5 class="card-title" style="font-weight: bold;">${data[i].product_name}</h5>
        <p class="card-text">${data[i].category}</p>
        <p class="card-text">${data[i].price} JP¥</p>
      </div>
    </div>
    </div>`;
    }
  }
  htmlRowFinal += "</div>";
  resultList.innerHTML += htmlRowFinal;

  items = document.querySelectorAll(".item");
  totalItems = items.length;

  updateVisibility();

  // console.log("totalItems: ", totalItems);
};

function updateVisibility() {
  for (let i = 0; i < totalItems; i++) {
    if (i < visibleItemCount) {
      items[i].classList.remove("hidden");
    } else {
      items[i].classList.add("hidden");
    }
  }

  if (visibleItemCount < totalItems) {
    showMoreBtn.style.display = "inline";
  } else {
    showMoreBtn.style.display = "none";
  }

  if (visibleItemCount > 20) {
    showLessBtn.style.display = "inline";
    showLessBtn.classList.remove("hidden");
  } else {
    showLessBtn.style.display = "none";
  }
}

fetchAllProducts().then(data => {
  const finalResult = filteringData(data);
  renderProducts(finalResult);
});

// updateVisibility();

searchBar.addEventListener("keydown", e => {
  if (e.key == "Enter") {
    if (searchBar.value != "") {
      searchQuery = searchBar.value;
      fetchListProducts(searchQuery).then(data => {
        const finalResult = filteringData(data);
        renderProducts(finalResult);
      });
    } else {
      fetchAllProducts().then(data => {
        const finalResult = filteringData(data);
        renderProducts(finalResult);
      });
    }
  }
});

showMoreBtn.addEventListener("click", function () {
  visibleItemCount += 20;
  updateVisibility();
});

showLessBtn.addEventListener("click", function () {
  visibleItemCount -= 20;
  updateVisibility();
});
