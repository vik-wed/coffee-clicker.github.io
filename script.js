/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  const coffeeCounter = document.querySelector("#coffee_counter");
  coffeeCounter.innerText = Math.floor(coffeeQty * 100) / 100;
}

function clickCoffee(data) {
  data.coffee += 1;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  for (let producer of producers) {
    if (producer.price / 2 <= coffeeCount) {
      producer.unlocked = true;
    }
  }
}

function getUnlockedProducers(data) {
  const unlockedProducers = [];
  for (let producer of data.producers) {
    if (producer.unlocked) {
      unlockedProducers.push(producer);
    }
  }
  return unlockedProducers;
}

function makeDisplayNameFromId(id) {
  let displayName = "";
  for (let i = 0; i < id.length; i++) {
    if (i === 0 || id[i - 1] === "_") {
      displayName += id[i].toUpperCase();
    } else if (id[i] === "_") {
      displayName += " ";
    } else {
      displayName += id[i];
    }
  }
  return displayName;
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement("div");
  containerDiv.className = "producer";
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
    <button type="button" id="sell_${producer.id}">Sell</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild);
  }
}

function renderProducers(data) {
  const producerContainer = document.getElementById("producer_container");
  deleteAllChildNodes(producerContainer);
  unlockProducers(data.producers, data.coffee);
  const unlockedProducers = getUnlockedProducers(data);
  for (let unlockedProducer of unlockedProducers) {
    const producerDiv = makeProducerDiv(unlockedProducer);
    producerContainer.append(producerDiv);
  }
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  for (let producer of data.producers) {
    if (producerId.includes(producer.id)) {
      return producer;
    }
  }
}

function canAffordProducer(data, producerId) {
  let canAfford = false;
  let producer = getProducerById(data, producerId);
  if (data.coffee >= producer.price) {
    canAfford = true;
  }
  return canAfford;
}

function updateCPSView(cps) {
  const cpsIndicator = document.getElementById("cps");
  cpsIndicator.innerText = cps;
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.1);
  //changed it from 1.25 to 1.1 to allow for quicker purchases
}

function attemptToBuyProducer(data, producerId) {
  let producer = getProducerById(data, producerId);
  if (canAffordProducer(data, producerId)) {
    producer.qty += 1;
    data.coffee -= producer.price;
    producer.price = updatePrice(producer.price);
    data.totalCPS += producer.cps;
    return true;
  } else {
    return false;
  }
}

function buyButtonClick(event, data) {
  if (event.target.tagName === "BUTTON" && event.target.id[0] === "b") {
    const producerId = event.target.id;
    if (!canAffordProducer(data, producerId)) {
      window.alert("Not enough coffee!");
    } else {
      attemptToBuyProducer(data, producerId);
      renderProducers(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
    }
  }
}

function tick(data) {
  data.coffee += data.totalCPS;
  updateCoffeeView(data.coffee);
  renderProducers(data);
  renderUpgrades(data, upgrades);
  //saving state in the tick function = this will result in the state being saved every second because tick is being called on an interval
  saveState(data);
}

/*************************
 *  EXTRAS
 *************************/

function saveState(data) {
  //window.localStorage.clear();
  return window.localStorage.setItem("data", JSON.stringify(data));
}

//if sell button is clicked we're selling the producer for the current price, increasing the coffee amount by that price and removing the coffee per second from the cps

function sellButtonClick(event, data) {
  if (event.target.tagName === "BUTTON" && event.target.id[0] === "s") {
    const producerId = event.target.id;
    let producer = getProducerById(data, producerId);
    if (producer.qty > 0) {
      producer.qty -= 1;
      data.coffee += producer.price;
      data.totalCPS -= producer.cps;
      renderProducers(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
    }
  }
}

const upgrades = [
  {
    id: "large_mug",
    price: 250,
    unlocked: false,
    cps: 1.01,
    qty: 0,
  },
  {
    id: "sugar",
    price: 500,
    unlocked: false,
    cps: 1.02,
    qty: 0,
  },
  {
    id: "creamer",
    price: 750,
    unlocked: false,
    cps: 1.03,
    qty: 0,
  },
  {
    id: "latte_art",
    price: 2500,
    unlocked: false,
    cps: 1.05,
    qty: 0,
  },
  {
    id: "a_cute_barista_winks_at_you",
    price: 100000,
    unlocked: false,
    cps: 1.5,
    qty: 0,
  },
];

function makeUpgradeDiv(upgrade) {
  const containerDiv = document.createElement("div");
  containerDiv.className = "upgrade";
  const displayName = makeDisplayNameFromId(upgrade.id);
  const html = `
  <div class="upgrade-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${upgrade.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div>Increases CPS by ${(upgrade.cps * 100)-100}%</div>
    <div>Cost: ${upgrade.price} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function renderUpgrades(data, upgrades) {
  const upgradeContainer = document.getElementById("upgrade-container");
  deleteAllChildNodes(upgradeContainer);
  const unlockedUpgrades = [];
  for (const upgrade of upgrades) {
    if ((upgrade.price / 2 <= data.coffee) && upgrade.qty < 1) {
      upgrade.unlocked = true;
      unlockedUpgrades.push(upgrade);
    }
  }
  for (let unlockedUpgrade of unlockedUpgrades) {
    const upgradeDiv = makeUpgradeDiv(unlockedUpgrade);
    upgradeContainer.append(upgradeDiv);
  }
}

function buyUpgradeButtonClick(event, data) {
  if (event.target.tagName === "BUTTON") {
    const upgradeId = event.target.id;
    let upgradeNow = {};
    for (let upgrade of upgrades) {
      if (upgradeId.includes(upgrade.id)) {
        upgradeNow = upgrade;
      }
    }
    if (data.coffee >= upgradeNow.price) {
      upgradeNow.qty += 1;
      data.coffee -= upgradeNow.price;
      data.totalCPS *= upgradeNow.cps;
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
      renderUpgrades(data, upgrades);
      upgradeNow.unlocked = true;
    } else {
      window.alert("Not enough coffee!");
    }
  }
}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === "undefined") {
  // Get starting data from the window object
  // (This comes from data.js)
  let data = JSON.parse(window.localStorage.getItem("data"));
  if (!data) {
      data = window.data;
  }

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById("big_coffee");
  bigCoffee.addEventListener("click", () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById("producer_container");
  producerContainer.addEventListener("click", (event) => {
    buyButtonClick(event, data);
    sellButtonClick(event, data);
  });

  const upgradeContainer = document.getElementById("upgrade-container");
  upgradeContainer.addEventListener("click", (event) => {
    buyUpgradeButtonClick(event, data);
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick,
  };
}
