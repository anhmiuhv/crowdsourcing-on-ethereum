var Crowdsourcing = artifacts.require("./Crowdsourcing");
var Set = artifacts.require("./Set")
var CrdSet = artifacts.require("CrdSet")

module.exports = function(deployer, network) {
    if (network == "rinkeby") {
        let s = Set.at('0xF768b2BbC8B4E8f1Ce887a17561b09152fBb9DDc')
        deployer.link(s, CrdSet)
        deployer.deploy()
        
    } else {
        deployer.deploy(Set)
        deployer.link(Set, CrdSet)
        deployer.deploy(CrdSet);
    }
};
