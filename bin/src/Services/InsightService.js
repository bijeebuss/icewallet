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
        var req = request.post('addrs/', opts, callback);
    };
    InsightService.prototype.getUtxos = function (addresses, callback) {
        var addrs = addresses.reduce(function (prev, cur) { return cur + ',' + prev; });
        var opts = {
            baseUrl: this.baseUrl,
            body: JSON.stringify({ addrs: addrs }),
            headers: {
                "Content-Type": "application/json"
            }
        };
        var req = request.post('addrs/utxo', opts, function (err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body));
        });
    };
    InsightService.prototype.broadcastTransaction = function (transaction, callback) {
        var opts = {
            baseUrl: this.baseUrl,
            body: JSON.stringify({ rawtx: transaction }),
            headers: {
                "Content-Type": "application/json"
            }
        };
        var req = request.post('tx/send', opts, function (err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body).txid);
        });
    };
    return InsightService;
}());
exports.InsightService = InsightService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zaWdodFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvSW5zaWdodFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sT0FBTyxXQUFXLFNBQVMsQ0FBQyxDQUFDO0FBR3BDO0lBQ0Usd0JBQ1MsT0FBYztRQUFkLFlBQU8sR0FBUCxPQUFPLENBQU87SUFDckIsQ0FBQztJQUVILHVDQUFjLEdBQWQsVUFBZSxPQUFjLEVBQUUsUUFBZ0M7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sR0FBSSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDMUQsQ0FBQztJQUVELHdDQUFlLEdBQWYsVUFBZ0IsU0FBa0IsRUFBRSxRQUFnQztRQUNsRSxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLEdBQUcsSUFBTSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUEsQ0FBQSxDQUFDLENBQUUsQ0FBQTtRQUV2RSxJQUFJLElBQUksR0FBdUI7WUFDN0IsT0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPO1lBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxDQUFDO1lBQ25DLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUMsa0JBQWtCO2FBQ2xDO1NBQ0YsQ0FBQTtRQUNELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNsRCxDQUFDO0lBRUQsaUNBQVEsR0FBUixVQUFTLFNBQWtCLEVBQUUsUUFBdUM7UUFDbEUsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxHQUFHLElBQU0sTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFBLENBQUEsQ0FBQyxDQUFFLENBQUE7UUFFdkUsSUFBSSxJQUFJLEdBQXVCO1lBQzdCLE9BQU8sRUFBQyxJQUFJLENBQUMsT0FBTztZQUNwQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQztZQUNuQyxPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFDLGtCQUFrQjthQUNsQztTQUNGLENBQUE7UUFDRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFDLElBQUk7WUFDeEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQztnQkFDUCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELDZDQUFvQixHQUFwQixVQUFxQixXQUFrQixFQUFFLFFBQTRCO1FBQ25FLElBQUksSUFBSSxHQUF1QjtZQUM3QixPQUFPLEVBQUMsSUFBSSxDQUFDLE9BQU87WUFDcEIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUMsV0FBVyxFQUFDLENBQUM7WUFDekMsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBQyxrQkFBa0I7YUFDbEM7U0FDRixDQUFBO1FBQ0QsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJO1lBQ3JELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBdkRELElBdURDO0FBRU8sc0JBQWMsa0JBRnJCO0FBRXNCIn0=