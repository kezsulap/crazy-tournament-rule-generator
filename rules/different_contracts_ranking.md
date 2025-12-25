# META
- id = 9806132048239972 
- version = 1
- category = before

# CODE
```
denominations = []
for (let i = 0; i < 5; ++i)
    for (let j = 0; j < 7; ++j)
        denominations.push(i);
denominations = random_order(denominations);
seen = [1, 1, 1, 1, 1];
contracts = []
for (let i = 0; i < 35; ++i) {
    suit = denominations[i];
    contracts.push(seen[suit] + DENOMINATIONS[suit]);
    seen[suit]++;
}
ranking = ''
for (let i = 0; i < 35; ++i) {
    if (i % 5 == 0) ranking += '\n- '
    else ranking += ', ';
    ranking += contracts[i];
}
```

# EN 

The contracts ranking goes as follows:
&(ranking)

