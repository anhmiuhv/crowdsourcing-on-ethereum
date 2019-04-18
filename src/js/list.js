App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    cAddress: '0x244ac8ca6af07e3f5dd28bfa3c8fafcd2222628c',

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
        $.getJSON("betaCrdSet.json").then((set) => {
            // Instantiate a new truffle contract from the artifact
            App.contracts.CrdSet = TruffleContract(set);
            // Connect provider to interact with contract
            App.contracts.CrdSet.setProvider(App.web3Provider);
            // App.listenForEvents();
            return $.getJSON("Crowdsourcing.json")
        }).then((crowdsourcing) => {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Crowdsourcing = TruffleContract(crowdsourcing);
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
        let count = 0;

        loader.show();
        content.hide();
        table.hide()

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        // Load contract data
        App.contracts.CrdSet.at(App.cAddress).then(function(instance) {
            electionInstance = instance;
            return electionInstance.getContracCount()
        }).then(function(values) {
            loader.hide();
            content.show();
            table.show();
            count = values;


            let a = []
            for (let i = 0; i < values; ++i) {
                a.push(electionInstance.list(i))
            }
            return Promise.all(a)
        }).then((value)=>{
            var answerList = $("#answerList");
            answerList.empty();
            for (let i = 0; i < count; ++i) {
                let taskTemplate = `<tr><th>${i}</th><td><a href="${value[i]}">${value[i]}</a></td></tr>`
                answerList.append(taskTemplate);
            }
        }).catch(function(error) {
            console.warn(error);
        });
    },
    splitJob: function(string, workerCount) {
        var splitJobs = string.split('.').map(function(sentence) {
            return sentence.trim() + '.';
        });

        if (splitJobs.slice(-1) == '.')
            splitJobs.pop();
        else if (string.slice(-1) != '.') {
            let lastIndex = splitJobs.length - 1;
            splitJobs[lastIndex] = splitJobs[lastIndex].slice(0, -1);
        }
        return splitJobs;
    },
    deploy: function() {
        App.contracts.CrdSet.at(App.cAddress).then(function (instance) {
            let amount = $('#amountValue').val()
            let total = $('#totalValue').val()
            let content = $('#textToTranslate').val()
            var splitJobs = [];
            if ($('#splitCheckbox').is(':checked'))
                splitJobs = App.splitJob(content, total);

            $("#loader").show();
            if (total > splitJobs.length) {
                instance.createCC(total, content, { from: App.account, value: amount });
                return;
            }

            var jobs = [];
            let jobCountPerWorker = Math.ceil(splitJobs.length / total);
            for (var i = 1; i <= splitJobs.length; ++i) {
                jobs.push(splitJobs[i - 1]);
                if ((i % jobCountPerWorker) == 0) {
                    instance.createCC(1, jobs.join(' '), { from: App.account, value: amount });
                    jobs = [];
                }
            }

            if (jobs.length > 0)
                instance.createCC(1, jobs.join(' '), { from: App.account, value: amount });
        }).then(function() {
            App.render();
        }).catch(function(err) {
            console.error(err);
        });
    },

    listenForEvents: function() {
        App.contracts.CrdSet.at(App.cAddress).then(function(instance) {
            instance.newContract({}).watch(function(error, event) {
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
