"use strict";
const request = require('request');
class InsightService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    getAddressInfo(address, callback) {
        request.get(this.baseUrl + 'addr/' + address, callback);
    }
    getTransactions(addresses, callback) {
        var addrs = addresses.reduce((prev, cur) => { return cur + ',' + prev; });
        var opts = {
            baseUrl: this.baseUrl,
            body: JSON.stringify({ addrs: addrs }),
            headers: {
                "Content-Type": "application/json"
            }
        };
        var req = request.post('addrs/', opts, callback);
    }
    getUtxos(addresses, callback) {
        var addrs = addresses.reduce((prev, cur) => { return cur + ',' + prev; });
        var opts = {
            baseUrl: this.baseUrl,
            body: JSON.stringify({ addrs: addrs }),
            headers: {
                "Content-Type": "application/json"
            }
        };
        var req = request.post('addrs/utxo', opts, (err, resp, body) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body));
        });
    }
    broadcastTransaction(transaction, callback) {
        var opts = {
            baseUrl: this.baseUrl,
            body: JSON.stringify({ rawtx: transaction }),
            headers: {
                "Content-Type": "application/json"
            }
        };
        var req = request.post('tx/send', opts, (err, resp, body) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, JSON.parse(body).txid);
        });
    }
}
exports.InsightService = InsightService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zaWdodFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvU2VydmljZXMvSW5zaWdodFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU8sT0FBTyxXQUFXLFNBQVMsQ0FBQyxDQUFDO0FBR3BDO0lBQ0UsWUFDUyxPQUFjO1FBQWQsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUNyQixDQUFDO0lBRUgsY0FBYyxDQUFDLE9BQWMsRUFBRSxRQUFnQztRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFJLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUMxRCxDQUFDO0lBRUQsZUFBZSxDQUFDLFNBQWtCLEVBQUUsUUFBZ0M7UUFDbEUsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLE9BQU0sTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFBLENBQUEsQ0FBQyxDQUFFLENBQUE7UUFFdkUsSUFBSSxJQUFJLEdBQXVCO1lBQzdCLE9BQU8sRUFBQyxJQUFJLENBQUMsT0FBTztZQUNwQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQztZQUNuQyxPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFDLGtCQUFrQjthQUNsQztTQUNGLENBQUE7UUFDRCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUVELFFBQVEsQ0FBQyxTQUFrQixFQUFFLFFBQXVDO1FBQ2xFLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxPQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQSxDQUFBLENBQUMsQ0FBRSxDQUFBO1FBRXZFLElBQUksSUFBSSxHQUF1QjtZQUM3QixPQUFPLEVBQUMsSUFBSSxDQUFDLE9BQU87WUFDcEIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUM7WUFDbkMsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBQyxrQkFBa0I7YUFDbEM7U0FDRixDQUFBO1FBQ0QsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJO1lBQ3hELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxXQUFrQixFQUFFLFFBQTRCO1FBQ25FLElBQUksSUFBSSxHQUF1QjtZQUM3QixPQUFPLEVBQUMsSUFBSSxDQUFDLE9BQU87WUFDcEIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUMsV0FBVyxFQUFDLENBQUM7WUFDekMsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBQyxrQkFBa0I7YUFDbEM7U0FDRixDQUFBO1FBQ0QsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJO1lBQ3JELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVPLHNCQUFjLGtCQUZyQjtBQUVzQiJ9