class Ui {
    getDomElement() {
        return this.root;
    }
}
export class Main extends Ui {
    constructor(data) {
        super();
        this.root = document.createElement("div");
        this.root.classList.add("rootMainUi");

        this.data = data;
        this.id = 0;
    }
    render() {
        this.balance = this.createBalanceContainer();
        this.lastTRContainer = this.createLastTran();

        this.root.append(this.balance, this.lastTRContainer);
    }
    createBalanceContainer() {
        const balance = document.createElement("div");
        balance.classList.add("balanceContainer");

        const balanceGroup = document.createElement("div");
        balanceGroup.classList.add("balanceGroup");
        balance.append(balanceGroup);

        const balanceText = document.createElement("div");
        balanceText.classList.add("balanceText");
        balanceGroup.append(balanceText);

        const balanceTextNum = document.createElement("div");
        balanceTextNum.classList.add("balanceTextNum");
        balanceTextNum.innerText = this.data.balance + "₴";

        const balanceTextName = document.createElement("div");
        balanceTextName.classList.add("balanceTextName");
        balanceTextName.innerText = "Баланс";
        balanceText.append(balanceTextNum, balanceTextName);

        let balanceImg = document.createElement("img");
        balanceImg.src = "icon/balance-bk.png";
        balanceImg.classList.add("balanceImg");
        balanceGroup.append(balanceImg);

        let r = 0;
        let s = 20;
        const animated = () => {
            if (r > 360) r = 0;
            balanceImg.style.transform = `rotate(${r}deg)`;
            r += 1;

            if (s < 200) {
                s += 2;
                balanceImg.style.width = s + "px";
                balanceImg.style.height = s + "px";
                console.log("Не перерисовуем")
            }

            this.tick = requestAnimationFrame(animated);
        }
        animated();

        return balance;
    }
    createLastTran() {
        let filterTran = this.data.transaction.filter(e => e.type !== "salary");
        let sortTran = filterTran.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        console.log(sortTran);

        let lastTRContainer = document.createElement("div");
        lastTRContainer.classList.add("lastTRContainer");

        let name = document.createElement("div");
        name.classList.add("lastTRName");

        let text = document.createElement("span");
        text.classList.add("lastTRText");
        text.textContent = "Последние операции расхода:"
        name.append(text);

        lastTRContainer.append(name);

        let dataTran = document.createElement("div");
        dataTran.classList.add("dataTran");
        lastTRContainer.append(dataTran);


        let i = 0;
        const maxItems = Math.min(3, sortTran.length);
        let animated = () => {
            if (i < maxItems) {
                let item = sortTran[i];
                let transaction = new Transaction(item, this.data.category);
                let a = transaction.getDomElement();

                dataTran.append(a);

                setTimeout(() => {
                    a.classList.add('show');
                }, 30);

                i++;
                setTimeout(() => {
                    animated();
                }, 500);
            } else {
                this.createLastSalaryCont = this.createLastSalary();
                setTimeout(() => {
                    this.root.append(this.createLastSalaryCont);
                }, 50);
            }
        }
        animated();

        if (sortTran.length == 0) {
            let nullContainer = document.createElement("div");
            nullContainer.classList.add("nullContainer");
            nullContainer.textContent = "Операций пока нет";
            lastTRContainer.append(nullContainer);
        }

        return lastTRContainer;
    }
    createLastSalary() {
        let filterTran = this.data.transaction.filter(e => e.type == "salary");
        let sortTran = filterTran.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        console.log(sortTran);

        let lastTRContainer = document.createElement("div");
        lastTRContainer.classList.add("lastTRContainer");

        let name = document.createElement("div");
        name.classList.add("lastTRName");

        let text = document.createElement("span");
        text.classList.add("lastTRText");
        text.textContent = "Последние операции дохода:"
        name.append(text);

        lastTRContainer.append(name);

        let dataTran = document.createElement("div");
        dataTran.classList.add("dataTran");
        lastTRContainer.append(dataTran);


        let i = 0;
        const maxItems = Math.min(3, sortTran.length);
        let animated = () => {
            if (i < maxItems) {
                let item = sortTran[i];
                let transaction = new Transaction(item, this.data.category);
                let a = transaction.getDomElement();

                dataTran.append(a);

                setTimeout(() => {
                    a.classList.add('show');
                }, 30);

                i++;
                setTimeout(() => {
                    animated();
                }, 500);
            }
        }
        animated();

        if (sortTran.length == 0) {
            let nullContainer = document.createElement("div");
            nullContainer.classList.add("nullContainer");
            nullContainer.textContent = "Операций пока нет";
            lastTRContainer.append(nullContainer);
        }

        return lastTRContainer;
    }
    destroy() {
        cancelAnimationFrame(this.tick);
        this.root.style.opacity = 0;
        setTimeout(() => {
            this.root.remove();
        }, 1000);
    }

}
export class History extends Ui {
    constructor(data) {
        super();
        this.root = document.createElement("div");
        this.root.classList.add("rootHistoryUi");

        this.transactions = data.transaction || [];
        this.categories = data.category || [];

        this.step = 10;
        this.currentIndex = 0;

        this.observer = null;
        this.sentinel = null;
    }

