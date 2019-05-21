const IP = require('./ip.json');

const ll = IP.list.length;

function search (ip) {
    ip = ip2int(ip);
    if (IP.min <= ip && ip <= IP.max) {
        let loc = scan(ip);
        if (loc && loc[0] <= ip && ip <= loc[1]) {
            let iploc = IP.area[loc[2]];
            return { p: iploc.p, c: iploc.c };
        }
    }
    return null;
}

let areaTree;

function tree () {
    if (areaTree) {
        return areaTree;
    }
    areaTree = [];
    let obj = {};
    for (let id in IP.area) {
        let { p, c } = IP.area[id];
        c = c || '直辖';
        if (!obj[p]) {
            obj[p] = {
                name: p,
                type: 1,
                obj: {}
            };
        }
        if (!obj[p].obj[c]) {
            obj[p].obj[c] = {
                name: c,
                type: 2
            };
        }
    }
    for (let p in obj) {
        let po = {
            name: obj[p].name,
            type: obj[p].type,
            items: []
        };
        for (let c in obj[p].obj) {
            po.items.push(obj[p].obj[c]);
        }
        areaTree.push(po);
    }
    return areaTree;
}

function ip2int (ip) {
    let [a, b, c, d] = ip.split('.');
    return Number(a) * 16777216 + Number(b) * 65536 + Number(c) * 256 + Number(d);
}

function scan (ip) {
    let p, s, res;
    let i = 0, j = ll - 1;
    do {
        if (i >= j) { //diff between i and j <= 1
            res = IP.list[i];
            break;
        }
        p = i + Math.ceil((j - i) / 2);
        s = IP.list[p][0];
        if (s == ip) {
            res = IP.list[p];
            break;
        } else if (s > ip) {
            j = p - 1;
        } else { //s < ip
            i = p;
        }
    } while (1);
    return res;
}

module.exports = { search, tree };
