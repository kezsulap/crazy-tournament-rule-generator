# META
- id = 1016441125959 
- version = 1
- category = before
- similar rules = 6615513564407132

# CODE
```javascript
suit_excluded = []
for (let i = 0; i < 36; ++i) suit_excluded.push(i % 4);
suit_excluded = random_order(suit_excluded);

cards_lead = []

for (let i = 0; i < 35 * 3; ++i) cards_lead.push(undefined)

spots = [[], [], [], []]

for (let i = 0; i < 35; ++i) {
    let other = [];
    for (let j = 0; j < 4; ++j) if (j != suit_excluded[i]) other.push(j);
    other = random_order(other);
    for (let j = 0; j < 3; ++j) spots[other[j]].push(i * 3 + j);
}

for (let suit = 0; suit < 4; ++suit) {
    let len = spots[suit].length;
    let full = Math.floor(len / 13);
    let rest = len % 13;
    let ranks_array = [];
    for (let i = 0; i < full; ++i) for (let j = 0; j < 13; ++j) ranks_array.push(j);
    let rest_set = random_subset(rest, 0, 12);
    for (let x of rest_set) ranks_array.push(x);
    ranks_array = random_order(ranks_array);
    for (let i = 0; i < len; ++i) {
        cards_lead[spots[suit][i]] = [CLUB, DIAMOND, HEART, SPADE][suit] + '{' + RANKS[ranks_array[i]] + '}';
    }
}

table = '| | ♣ | | | ♦ | | | ♥ | | | ♠ | | | NT | |\n'
table += '| ';
for (let _ = 0; _ < 15; ++_) table += ' --- |';
table += '\n';
table += '| | X | XX | | X | XX | | X | XX | |  X | XX | | X | XX | \n'

for (let i = 0; i < 7; ++i) {
    table += '|' + (i + 1) + ':';
    for (let j = 0; j < 3 * 5; ++j) {
        table += cards_lead[i * 3 * 5 + j] + "|";
    }
    table += '\n';
}

```

# EN 

On the first trick a card according to the following table is lead no matter which player holds it:

&(table)

# PL

 W pierwszej lewie wyjście następuje wyjście następującą kartą wg poniższej tabeli, niezależnie który z graczy ją ma:

 &(table)
