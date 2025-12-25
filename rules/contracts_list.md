# META
- id = 967959200718268
- version = 1
- category = before

# CODE
```
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


for (let i = 0; i < PASSED_OUT; ++i) contracts += '- PASS\n';

contracts_array.sort((x, y) => (x[0] != y[0] ? x[0] - y[0] : x[1] - y[1]));

for (let [level, denomination, declarer, doubled] of contracts_array) {
    contracts += '- ' + level + DENOMINATIONS[denomination] + doubled + declarer + '\n';
}

```

# EN 

Only the following contracts can be played, beginning from the dealer going clockwise each player crosses out one of the contracts, once there's only one left, that's the final contract and the play phase
begins as usual:

&(contracts)

# PL

Możliwa jest rozgrywka jedynie poniższych kontraktów, zaczynajac od dealera, idąc zgodnie z ruchem wskazówek zegara gracze wykreślają po jednym kontrakcie, kiedy zostanie tylko jeden kontrakt staje się on
kontraktem ostatecznym i przystępujemy do rozgrywki zgodnie ze standardowymi zasadami:

&(contracts)
