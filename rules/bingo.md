# META
- id = 6262222316188320379 
- version = 1 
- category = before

# CODE
```

repeated = false;

tries = 0;

do {
    ranks = balanced_sequence(24, 0, 12);
    suits = balanced_sequence(24, 0, 3);
    repeated = false;
    for (let i = 0; i < 24; ++i)
        for (let j = i + 1; j < 24; ++j)
            if (suits[i] == suits[j] && ranks[i] == ranks[j])
                repeated = true;
    tries++;
}
while (repeated);

at = 0;

table = '||||||\n';
table += '|---|---|---|---|---|\n';

function next_card() {
    suit = suits[at];
    rank = ranks[at];
    at++;
    return SUITS[suit] + '{' + RANKS[rank] + '}';
}

for (let i = 0; i < 5; ++i) {
    table += '|';
    for (let j = 0; j < 5; ++j) {
        content = i == 2 && j == 2 ? 'FREE' : next_card();
        table += content + '|';
    }
    table += '\n';
}

```

# EN 

&(table)

Middle field counts as won by declarer, every other is marked as either won by declarer or defenders depending on who won the trick containing that card.

Declarer scores +1 for each column or row or main diagonal with all 5 squares won and +1 for making at least the number of tricks specified by the original contract. This score is considered to be the final number of tricks and used to
calculate the result.

Players are allowed to have a printed copy of the bingo board and mark all the cards gone whether they're won by declarer or defenders.

# PL

&(table)

Środkowe pole liczy się jako wygrane przez rozgrywającego, każde pozostałe jest liczone jako wygrane przez rozgrywającego lub przez obrońców zależnie kto wziął lewę zawierającą dane pole.

Rozgrywający dostaje +1 za każdą kolumnę, każdy wiersz i każdą z głównych przekątnych, w której wygrał wszystkie 5 pól, oraz +1 za wzięcie co najmniej tylu lew ile zostało wylicytowane. Tak otrzymana suma punktów jest potraktowana
jako liczba lew i na jej podstawie oblicza się wynik rozdania.
