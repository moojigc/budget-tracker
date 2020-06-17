// @ts-check
import registerSW from "./register-service-worker";
import { useIndexedDb } from "./indexedDb";
import { populateChart, populateTable, populateTotal } from "./chart-helpers";
let transactions = [];
let myChart;

registerSW();
useIndexedDb("budget-tracker-pending", "pending", "post");

fetch("/api/transaction")
	.then((response) => {
		return response.json();
	})
	.then((data) => {
		// save db data on global variable
		transactions = data;

		populateTotal(transactions);
		populateTable(transactions);
		populateChart(transactions, myChart);

		// save server data to indexeddb
		useIndexedDb("budget-tracker", "transactions", "putArr", transactions);
	})
	.catch((err) => {
		// get from indexeddb
		useIndexedDb("budget-tracker", "transactions").then((data) => {
			transactions = data;

			populateTotal(transactions);
			populateTable(transactions);
			populateChart(transactions, myChart);
		});
	});

function sendTransaction(isAdding) {
	let nameEl = document.querySelector("#t-name");
	let amountEl = document.querySelector("#t-amount");
	let errorEl = document.querySelector(".form .error");

	// validate form
	if (nameEl.value === "" || amountEl.value === "") {
		errorEl.textContent = "Missing Information";
		return;
	} else {
		errorEl.textContent = "";
	}

	// create record
	let transaction = {
		name: nameEl.value,
		value: amountEl.value,
		date: new Date().toISOString()
	};

	// if subtracting funds, convert amount to negative number
	if (!isAdding) {
		transaction.value *= -1;
	}

	// add to beginning of current array of data
	transactions.unshift(transaction);

	// re-run logic to populate ui with new record
	populateChart(transactions, myChart);
	populateTable(transactions);
	populateTotal(transactions);

	// also send to server
	fetch("/api/transaction", {
		method: "POST",
		body: JSON.stringify(transaction),
		headers: {
			Accept: "application/json, text/plain, */*",
			"Content-Type": "application/json"
		}
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.errors) {
				errorEl.textContent = "Missing Information";
			} else {
				// clear form
				nameEl.value = "";
				amountEl.value = "";
			}
		})
		.catch(() => {
			console.log("No connection.");
			// fetch failed, so save in indexed db
			useIndexedDb("budget-tracker-pending", "pending", "add", transaction);
			nameEl.value = "";
			amountEl.value = "";
		});
}

document.querySelector("#add-btn").onclick = function () {
	sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
	sendTransaction(false);
};
