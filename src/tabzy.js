function Tabzy(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error(`Tabzy: No container found for selector '${selector}'`);
    }

    this.tabs = Array.from(this.container.querySelectorAll("li a"));
    console.log(this.tabs);
    
    if (!this.tabs.length) {
        console.log('Tabzy: No tabs found inside the container');
        return;
    }

    this.panels = this.tabs.map((tab) => {
        const panel = document.querySelector(tab.getAttribute("href"));
        if (!panel) {
            console.error(
                `Tabzy: No panel found for selector '${tab.getAttribute("href")}'`
            );
        }
        return panel;
    }).filter(Boolean)

    if (this.tabs.length !== this.panels.length) return;

    this.otp = Object.assign({
        remember: false,
        onChange:null,
    }, options);

    this.primaryKey = selector.replace(/[^a-zA-Z0-9]/g,"");

    this._originalHTML = this.container.innerHTML;
    this._init();
}

Tabzy.prototype._init = function () {
    const params = new URLSearchParams(location.search);
    const tabSelector = params.get(this.primaryKey);
    
    const hash = location.hash;
    const tab = (this.otp.remember && hash && this.tabs.find(tab => tab.getAttribute('href').replace(/[^a-zA-Z0-9]/g,"") === tabSelector)) || this.tabs[0];
    
    this.currentTab = tab;
    this._activateTab(tab, false);
    this.tabs.forEach((tab) => {
        tab.onclick = (event) => this._handleTabClick(event, tab);
    })
}

Tabzy.prototype._handleTabClick = function (event, tab) {
    event.preventDefault();
    this._tryActivateTab(tab);
}

Tabzy.prototype._tryActivateTab = function(tab){
    if (this.currentTab !== tab) {
        this._activateTab(tab);
        this.currentTab = tab;
    }
}

Tabzy.prototype._activeTab = function (tab, triggerOnchange = true) {
    this.tabs.forEach((tab) => {
        tab.closest('li').classList.remove('tabzy--active')
    })
    tab.closest("li").classList.add("tabzy--active");

    this.panels.forEach((panel) => (panel.hidden = true));

    const panelActive = document.querySelector(tab.getAttribute("href"));
    panelActive.hidden = false;

    if (this.otp.remember) {
        const params = new URLSearchParams(location.search);
        const paramsValue = tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g,"");
        params.set(this.primaryKey, paramsValue);
        history.replaceState(
            null,
            null,
            `?${params}`
        );
    }

    if (triggerOnchange &&  typeof this.opt.onChange === 'function') {
        this.otp.onChange({
            tab,
            panel:panelActive
        });
    }
}

Tabzy.prototype.switch = function (input) {
    let tabToActivate = null;
    if (typeof input === "string") {
        tabToActivate = this.tabs.find((tab) => tab.getAttribute('href') === input);
    }

    if (!tabToActivate) {
        console.error(`Tabzy: No panel found with ID '${input}'`);
        return;
    } else if (this.tabs.includes(input)) {
        tabToActivate = input;
    }

    if (!tabToActivate) {
        console.error(`Tabzy Invalid input '${input}'`);
        return;
    }

   this._tryActivateTab(tabToActivate);

}


Tabzy.prototype.destroy = function () {
    this.container.innerHTML = this._originalHTML;
    this.panels.forEach((panel) => (panel.hidden = false));
    this.container = null;
    this.tabs = null;
    this.panels = null;
    this.currentTab = null;
}