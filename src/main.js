import { FinanceDB } from './db.js';
import { Main, NewTransaction, History, Analysis } from './ui.js';


class FinFlowApp {
    #category = [
        {
            name: "💰 Зарплата",
            type: "salary"
        },
        {
            name: " Еда🍔",
            type: "food"
        },
        {
            name: "🚗 Транспорт",
            type: "transport"
        },
        {
            name: "🏠 Жилье",
            type: "home"
        },
        {
            name: "👕 Одежда",
            type: "clothes"
        },
        {
            name: "💊 Здоровье",
            type: "health"
        },
        {
            name: "🎬 Досуг",
            type: "entertainment"
        },
        {
            name: "🌐 Связь",
            type: "communication"
        },
        {
            name: "🛠️ Другое",
            type: "other"
        },

        {
            name: "📈 Инвестиции",
            type: "investment"
        }
    ]
    constructor() {
        this.db = new FinanceDB();
        this.transaction = [];
        this.ui = {
            main: document.querySelector("#main"),
            button: {
                mainMenu: document.querySelector("#nav-home"),
                historyMenu: document.querySelector("#nav-history"),
                statsMenu: document.querySelector("#nav-stats"),
                newTran: document.querySelector("#new-transactionBtn"),
            }
        }

        this.balance = 0;
        this.currentTab = 0;
    }
    async startApp() {
        this.loadAnimate();

        await this.db.init();
        console.log("База данных готова!");


        this.transaction = await this.getAll();
        this.dataAnalysis(this.transaction);

        this.changeInterface(0);
        this.initEventListeners();
    }

    loadAnimate() {
        let h = window.innerHeight;
        let w = window.innerWidth;

        let containerLoad = document.querySelector("#loadin");
        containerLoad.style.width = w + "px";
        containerLoad.style.height = h + "px";

        let r = document.querySelector(".root");

        let nameLoad = document.querySelector(".nameApp");
        nameLoad.style.fontSize = 50 + "px";

        setTimeout(() => {
            containerLoad.style.opacity = 0;
            r.style.display = "block";
            setTimeout(() => {
                containerLoad.remove();
            }, 500)
        }, 1500);
    }

    initEventListeners() {
        this.ui.button.mainMenu.addEventListener("click", () => {
            this.changeInterface(0);
            if (document.querySelector(".activeItem")) {
                document.querySelector(".activeItem").classList.remove("activeItem");
                this.ui.button.mainMenu.classList.add("activeItem");
            }

        })
        this.ui.button.historyMenu.addEventListener("click", () => {
            this.changeInterface(1);
            if (document.querySelector(".activeItem")) {
                document.querySelector(".activeItem").classList.remove("activeItem");
                this.ui.button.historyMenu.classList.add("activeItem");
            }
        })
        this.ui.button.statsMenu.addEventListener("click", () => {
            this.changeInterface(2);
            if (document.querySelector(".activeItem")) {
                document.querySelector(".activeItem").classList.remove("activeItem");
                this.ui.button.statsMenu.classList.add("activeItem");
            }
        })
        this.ui.button.newTran.addEventListener("click", () => {
            this.changeInterface(3);
        })
    }

    dataAnalysis(data) {
        let salaryItems = data.filter(e => e.type == "salary");
        let sum = 0;
        for (const num of salaryItems) {
            sum += +num.sum;
        }

        let transactionItems = data.filter(e => e.type !== "salary");
        for (const num of transactionItems) {
            sum -= +num.sum;
        }

        this.balance = sum;
    }

    async addTransaction(data) {
        await this.db.add(data);
    }

    async deleteTransaction(id) {
        await this.db.delete(id);
    }

    async getAll() {
        const allTransaction = await this.db.getAll();
        return allTransaction;
    }

    changeInterface(id) {
        if (id !== 3) {
            this.currentTab = id;
        }

        if (id == 0) {
            if (this.page) {
                this.page.destroy();
            }

            setTimeout(() => {
                this.page = new Main({
                    balance: this.balance,
                    transaction: this.transaction,
                    category: this.#category
                });
                this.page.render();
                this.ui.main.append(this.page.getDomElement());
            }, 1000);
        } else if (id == 3) {
            const modalNT = new NewTransaction(async (data) => {
                await this.addTransaction(data);
                await this.updateInterface();
            });
            modalNT.render(this.#category);
            document.body.append(modalNT.getDomElement());
        } else if (id == 1) {
            this.page.destroy();

            setTimeout(() => {
                this.page.getDomElement().remove();
                this.page = new History({
                    balance: this.balance,
                    transaction: this.transaction,
                    category: this.#category
                });
                this.page.render();
                this.ui.main.append(this.page.getDomElement());
            }, 1000);

        } else if (id == 2) {
            if (this.page) {
                this.page.destroy();
            }

            setTimeout(() => {
                // this.page.getDomElement().remove();
                this.page = new Analysis({
                    balance: this.balance,
                    transaction: this.transaction,
                    category: this.#category
                });
                this.page.render();
                this.ui.main.append(this.page.getDomElement());
            }, 1000);
        }
    }
    async updateInterface() {
        this.transaction = await this.getAll();
        this.dataAnalysis(this.transaction);
        this.changeInterface(this.currentTab);
    }
}

const app = new FinFlowApp();
// Register service worker for offline support (works when served over http(s))
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('ServiceWorker registered:', reg.scope))
            .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
}

app.startApp();