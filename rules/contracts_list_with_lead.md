# META
- id = 6615513564407132 
- version = 1
- category = before
- similar rules = 967959200718268, 1016441125959

# CODE
```javascript
CONTRACTS_COUNT = 13
DOUBLED = 3
REDOUBLED = 2
PASSED_OUT = 1
NON_DOUBLED = CONTRACTS_COUNT - DOUBLED - REDOUBLED - PASSED_OUT

contracts_array = [];

REMAINING_CONTRACTS = CONTRACTS_COUNT - PASSED_OUT;

for (let i = 0; i < REMAINING_CONTRACTS; ++i) contracts_array.push([undefined, undefined, undefined, undefined])

repeated = false;
do {
    let levels = [];
    if (REMAINING_CONTRACTS >= 7) {
        for (let i = 1; i <= 7; ++i)
            levels.push(i);
    }
    while (levels.length < REMAINING_CONTRACTS)
        levels.push(Math.min(random_int(1, 7), random_int(1, 7)));
    levels = random_order(levels);
    for (let i = 0; i < REMAINING_CONTRACTS; ++i) contracts_array[i][0] = levels[i];
    suits = balanced_sequence(REMAINING_CONTRACTS, 0, 4);
    declarers = balanced_sequence(REMAINING_CONTRACTS, 0, 3);
    for (let i = 0; i < REMAINING_CONTRACTS; ++i) contracts_array[i][1] = suits[i];
    for (let i = 0; i < REMAINING_CONTRACTS; ++i) contracts_array[i][2] = PLAYERS[declarers[i]];
    doubled = [];
    for (let i = 0; i < NON_DOUBLED; ++i) doubled.push('');
    for (let i = 0; i < DOUBLED; ++i) doubled.push('x');
    for (let i = 0; i < REDOUBLED; ++i) doubled.push('xx');
    doubled = random_order(doubled);
    for (let i = 0; i < REMAINING_CONTRACTS; ++i) contracts_array[i][3] = doubled[i];
    repeated = false;
    for (let i = 0; i < REMAINING_CONTRACTS; ++i) for (let j = i + 1; j < REMAINING_CONTRACTS; ++j) if (contracts_array[i][0] == contracts_array[j][0] && contracts_array[i][1] == contracts_array[j][1]) repeated = true;
}
while (repeated);

contracts = ''

suits_lead = balanced_sequence(REMAINING_CONTRACTS, 0, 3);
ranks_lead = balanced_sequence(REMAINING_CONTRACTS, 0, 12);


for (let i = 0; i < PASSED_OUT; ++i) contracts += '- PASS\n';

contracts_array.sort((x, y) => (x[0] != y[0] ? x[0] - y[0] : x[1] - y[1]));

let i = 0;
for (let [level, denomination, declarer, doubled] of contracts_array) {
    contracts += '- ' + level + DENOMINATIONS[denomination] + doubled + declarer + ', ' + SUITS[suits_lead[i]] + RANKS[ranks_lead[i]] + '\n';
    i++;
}

```

# EN 

Only the following contracts can be played, with the following card, lead in trick 1. Beginning from the dealer going clockwise each player crosses out one of the contracts, once there's only one left, that's the final contract,
if it's not PASSed out whoever has the card chosen leads it on trick 1, the partner of the chosen declarer lays the dummy as usual and the play continues as usual.

&(contracts)

# PL

Możliwa jest rozgrywka jedynie poniższych kontraktów po wyjściu następującą kartą w pierwszej lewie. Zaczynając od dealera, idąc zgodnie z ruchem wskazówek zegara gracze wykreślają po jednym kontrakcie,
kiedy zostanie tylko jeden kontrakt staje się on kontraktem ostatecznym. Jeśli nie są to 4 pasy, to gracz mający kartę podaną jako kartę wistu, niezależnie który z graczy to jest, wychodzi nią w pierwszej lewie,
partner gracza, który został wybrany rozgrywającym wykłada dziadka i przystępujemy do rozgrywki zgodnie ze standardowymi zasadami.

&(contracts)
