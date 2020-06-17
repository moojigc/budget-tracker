/**
 * GET or POST to indexedDB; send to server when online
 * @param {string} dbName
 * @param {string} storeName
 * @param {"get" | "add" | "post" | "putArr"} [method]
 * @param {object[] | {}} [data]
 */
export function useIndexedDb(dbName, storeName, method, data) {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(dbName, 1);
		let db, tx, store;

		req.onupgradeneeded = () => {
			const db = req.result;
			db.createObjectStore(storeName, {
				keyPath: method === "add" ? "indexId" : "_id",
				autoIncrement: method === "add" ? true : false
			});
		};

		req.onerror = (e) => reject(e);

		req.onsuccess = () => {
			db = req.result;
			tx = db.transaction(storeName, "readwrite");
			store = tx.objectStore(storeName);

			db.onerror = (error) => console.trace(error);

			switch (method) {
				case "putArr":
					{
						for (let i of data) {
							store.put(i);
						}
					}
					break;
				case "add":
					{
						store.add(data);
					}
					break;
				case "post":
					{
						const all = store.getAll();
						all.onsuccess = () => {
							if (all.result.length > 0) {
								fetch("/api/transaction/bulk", {
									method: "POST",
									body: JSON.stringify(all.result),
									headers: {
										Accept: "application/json, text/plain, */*",
										"Content-Type": "application/json"
									}
								})
									.then((response) => response.json())
									.then(() => {
										// if successful, open a transaction on your pending db
										const transaction = db.transaction(storeName, "readwrite");

										// access your pending data store
										const store = transaction.objectStore(storeName);

										// clear all items in your store
										store.clear();
									});
							}
						};
					}
					break;
				default:
				case "get":
					{
						const all = store.getAll();
						all.onsuccess = () => resolve(all.result);
					}
					break;
			}
			tx.oncomplete = () => db.close();
		};
	});
}
/**
 * Saves to indexedDB when offline
 * @param {{}} record
 */
export function saveRecord(record) {
	const transaction = db.transaction(["pending"], "readwrite");
	const store = transaction.objectStore("pending");
	store.add(record);
}

/**
 * Sends any pending db items to the server
 */
export function checkDatabase() {
	const transaction = db.transaction(["pending"], "readwrite");
	const store = transaction.objectStore("pending");
	const getAll = store.getAll();

	getAll.onsuccess = () => {
		if (getAll.result.length > 0) {
			fetch("/api/transaction/bulk", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json"
				}
			})
				.then((response) => response.json())
				.then(() => {
					// if successful, open a transaction on your pending db
					const transaction = db.transaction(["pending"], "readwrite");

					// access your pending data store
					const store = transaction.objectStore("pending");

					// clear all items in your store
					store.clear();
				});
		}
	};
}
