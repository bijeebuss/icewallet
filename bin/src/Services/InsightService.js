"use strict";
var request = require('request');
var InsightService = (function () {
    function InsightService(baseUrl) {
        this.baseUrl = baseUrl;
    }
    InsightService.prototype.getAddressInfo = function (address, callback) {
        request.get(this.baseUrl + 'addr/' + address, callback);
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
        var req = request.post('addrs/utxo/', opts, callback);
    };
    return InsightService;
}());
exports.InsightService = InsightService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zaWdodFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvSW5zaWdodFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sT0FBTyxXQUFXLFNBQVMsQ0FBQyxDQUFDO0FBRXBDO0lBQ0Usd0JBQ1MsT0FBYztRQUFkLFlBQU8sR0FBUCxPQUFPLENBQU87SUFDckIsQ0FBQztJQUVILHVDQUFjLEdBQWQsVUFBZSxPQUFjLEVBQUUsUUFBZ0M7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sR0FBSSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDMUQsQ0FBQztJQUVELGlDQUFRLEdBQVIsVUFBUyxTQUFrQixFQUFFLFFBQWdDO1FBQzNELElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRyxJQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQSxDQUFBLENBQUMsQ0FBRSxDQUFBO1FBRXZFLElBQUksSUFBSSxHQUF1QjtZQUM3QixPQUFPLEVBQUMsSUFBSSxDQUFDLE9BQU87WUFDcEIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUM7WUFDbkMsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBQyxrQkFBa0I7YUFDbEM7U0FDRixDQUFBO1FBQ0QsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUFyQkQsSUFxQkM7QUFFTyxzQkFBYyxrQkFGckI7QUFFc0IifQ==