

class ChargeLogic {
static async charge(payload){
	var token = {};
	token = payload;

	var stripe = require("stripe")(
	  //"sk_test_BQokikJOvBiI2HlWgH4olfQ2"
	  "sk_test_4q5rCVkqyTUe4dQWnQ7rCzY7"
	);
	console.log("calling stripe api for charge");
	stripe.charges.create({
	  amount: 2000,
	  currency: "usd",
	  source: "tok_189fTK2eZvKYlo2CFiH71I0z", // obtained with Stripe.js
	  description: "Charge for aubrey.thompson@example.com"
	}, function(err, charge) {
	  if (err) {
	  	console.log("error occured");
	  } else {
	  	console.log("charge success");
	  }
	});

}; 
}

export {
    ChargeLogic
};
