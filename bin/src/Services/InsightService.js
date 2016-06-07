"use strict";
var request = require('request');
var InsightService = (function () {
    function InsightService(baseUrl) {
        this.baseUrl = baseUrl;
    }
    InsightService.prototype.getAddressInfo = function (address, callback) {
        request.get(this.baseUrl + 'addr/' + address, callback);
    };
    InsightService.prototype.getTransactions = function (addresses, callback) {
        var addrs = addresses.reduce(function (prev, cur) { return cur + ',' + prev; });
        var opts = {
            baseUrl: this.baseUrl,
            body: JSON.stringify({ addrs: addrs }),
            headers: {
                "Content-Type": "application/json"
            }
        };
        var req = request.post('addrs/txs/', opts, callback);
    };
    return InsightService;
}());
exports.InsightService = InsightService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zaWdodFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvSW5zaWdodFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sT0FBTyxXQUFXLFNBQVMsQ0FBQyxDQUFDO0FBRXBDO0lBQ0Usd0JBQ1MsT0FBYztRQUFkLFlBQU8sR0FBUCxPQUFPLENBQU87SUFDckIsQ0FBQztJQUVILHVDQUFjLEdBQWQsVUFBZSxPQUFjLEVBQUUsUUFBZ0M7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sR0FBSSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDMUQsQ0FBQztJQUVELHdDQUFlLEdBQWYsVUFBZ0IsU0FBa0IsRUFBRSxRQUFnQztRQUNsRSxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUcsSUFBTSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUEsQ0FBQSxDQUFDLENBQUUsQ0FBQTtRQUV2RSxJQUFJLElBQUksR0FBdUI7WUFDN0IsT0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPO1lBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxDQUFDO1lBQ25DLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUMsa0JBQWtCO2FBQ2xDO1NBQ0YsQ0FBQTtRQUNELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBckJELElBcUJDO0FBRU8sc0JBQWMsa0JBRnJCO0FBRXNCIn0=