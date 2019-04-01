//const iploc = require('./index')(8000);


let ips = [];
for (let i=0;i<1000000;++i) {
    let ip = (1+parseInt(Math.random()*250)) + '.' + (1+parseInt(Math.random()*250)) + '.' + (1+parseInt(Math.random()*250)) + '.' + (1+parseInt(Math.random()*250));
    ips.push(ip);
}

let a=Date.now();
for (let ip of ips)
(ip2int(ip));
console.log(Date.now()-a);
a=Date.now();
for (let ip of ips)
(ip2int2(ip));
console.log(Date.now()-a);







function ip2int (ip) {
    let [a, b, c, d] = ip.split('.');
    return Number(a) * 16777216 + Number(b) * 65536 + Number(c) * 256 + Number(d);
}

function ip2int2 (ip) {
    let i = 0;
    let l = ip.length;
    let num = '';
    let res = 0;
    let step = 24;
    let b;
    for (; i < l; ++i) {
        b = ip[i];
        if (b == '.') {
            res += Number(num) << step;
            step -= 8;
            num = '';
        } else {
            num += b;
        }
    }
    res += Number(num);
    return res;
}

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
        let a = await iploc.search('61.173.98.42');
        console.log(a);
    } catch (err) {
        console.error(err);
    }
}

//setTimeout(test, 100);