    render() {
        this.root.innerHTML = '';
        let sortTran = this.transactions.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        this.transactions = sortTran;

        const title = document.createElement("div");
        title.classList.add("titleHistori");
        const text = document.createElement("span");
        text.classList.add("textHistori");
        text.textContent = "История операций";
        title.append(text);

        this.containerTran = document.createElement("div");
        this.containerTran.classList.add("containerHistori");

        this.root.append(title, this.containerTran);

        this.sentinel = document.createElement("div");
        this.sentinel.classList.add("sentinel");
        this.sentinel.style.height = "20px";
        this.root.append(this.sentinel);

        this.loadMore();
        if (this.transactions.length == 0) {
            let nullContainer = document.createElement("div");
            nullContainer.classList.add("nullContainer");
            nullContainer.textContent = "Операций пока нет";
            this.containerTran.append(nullContainer);
        }

        setTimeout(() => this.initIntersectionObserver(), 0);
    }

    loadMore() {
        const nextBatch = this.transactions.slice(this.currentIndex, this.currentIndex + this.step);

        nextBatch.forEach(item => {
            const transactionInstance = new Transaction(item, this.categories);
            const el = transactionInstance.getDomElement();
            this.containerTran.append(el);

            setTimeout(() => el.classList.add('show'), 10);
        });

        this.currentIndex += nextBatch.length;

        if (this.currentIndex >= this.transactions.length && this.observer) {
            this.observer.disconnect();
        }
    }

