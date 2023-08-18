const resultList = document.getElementById("resultList");
const showMoreBtn = document.getElementById("show-more-btn");
const showLessBtn = document.getElementById("show-less-btn");
const searchProduct = document.getElementById("search-product");
const searchCategory = document.getElementById("search-category");
const searchPriceStart = document.getElementById("search-price-start");
const searchPriceEnd = document.getElementById("search-price-end");
const submitQueryBtn = document.getElementById("submit-query");
const sortLowestToHighest = document.getElementById("lowest-to-highest");
const sortHighestToLowest = document.getElementById("highest-to-lowest");
const sortMinPrice = document.getElementById("sort-min-price");
const sortRecommendation = document.getElementById("sort-recommendation");

let items;
let totalItems;
let visibleItemCount = 20; // Number of items to show initially
let currentProductsData;

const fetchAllProducts = async () => {
  return fetch(
    `https://8ky35k70oc.execute-api.ap-northeast-1.amazonaws.com/products/all`
  )
    .then(res => res.json())
    .then(productData => {
      console.log(productData);
      return productData.hits.hits;
    });
};

const filteringData = data => {
  const searchProductQuery = searchProduct.value;
  const searchCategoryQuery = searchCategory.value;
  const searchStartPriceQuery = searchPriceStart.value;
  const searchEndPriceQuery = searchPriceEnd.value;

  let finalResult = [];
  data.forEach(item => {
    finalResult.push(item._source);
  });

  let uniqueProducts = finalResult.reduce((accumulator, current) => {
    if (!accumulator.find(item => item.id === current.id)) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);

  uniqueProducts = uniqueProducts.sort((a, b) => a.min_price - b.min_price);

  if (searchProductQuery) {
    const tmpProdQuery = searchProductQuery.trim().split(" ");

    uniqueProducts = uniqueProducts.filter(item =>
      tmpProdQuery.every(word =>
        item.title.toLowerCase().includes(word.toLowerCase())
      )
    );
  }

  if (searchCategoryQuery) {
    const tmpCategoryQuery = searchCategoryQuery.trim().split(" ");

    uniqueProducts = uniqueProducts.filter(item =>
      tmpCategoryQuery.every(word =>
        item.category.toString().toLowerCase().includes(word.toLowerCase())
      )
    );
  }

  if (searchStartPriceQuery) {
    uniqueProducts = uniqueProducts.filter(
      item => item.min_price >= searchStartPriceQuery
    );
  }

  if (searchEndPriceQuery) {
    uniqueProducts = uniqueProducts.filter(
      item => item.min_price <= searchEndPriceQuery
    );
  }

  return uniqueProducts;
};

const renderProducts = data => {
  resultList.innerHTML = "";
  const arrLength = data.length;
  const column = 5;
  const row = Math.floor(arrLength / 5);

  for (let i = 0; i < row; i++) {
    let htmlRow = `<div class="row" style="display: flex; justify-content: center; align-item: center">`;
    for (let j = i * column; j < (i + 1) * column; j++) {
      if (j < 20) {
        htmlRow += `<div class="item col-md-2 col-sm-6 custom-col">
        <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
        <img src="${data[j].image_url}" alt="Bed image" style="width: 100%; object-fit: contain">
        <div class="card-body" style="padding: 10px">
          <h5 class="card-title" style="font-weight: bold;">${data[j].title}</h5>
          <p class="card-text">${data[j]?.category}</p>
          <p class="card-text">${data[j].min_price} ~ ${data[j].max_price} JP¥</p>
        </div>
      </div>
      </div>`;
      } else {
        htmlRow += `<div class="hidden item col-md-2 col-sm-6 custom-col">
        <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
        <img src="${data[j].image_url}" alt="Bed image" style="width: 100%; object-fit: contain">
        <div class="card-body" style="padding: 10px">
          <h5 class="card-title" style="font-weight: bold;">${data[j].title}</h5>
          <p class="card-text">${data[j]?.category}</p>
          <p class="card-text">${data[j].min_price} ~ ${data[j].max_price} JP¥</p>
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
        <img src="${data[i].image_url}" alt="Bed image" style="width: 100%; object-fit: contain">
        <div class="card-body" style="padding: 10px">
          <h5 class="card-title" style="font-weight: bold;">${data[i].title}</h5>
          <p class="card-text">${data[i]?.category}</p>
          <p class="card-text">${data[i].min_price} ~ ${data[i].max_price} JP¥</p>
        </div>
      </div>
      </div>`;
    } else {
      htmlRowFinal += `<div class="hidden item col-md-2 col-sm-6 custom-col">
      <div class="card" style="margin: 10px; border: 1px solid black; width: 18rem; height: 250px;">
      <img src="${data[i].image_url}" alt="Bed image" style="width: 100%; object-fit: contain">
      <div class="card-body" style="padding: 10px">
        <h5 class="card-title" style="font-weight: bold;">${data[i].title}</h5>
        <p class="card-text">${data[i]?.category}</p>
        <p class="card-text">${data[i].min_price} ~ ${data[i].max_price} JP¥</p>
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
  currentProductsData = finalResult;
  renderProducts(finalResult);
});

submitQueryBtn.addEventListener("click", function () {
  fetchAllProducts().then(data => {
    const finalResult = filteringData(data);
    currentProductsData = finalResult;
    renderProducts(finalResult);
  });
});

showMoreBtn.addEventListener("click", function () {
  visibleItemCount += 20;
  updateVisibility();
});

showLessBtn.addEventListener("click", function () {
  visibleItemCount -= 20;
  updateVisibility();
});

sortLowestToHighest.addEventListener("click", function () {
  const finalResult = currentProductsData.sort(
    (a, b) => a.min_price - b.min_price
  );
  renderProducts(finalResult);
});

sortHighestToLowest.addEventListener("click", function () {
  const finalResult = currentProductsData.sort(
    (a, b) => b.min_price - a.min_price
  );
  renderProducts(finalResult);
});

sortMinPrice.addEventListener("click", function () {
  const finalResult = currentProductsData.sort(
    (a, b) => a.min_price - b.min_price
  );
  renderProducts(finalResult);
});

sortRecommendation.addEventListener("click", function () {
  console.log("oeke");
  const finalResult = currentProductsData.sort((a, b) =>
    a.recommendation_id.localeCompare(b.recommendation_id)
  );
  renderProducts(finalResult);
});

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropdownClick() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};
