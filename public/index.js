'use strict';

//list of bats
//useful for ALL 5 steps
//could be an array of objects that you fetched from api or database
const bars = [{
  'id': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
  'name': 'freemousse-bar',
  'pricePerHour': 50,
  'pricePerPerson': 20
}, {
  'id': '165d65ec-5e3f-488e-b371-d56ee100aa58',
  'name': 'solera',
  'pricePerHour': 100,
  'pricePerPerson': 40
}, {
  'id': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
  'name': 'la-poudriere',
  'pricePerHour': 250,
  'pricePerPerson': 80
}];

//list of current booking events
//useful for ALL steps
//the time is hour
//The `price` is updated from step 1 and 2
//The `commission` is updated from step 3
//The `options` is useful from step 4
const events = [{
  'id': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
  'booker': 'esilv-bde',
  'barId': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
  'time': 4,
  'persons': 8,
  'options': {
    'deductibleReduction': false
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'privateaser': 0
  }
}, {
  'id': '65203b0a-a864-4dea-81e2-e389515752a8',
  'booker': 'societe-generale',
  'barId': '165d65ec-5e3f-488e-b371-d56ee100aa58',
  'time': 8,
  'persons': 30,
  'options': {
    'deductibleReduction': true
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'privateaser': 0
  }
}, {
  'id': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
  'booker': 'otacos',
  'barId': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
  'time': 5,
  'persons': 80,
  'options': {
    'deductibleReduction': true
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'privateaser': 0
  }
}];

//list of actors for payment
//useful from step 5
const actors = [{
  'eventId': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
  'payment': [{
    'who': 'booker',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'bar',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'privateaser',
    'type': 'credit',
    'amount': 0
  }]
}, {
  'eventId': '65203b0a-a864-4dea-81e2-e389515752a8',
  'payment': [{
    'who': 'booker',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'bar',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'privateaser',
    'type': 'credit',
    'amount': 0
  }]
}, {
  'eventId': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
  'payment': [{
    'who': 'booker',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'bar',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'privateaser',
    'type': 'credit',
    'amount': 0
  }]
}];

function timeComponent(barId, time) {
    let timeComponent = 0;
    bars.forEach(doc => {
        if (doc["id"] === barId) {
            timeComponent = doc["pricePerHour"] * time;
        }
    });
    return timeComponent;
}

function peopleComponent(barId, persons) {
    let peopleComponent = 0;
    bars.forEach(doc => {
        if (doc["id"] === barId) {
            peopleComponent = doc["pricePerPerson"] * persons;
        }
    });
    return peopleComponent;
}

function setBookingPrice() {
    events.forEach(doc => {
        let time = timeComponent(doc["barId"], doc["time"]);
        let people = peopleComponent(doc["barId"], doc["persons"]);
        let price = time + people;

        // Apply reductions
        let persons = doc["persons"];
        if (persons >= 10 && persons < 20) {
            price *= 0.9;
        }
        if (persons >= 20 && persons < 60) {
            price *= 0.7;
        }
        if (persons >= 60) {
            price *= 0.5;
        }

        // Apply deductible option
        if (doc["options"]["deductibleReduction"] === true) {
            price += doc["persons"] * 1;
        }
        doc["price"]= price;
    });
}

function setCommission() {
    events.forEach(doc => {
        let commission;
        if (doc["options"]["deductibleReduction"] === true) {
            commission = (doc["price"] - doc["persons"]) * 0.3;
        }
        else {
            commission = doc["price"] * 0.3;
        }
        let insurance = commission * 0.5;
        let treasury = 1 * doc["persons"];
        let privateaser;
        if (doc["options"]["deductibleReduction"] === true) {
            privateaser = commission - insurance - treasury + doc["persons"];
        }
        else {
            privateaser = commission - insurance - treasury;
        }
        doc["commission"]["insurance"] = insurance;
        doc["commission"]["treasury"] = treasury;
        doc["commission"]["privateaser"] = privateaser;
    });
}

function getEvent(enventId) {
    let event;
    events.forEach(doc => {
        if (doc["id"] === enventId) {
            event = doc;
        }
    });
    return event;
}

function setActors() {
    actors.forEach( doc =>{
        let event = getEvent(doc["eventId"]);
        doc["payment"][0]["amount"] = event["price"];
        if (event["options"]["deductibleReduction"] === true) {
            doc["payment"][1]["amount"] = +(0.7 * (event["price"] - event["persons"])).toFixed(4);
        }
        else {
            doc["payment"][1]["amount"] = +(0.7 * event["price"]).toFixed(4);
        }
        doc["payment"][2]["amount"] = event["commission"]["insurance"];
        doc["payment"][3]["amount"] = event["commission"]["treasury"];
        doc["payment"][4]["amount"] = event["commission"]["privateaser"];
    });
}

setBookingPrice();
setCommission();
setActors();
console.log(bars);
console.log(events);
console.log(actors);