    initIntersectionObserver() {
        const options = {
            root: this.root,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.currentIndex < this.transactions.length) {
                    this.loadMore();
                }
            });
        }, options);

        this.observer.observe(this.sentinel);
    }

    destroy() {
        if (this.observer) this.observer.disconnect();
        this.root.style.opacity = 0;
        setTimeout(() => {
            this.root.remove();
        }, 1000);
    }
}
export class Analysis extends Ui {
    constructor(data) {
        super();
        this.data = data;

        this.root = document.createElement("div");
        this.root.classList.add("rootAnalysisUi");

        this.selectedRangeDays = 30;

        this.render();
    }
    render() {
        this.root.innerHTML = '';

        const title = document.createElement('div');
        title.classList.add('titleAnalysis');
        title.textContent = 'Анализ расходов';

        const rangeControl = document.createElement('div');
        rangeControl.classList.add('rangeControl');

        const ranges = [
            { label: 'Неделя', days: 7 },
            { label: '2 недели', days: 14 },
            { label: 'Месяц', days: 30 }
        ];

        ranges.forEach(r => {
            const btn = document.createElement('button');
            btn.classList.add('rangeBtn');
            btn.textContent = r.label;
            if (r.days === this.selectedRangeDays) btn.classList.add('activeRange');
            btn.addEventListener('click', () => {
                if (this.selectedRangeDays === r.days) return;
                this.selectedRangeDays = r.days;
                this.render();
            });
            rangeControl.appendChild(btn);
        });

        const rangeLabel = document.createElement('div');
        rangeLabel.classList.add('rangeLabel');
        rangeLabel.textContent = `Период времени: ${this.formatRangeLabel(this.selectedRangeDays)}`;

        const headerWrap = document.createElement('div');
        headerWrap.classList.add('analysisHeader');
        headerWrap.append(title, rangeControl, rangeLabel);

        const analysisContainer = document.createElement('div');
        analysisContainer.classList.add('analysisContainer');

        const chartWrap = document.createElement('div');
        chartWrap.classList.add('chartWrap');

        const svgSize = 200;
        const r = 80;
        const circumference = 2 * Math.PI * r;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', svgSize);
        svg.setAttribute('height', svgSize);
        svg.classList.add('pieSvg');

        const center = svgSize / 2;

        // background circle
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bg.setAttribute('cx', center);
        bg.setAttribute('cy', center);
        bg.setAttribute('r', r);
        bg.setAttribute('fill', 'none');
        bg.setAttribute('stroke', '#f0f0f0');
        bg.setAttribute('stroke-width', '40');
        svg.appendChild(bg);

        const analysisData = this.getAnalysisData(this.selectedRangeDays);

        if (!analysisData || analysisData.length === 0) {
            const empty = document.createElement('div');
            empty.classList.add('nullContainer');
            empty.textContent = 'Нет данных для анализа';
            this.root.append(title, empty);
            return;
        }

        const colors = [
            '#22dde4', '#5fdf5f', '#ffd166', '#ff6b6b', '#8ecae6', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#caffbf'
        ];

        // create slices as stroked circles stacked on top of each other
        let offsetPct = 0; // percent offset (0-100)
        analysisData.forEach((item, idx) => {
            const pct = item.percent || 0;
            const dash = (pct / 100) * circumference;

            const slice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            slice.setAttribute('cx', center);
            slice.setAttribute('cy', center);
            slice.setAttribute('r', r);
            slice.setAttribute('fill', 'none');
            slice.setAttribute('stroke', colors[idx % colors.length]);
            slice.setAttribute('stroke-width', '40');
            slice.setAttribute('stroke-linecap', 'butt');
            slice.style.transform = `rotate(-90deg)`;
            slice.style.transformOrigin = '50% 50%';
            slice.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
            const offset = (offsetPct / 100) * circumference;
            slice.setAttribute('stroke-dashoffset', `${-offset}`);
            slice.classList.add('pieSlice');
            svg.appendChild(slice);

            offsetPct += pct;
        });

        chartWrap.appendChild(svg);

        // legend / description
        const legend = document.createElement('div');
        legend.classList.add('chartLegend');

        analysisData.forEach((item, idx) => {
            const legendItem = document.createElement('div');
            legendItem.classList.add('legendItem');

            const colorBox = document.createElement('div');
            colorBox.classList.add('legendColor');
            colorBox.style.background = colors[idx % colors.length];

            const label = document.createElement('div');
            label.classList.add('legendLabel');
            const cat = this.data.category.find(c => c.type === item.type);
            label.textContent = (cat && cat.name) ? cat.name : item.type;

            const pctText = document.createElement('div');
            pctText.classList.add('legendPct');
            pctText.textContent = `${item.percent.toFixed(1)}%`;

            const barOuter = document.createElement('div');
            barOuter.classList.add('legendBarOuter');
            const barInner = document.createElement('div');
            barInner.classList.add('legendBarInner');
            barInner.style.width = '0%';
            barInner.style.background = colors[idx % colors.length];
            barOuter.appendChild(barInner);

            const rightGroup = document.createElement('div');
            rightGroup.classList.add('legendRight');
            rightGroup.append(pctText, barOuter);

            legendItem.append(colorBox, label, rightGroup);
            legend.appendChild(legendItem);

            // animate bar width after insert
            setTimeout(() => {
                barInner.style.width = `${item.percent}%`;
            }, 50 + idx * 80);
        });

        analysisContainer.append(chartWrap, legend);
        this.root.append(headerWrap, analysisContainer);
    }
    getAnalysisData() {
        // default to 30 days if called without param
        const days = arguments.length ? arguments[0] : 30;
        const summary = {};
        let totalExpense = 0;
        const now = new Date();
        const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        this.data.transaction.forEach(tr => {
            if (tr.type === 'salary') return;
            const trDate = new Date(tr.date);
            if (isNaN(trDate)) return;
            if (trDate < from) return;
            const sum = Number(tr.sum) || 0;
            summary[tr.type] = (summary[tr.type] || 0) + sum;
            totalExpense += sum;
        });

        if (totalExpense === 0) return [];

        return Object.keys(summary).map(type => ({
            type,
            sum: summary[type],
            percent: (summary[type] / totalExpense) * 100
        }));
    }
    formatRangeLabel(days) {
        if (days === 7) return 'неделя';
        if (days === 14) return '2 недели';
        if (days === 30) return 'месяц';
        return `${days} дней`;
    }
    destroy() {
        this.root.style.opacity = 0;
        setTimeout(() => {
            this.root.remove();
        }, 1000);
    }
}
export class NewTransaction extends Ui {
    constructor(saveCallback) {
        super();
        this.saveCallback = saveCallback;

        this.root = document.createElement("div");
        this.root.classList.add("rootNewTransaction");
    }
    render(category) {
        let nameContainer = document.createElement("div");
        nameContainer.classList.add("titleNT");
        let text = document.createElement("span");
        text.classList.add("textNT");
        text.textContent = "Новая операция";
        nameContainer.append(text);
        this.root.append(nameContainer);

        let categoryContainer = document.createElement("div");
        categoryContainer.classList.add("categoryContainer");

        let categoryText = document.createElement("span");
        categoryText.classList.add("categoryText");
        categoryText.textContent = "Категория:"

        let categoryList = document.createElement("div");
        categoryList.classList.add("categoryList");

        categoryContainer.append(categoryText, categoryList)

        let sumContainer = document.createElement("div");
        sumContainer.classList.add("sumContainer");

        let sumText = document.createElement("span");
        sumText.textContent = "Сумма";
        sumText.classList.add("sumText");

        let sumInput = document.createElement("input");
        sumInput.type = "number";
        sumInput.min = 0;
        sumInput.classList.add("sumInput");

        let sumTextTutorial = document.createElement("div");
        sumTextTutorial.classList.add("sumTextTutorial");
        sumTextTutorial.textContent = "*Сумма будет автоматически округлена до ближайшего целого числа с избытком (до ближайшего большего целого)";

        sumContainer.append(sumText, document.createElement("br"), sumInput, sumTextTutorial);

        let descriptionContainer = document.createElement("div");
        descriptionContainer.classList.add("descriptionContainer");

        let descriptionName = document.createElement("span");
        descriptionName.textContent = "Краткое описание";
        descriptionName.classList.add("descriptionName");

        let descriptionTextarea = document.createElement("textarea");
        descriptionTextarea.classList.add("descriptionTextarea");
        let descriptionText = document.createElement("div");
        descriptionText.textContent = "*Не обязательно";
        descriptionText.classList.add("descriptionText");
        descriptionContainer.append(descriptionName, document.createElement("br"), descriptionTextarea, document.createElement("br"), descriptionText);

        let buttonContainer = document.createElement("div");
        buttonContainer.classList.add("buttonContainer");

        let buttonOk = document.createElement("button");
        buttonOk.classList.add("buttonOk");
        buttonOk.textContent = "Добавить";

        let buttonBack = document.createElement("button");
        buttonBack.classList.add("buttonBack");
        buttonBack.textContent = "Отмена";

        buttonContainer.append(buttonOk, buttonBack);


        buttonOk.addEventListener("click", () => {
            if (!document.querySelector(".choiceItem")) {
                categoryText.style.color = "red";
            } else {
                categoryText.style.color = "black";
            }
            if (sumInput.value == 0) {
                sumText.style.color = "red";
            } else {
                sumText.style.color = "black";
            }

            if (document.querySelector(".choiceItem") && sumInput.value > 0) {
                let transaction = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    type: category.find((e) => e.name == document.querySelector(".choiceItem").textContent).type,
                    sum: sumInput.value,
                    comment: descriptionTextarea.value
                }

                console.log(transaction);
                this.successfullyTransaction();
                this.saveCallback(transaction);
            }
        });

