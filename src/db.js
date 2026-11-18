export class FinanceDB {
    #dbName = 'FinFlowDB';
    #version = 1;
    #db = null;

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, this.#version);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('transactions')) {
                    db.createObjectStore('transactions', { keyPath: 'id' });
                }
            };

            request.onsuccess = (e) => {
                this.#db = e.target.result;
                resolve();
            };

            request.onerror = (e) => reject(e.target.error);
        });
    }

    async add(data) {
        return this.#performTransaction('readwrite', (store) => {
            data.id = data.id || Date.now();
            return store.add(data);
        });
    }

    async getAll() {
        return this.#performTransaction('readonly', (store) => store.getAll());
    }

    async delete(id) {
        return this.#performTransaction('readwrite', (store) => store.delete(id));
    }

    // Приватный метод для повторяющейся логики транзакций
    #performTransaction(mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(['transactions'], mode);
            const store = transaction.objectStore('transactions');
            const request = callback(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}