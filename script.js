import "./style.css";

const observerTarget = document.querySelector(".table");
const searchInput = document.querySelector(".search-input");
const countOfFoundItems = document.querySelector(".search-counter");
const api =
  "https://raw.githubusercontent.com/altkraft/for-applicants/master/frontend/titanic/passengers.json";
const observerOptions = {
  root: document.querySelector(".table"),
  rootMargin: "0px",
  threshold: 0.5,
};
const needToLoadCount = 10;
let LoadedItemsCounter = 0;
let filtred = false;

const addItem = (item) => {
  observerTarget.innerHTML += `<div class="table-item">
    <span class="table-item__name text">${item.name}</span>
    <span class="table-item__age text">${Math.round(item.age)}</span>
    <span class="table-item__male text">${item.gender[0].toUpperCase()} </span>
    <span class="table-item__survived text">
      ${
        item.survived
          ? "<div class=survived></div>SURVIVED"
          : "<div class=nosurvived></div>NOT SURVIVED"
      }
    </span>
    <span class="table-item__ticket text">${item.ticket}</span>
    <span class="table-item__cabin text">${item.cabin ? item.cabin : "-"}</span>
  </div>`;
};

const loadItems = (data, observer) => {
  let nodes = document.querySelectorAll(".table-item");
  let maxIter = LoadedItemsCounter;
  if (filtred === true) {
    data = filter(data);
    maxIter = data.length;
  }
  countOfFoundItems.innerHTML = `items: ${data.length}`;
  for (let iter = nodes.length; iter <= maxIter; iter++) {
    if (iter === LoadedItemsCounter) {
      addItem(data[iter]);
      nodes = document.querySelectorAll(".table-item");
      nodes[nodes.length - 1].classList.add("trigger");
      observer.disconnect();
      observer.observe(document.querySelector(".trigger"));
      return;
    } else if (iter < data.length) {
      addItem(data[iter]);
    }
  }
};

const fixItem = (item) => {
  return {
    name: item.name.toLowerCase(),
    age: Math.round(item.age),
    gender: item.gender,
    ticket: item.ticket.toLowerCase(),
    cabin: item.cabin.toLowerCase(),
    survived: item.survived ? "survived" : "not survived",
  };
};

const surviveCheck = (item) => {
  if (searchInput.value.toLowerCase() === "survived") {
    return item.survived;
  } else return true;
};

const filter = (data) => {
  return data.filter((item) => {
    return (
      Object.values(fixItem(item))
        .join(" ")
        .includes(searchInput.value.toLowerCase()) && surviveCheck(item)
    );
  });
};

const fetchData = async () => {
  const response = await fetch(api);
  const json = await response.json();
  return json;
};
(async function loadPage() {
  const data = await fetchData();

  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].intersectionRatio > 0.5) {
      entries[0].target.classList.remove("trigger");
      LoadedItemsCounter += needToLoadCount;
      loadItems(data, observer);
    }
  }, observerOptions);

  searchInput.addEventListener("input", () => {
    searchInput.value.length === 0 ? (filtred = false) : (filtred = true);
    document.querySelector(".table").innerHTML = "";
    loadItems(data, observer);
  });

  LoadedItemsCounter += needToLoadCount;
  loadItems(data, observer);
})().catch((error) => alert(error));
