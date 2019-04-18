App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    cAddress: '0xDE0480D74950a2C891e7ceD9d03684612CcA798b',
    pathname: () => document.location.pathname.substr(1),

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function() {
        $.getJSON("Crowdsourcing.json", function(election) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Crowdsourcing = TruffleContract(election);
            // Connect provider to interact with contract
            App.contracts.Crowdsourcing.setProvider(App.web3Provider);
            App.listenForEvents();
            return App.render();
        });
    },

    render: function() {
        var electionInstance;
        var loader = $("#loader");
        var content = $("#content");
        var submissionBox = $("form")
        var table = $('table')

        loader.show();
        content.hide();
        table.hide()
        let myPay;
        let myAnswer;
        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        // Load contract data
        App.contracts.Crowdsourcing.at(App.pathname()).then(function(instance) {
            electionInstance = instance;
            return Promise.all([electionInstance.getContent()
                , electionInstance.getAmount()
                , electionInstance.getTotal()
                , electionInstance.isPaying()
                , electionInstance.myPay()
                , electionInstance.myAnswer()
                ])
        }).then(function(values) {
            var c = $('#summary');
            c.html("Task: " + values[0])
            let amountHtml = $('#amount')
            amountHtml.html(`Total contract value: ${values[1]} wei`)
            let totalHtml = $('#total')
            totalHtml.html(`Number of answers needed: ${values[2]}`)
            let currentHtml = $('#current')
            currentHtml.html(`Accepting answers: ${values[3] ? "Yes" : "No"}`)
            myPay = values[4];
            myAnswer = values[5];
            loader.hide();
            content.show();
            return electionInstance._owner()
        }).then((owner) =>{
            if (owner != App.account) {
                let mystate = $('#mystate')
                mystate.show()
                if (!(myPay || myAnswer)) mystate.html("Rejected or Not submitted")
                mystate.html(`Answer: <br/>
                <div id="answerBox">${myAnswer}</div> <br/>
                ${myPay ? "<strong>This answer is accepted</strong>" : ""}`)
                return Promise.reject("Not owner account" );
            }
            table.show()
            submissionBox.hide()
            return electionInstance.getNumberOfWorkers()
        }).then((answerNumber) => {
            var answerList = $("#answerList");
            answerList.empty();
            for (var i = 0; i < answerNumber; ++i) {
                let id = ''
                let a = ''
                let accepted = false;
                electionInstance.getWorkers(i).then((addr)=>{
                    id = addr;
                    return electionInstance.getAnswers(id);
                }).then((answ) => {
                    a=answ;
                    
                    return electionInstance.isPaid(id)
                }).then((isPaid) => {
                    let taskTemplate = ''
                    if (isPaid) {
                        taskTemplate = `<tr><th>${i}</th><td>${a}</td><td>${id}</td><td>Accepted</tr>`
                    } else {
                        if (a)
                        taskTemplate = `<tr><th>${i}</th><td>${a}</td><td>${id}</td><td><button onclick='App.accept("${id}")'>Accept</button> <button onclick='App.reject("${id}")'>Reject</button></tr>`;
                        else
                            taskTemplate = `<tr><th>${i}</th><td>${a}</td><td>${id}</td><td>Rejected</tr>`;
                    }
                    answerList.append(taskTemplate);

                })
                
            }
        }).catch(function(error) {
            console.warn(error);
        });
    },
    accept: function(id) {
        App.contracts.Crowdsourcing.at(App.pathname()).then(function (instance) {
            console.log("Hey")
            return instance.accept(id, { from: App.account });
        }).catch(function (err) {
            console.error(err);
        });
    },
    reject: function(id) {
        App.contracts.Crowdsourcing.at(App.pathname()).then(function (instance) {
            console.log("Hey")
            return instance.reject(id, { from: App.account });
        }).catch(function (err) {
            console.error(err);
        });
    },
    answer: function() {
        var text = $('#textToTranslate').val();
        var loader = $("#loader");

        App.contracts.Crowdsourcing.at(App.pathname()).then(function(instance) {
            loader.show()
            console.log(new Date().getTime())

            return instance.answer(text, { from: App.account });
        }).then((_) =>{
            loader.hide()
            App.render()
        }).catch(function(err) {
            console.error(err);
        });
    },

    listenForEvents: function() {
        App.contracts.Crowdsourcing.at(App.pathname()).then(function(instance) {
            instance.toVerification({}).watch(function (error, event) {
                console.log("event triggered", event)
                // Reload when a new vote is recorded
                App.render();
                console.log("Hello" + new Date().getTime())

            });
        });
    },
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
