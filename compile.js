const fs = require('fs');
const XLSX = require('xlsx');
const IP = {};
compile();

// const IP = require('./ip.json');
// console.log(search('222.28.32.249'));
// console.log(search('2.2.2.2'));

function search (ip) {
    console.log('searching', ip);
    ip = ip2int(ip);
    console.log('ip', ip);
    if (IP.min <= ip && ip <= IP.max) {
        let loc = scan(IP.list, ip);
        console.log('loc', loc);
        if (loc && loc[0] <= ip && ip <= loc[1]) {
            let iploc = IP.area[loc[2]];
            return { p: iploc.p, c: iploc.c };
        }
    }
    return null;
}

function compile () {
    try {
        console.log('loading db');
        let file = './lib/ip.db';
        let workbook = XLSX.readFile(file);
        let sheet_name_list = workbook.SheetNames;
        let worksheet = workbook.Sheets[sheet_name_list[0]];
        let ips = XLSX.utils.sheet_to_json(worksheet, { header: 0, raw: true });
        console.log('load ok');
        let loc = {};
        let min = 4294967296;
        let max = 0;
        let iploc = [];
        let list = [];
        let hash = {};
        let area = {};
        let areaId = 0;
        ips.forEach(ip => {
            if (ip.fm == '全球' || ip.rm == '全球') return;
            ip.start = ip2int(ip.startvalue);
            ip.end = ip2int(ip.endvalue);
            if (ip.start < min) {
                min = ip.start;
            }
            if (ip.end > max) {
                max = ip.end;
            }
            let p = {};
            if (ip.fm == '中国') {
                p = loc[ip.rm];
                if (p === undefined) {
                    loc[ip.rm] = p = {};
                }
                ip.fm = ip.rm;
            } else {
                p = loc[ip.fm];
                if (p === undefined) {
                    loc[ip.fm] = p = {};
                }
            }
            if (ip.rm == '省直辖县级行政区划' || ip.rm == '自治区直辖县级行政区划') {
                ip.rm = '';
            }
            if (p[ip.rm] === undefined) {
                p[ip.rm] = {};
            }
            let pc = ip.fm + '|' + ip.rm;
            let id = hash[pc];
            if (id === undefined) {
                id = hash[pc] = ++areaId;
                area[id] = {
                    p: ip.fm,
                    c: ip.rm
                };
            }
            list.push([ip.start, ip.end, id]);
            iploc.push({
                e: ip.end,
                s: ip.start
            });
        });
        // verify(iploc);
        // console.log(iploc);
        // console.log(loc);
        console.log('resamping');
        IP.min = min;
        IP.max = max;
        IP.area = area;
        IP.list = qsort(list);
        console.log(min, max);
        console.log(area);
        fs.writeFileSync('./ip.json', JSON.stringify(IP));
        console.log('compile ok');
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

function qsort (arr) {
    let stack = [ 0, arr.length - 1 ];
    let sp = stack.length - 1;
    do {
        if (sp <= 0) break;
        let b = stack[sp--];
        let a = stack[sp--];
        let i = a;
        let j = b;
        let l2r = 0;
        while (i < j) {
            if (arr[i][0] > arr[j][0]) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                l2r = !l2r;
            } else {
                l2r ? ++i : --j;
            }
        }
        if (a < i - 1) {
            stack[++sp] = a;
            stack[++sp] = i - 1;
        }
        if (b > i + 1) {
            stack[++sp] = i + 1;
            stack[++sp] = b;
        }
    } while (1);
    return arr;
}

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
        v = arr[p][0];
        if (v == search) {
            res = arr[p];
            break;
        } else if (v > search) {
            j = lr ? p : p - 1;
        } else { //v < search
            i = lr ? p + 1 : p;
        }
    } while (1);
    return res;
}

function ip2int (ip) {
    let [a, b, c, d] = ip.split('.');
    return Number(a) * 16777216 + Number(b) * 65536 + Number(c) * 256 + Number(d);
}

function int2ip (num) {
    let a = parseInt(num / 16777216);
    num -= a * 16777216;
    let b = parseInt(num / 65536);
    num -= b * 65536;
    let c = parseInt(num / 256);
    let d = num - c * 256;
    return a + '.' + b + '.' + c + '.' + d;
}

function verify (iploc) {
    for (let i = 0; i < iploc.length; ++i) {
        for (let j = i + 1; j < iploc.length; ++j) {
            if (iploc[i].s == iploc[j].s) {
                console.log(iploc[i], iploc[j]);
            }
            if (iploc[i].s >= iploc[j].s) {
                if (iploc[j].e >= iploc[i].s) {
                    console.log(iploc[i], iploc[j]);
                }
            } else {
                if (iploc[i].e >= iploc[j].s) {
                    console.log(iploc[i], iploc[j]);
                }
            }
        }
    }
}
