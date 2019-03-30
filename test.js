const iploc = require('./index');

// console.log(scan([1,3,4,5,6,26,37,48,59], 5, 0));
// console.log(scan([1,3,4,5,6,26,37,48,59], 5, 1));
                  // 0 1 2 3 4  5  6  7  8
// console.log(scan([1,3,4,5,6,26,37,48,59], 5.5, 0));
// console.log(scan([1,3,4,5,6,26,37,48,59], 5.5, 1));


// console.log(scan([1,3,4,5,6,26,37,48,59], 4.5, 0));
// console.log(scan([1,3,4,5,6,26,37,48,59], 4.5, 1));

function scan (arr, search, lr) {
    let p, v, res;
    let i = 0, j = arr.length - 1;
    let round = lr ? Math.floor : Math.ceil;
    do {
        if (i >= j) { //diff between i and j <= 1
            res = lr ? arr[j] : arr[i];
            break;
        }
        p = i + round((j - i) / 2);
        console.log(i, p, j);
        v = arr[p];
        if (v == search) {
            res = v;
            break;
        } else if (v > search) {
            j = lr ? p : p - 1;
        } else { //v < search
            i = lr ? p + 1 : p;
        }
    } while (1);
    return res;
}

async function test () {
    try {
        let a = await iploc.search('6.173.98.42');
        console.log(a);
    } catch (err) {
        console.error(err);
    }
}

setTimeout(test, 10);