        buttonBack.addEventListener("click", () => {
            this.delete(categoryContainer, sumContainer, descriptionContainer);
        });

        this.root.append(categoryContainer);









        this.root.style.width = window.innerWidth + "px";
        let maxH = window.innerHeight;

        let h = 20;
        const animated = () => {
            if (h < maxH) h += 20;
            this.root.style.height = h + "px";
            if (h == 300) {
                this.root.append(sumContainer);
            } else if (h == 400) {
                this.root.append(descriptionContainer);
            } else if (h == 500) {
                this.root.append(buttonContainer);
            }

            if (h < maxH) {
                requestAnimationFrame(animated);
            } else {
                return;
            }
        }
        animated();

        let i = 0;
        const fillingCategory = () => {
            if (i < category.length) {
                const currentCategory = category[i];

                let a = document.createElement("div");
                a.textContent = currentCategory.name;
                a.classList.add("categoryItem");

                a.onclick = () => {
                    if (document.querySelector(".choiceItem")) {
                        document.querySelector(".choiceItem").classList.remove("choiceItem");
                    }
                    a.classList.add("choiceItem");

                    this.categoryChoice = currentCategory.type;
                }

                categoryList.append(a);
                i++;

                setTimeout(() => {
                    a.style.opacity = 1;
                    fillingCategory();
                }, 200);
            }
        }
        setTimeout(() => {
            fillingCategory();
        }, 100);
    }

    successfullyTransaction() {
        this.root.innerHTML = ""; // Очищаем форму

        const container = document.createElement("div");
        container.classList.add("containerST");

        const title = document.createElement("h2");
        title.classList.add("titleST");
        title.textContent = "Готово";

        // Создаем обертку для круга и анимации
        const circleWrapper = document.createElement("div");
        circleWrapper.classList.add("circleWrapper");

        const circle = document.createElement("div");
        circle.classList.add("circleST");

        const checkmark = document.createElement("span");
        checkmark.classList.add("checkmarkST");
        checkmark.innerHTML = "&#10003;";

        circle.append(checkmark);
        circleWrapper.append(circle);

        const subtitle = document.createElement("span");
        subtitle.classList.add("subtitleST");
        subtitle.textContent = "Операция успешно добавлена";
        subtitle.style.width = window.innerWidth + "px";

        container.append(title, circleWrapper, subtitle);
        this.root.append(container);

        setTimeout(() => {
            this.delete(title, circleWrapper, subtitle);
        }, 2000);
    }

    delete(a, b, c) {
        this.root.style.opacity = 0;

        a.style.marginLeft = window.innerWidth + "px";
        b.style.marginLeft = -window.innerWidth + "px";
        c.style.marginLeft = window.innerWidth + "px";
        setTimeout(() => {
            this.root.remove();
        }, 1000);
    }
}
class Transaction {
    constructor(data, category) {
        this.data = data;
        this.data.category = category;

        this.render();
    }
    render() {
        let a = document.createElement("div");
        a.classList.add("transactionItem");
        this.domElement = a;

        let title = document.createElement("div");
        title.classList.add("trItemTitle");

        let dateTitle = document.createElement("div");
        dateTitle.classList.add("dateTitleTr");
        dateTitle.textContent = this.formatDateCustom(this.data.date);

        let typeTransTitle = document.createElement("div");
        typeTransTitle.classList.add("typeTransTitle");

        typeTransTitle.textContent = this.data.category.find(e => e.type == this.data.type).name;

        let btnTitle = document.createElement("button");
        btnTitle.classList.add("btnTitle");
        let btnImage = document.createElement("div");
        btnImage.classList.add("btnImageTr");
        btnTitle.append(btnImage);
        title.append(dateTitle, typeTransTitle, btnTitle);


        let body = document.createElement("div");
        body.classList.add("trItemBody");

        body.style.maxHeight = "0px";
        body.style.overflow = "hidden";
        body.style.padding = "0 15px";
        body.style.transition = "max-height 0.4s ease, padding 0.3s ease";

        a.append(title, body);


        const fillBodyWith = (item) => {
            body.innerHTML = "";
            const sumEl = document.createElement("div");
            sumEl.classList.add("trSum");
            sumEl.textContent = `Сумма: ${this.data.sum}₴`;

            const commentEl = document.createElement("div");
            commentEl.classList.add("trComment");
            commentEl.textContent = this.data.comment || "Без описания";

            body.append(sumEl, commentEl);
        }

        a.addEventListener("click", (e) => {
            if (e.target !== a && !e.target.closest('.transactionItem')) return;

            const expanded = a.classList.toggle("expanded");
            if (expanded) {
                fillBodyWith(this.data);
                requestAnimationFrame(() => {
                    body.style.padding = "10px 15px";
                    body.style.maxHeight = body.scrollHeight + 20 + "px";
                });
            } else {
                body.style.padding = "0 15px";
                body.style.maxHeight = "0px";
            }
        });
    }
    formatDateCustom(isoString) {
        const date = new Date(isoString);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const year = date.getFullYear();

        return `${hours}:${minutes} || ${day}-${month}-${year}`;
    }
    getDomElement() {
        return this.domElement;
    }
}