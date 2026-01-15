# META
- id = 1987838664427 
- version = 1
- category = before

# CODE
```javascript
count = random_int_with_cache('count', 10, 25)
while (true) {
    chosen = random_subset(count, 0, 34);
    used = []
    for (let i = 0; i < 35; ++i) used.push(0)
    for (let i of chosen) used[i] = 1;
    suits_used = [0, 0, 0, 0, 0]
    level_used = [0, 0, 0, 0, 0, 0, 0]
    for (let i of chosen) {
        suits_used[i % 5] = 1;
        level_used[Math.floor(i / 5)] = 1;
    }
    all = true;
    for (let x of suits_used) if (!x) all = false;
    for (let x of level_used) if (!x) all = false;
    if (all) break;
}

table = '||||||\n';
table += '|---|---|---|---|---|\n';
for (let i = 0; i < 7; ++i) {
    table += '|';
    for (let j = 0; j < 5; ++j) {
        if (used[i * 5 + j]) {
            table += (i + 1) + DENOMINATIONS[j];
        }
        table += '|';
    }
    table += '\n';
}
```

# EN 

Only the following contracts can be bid:

&(table)

# PL

Można licytować jedynie następujące kontrakty:

&(table)
