# META
- id = 6080035998141 
- version = 2
- category = before
- similar rules = 2463158597859 

# CODE
```javascript
suit_names_list = LANG_PHRASES('suit_names').trim().split(' ')
suit_symbols = ['🐘', '🦒', '🐸', '🐢', '🦢', '🧸', '🦆', '🐈', '🐶', '🐮']
suits = []
mode = random_int_with_cache('mode', 0, 4);
if (mode == 0) {
    for (let i = 0; i <= 4; ++i)
        for (let j = i + 1; j <= 4; ++j)
            suits.push([DENOMINATIONS[i], DENOMINATIONS[j]]);
}
else if (mode == 1) {
    for (let x = 1; x <= 2; ++x)
        for (let i = 0; i <= 4; ++i)
            suits.push([DENOMINATIONS[i], DENOMINATIONS[(i + x) % 5]]);
}
else if (mode == 2) {
    for (let i = 0; i <= 4; ++i)
        for (let j = 0; j < i; ++j)
            suits.push([DENOMINATIONS[i], DENOMINATIONS[j]]);
}
else if (mode == 3) {
    for (let i = 0; i <= 4; ++i)
        for (let x = 1; x <= 2; ++x)
            suits.push([DENOMINATIONS[i], DENOMINATIONS[(i + x) % 5]]);
}
else if (mode == 4) {
    for (let i = 0; i <= 4; ++i) {
        for (let j = i + 1; j <= 4; ++j) {
            if (random_int_with_cache('denominations_swap', 0, 2))
                suits.push([DENOMINATIONS[i], DENOMINATIONS[j]]);
            else
                suits.push([DENOMINATIONS[j], DENOMINATIONS[i]]);
        }
    }
    suits = random_order(suits);
}
table = "| | " + LANG_PHRASES('odd_trump') + "|" + LANG_PHRASES('even_trump') + "|" + LANG_PHRASES('scoring') + "|\n";
table += "|---|---|---|---|\n"
for (let i = 0; i < 10; ++i) {
    table += '|' + suit_names_list[i] + ' (' + suit_symbols[i] + ')' + '|';
    for (let suit of suits[i])
        table += suit + '|';
    if (i < 4) table += LANG_PHRASES('minor_suit')
    else if (i < 8) table += LANG_PHRASES('major_suit')
    else table += LANG_PHRASES('nt');
    table += '|\n';
}
```

# EN 

- DEFINE `suit_names` elephants giraffes frogs turtles swans bears ducks kittens puppies cows
- DEFINE `minor_suit` minor
- DEFINE `major_suit` major
- DEFINE `odd_trump` trump in odd-numbered tricks
- DEFINE `even_trump` trump in even-numbered tricks
- DEFINE `scoring` scoring as if played in
- DEFINE `nt` NT

In this board the following suits can be bid, each choosing trump separately for first and every subsequent odd-numbered trick and for second and every subsequent even-numbered trick.

&(table)

# PL
- DEFINE `suit_names` słonie żyrafy żabki żółwie łabędzie misie kaczuszki kotki pieski krówki
- DEFINE `minor_suit` młodszy
- DEFINE `major_suit` starszy
- DEFINE `odd_trump` atu w lewach nieparzystych
- DEFINE `even_trump` atu w lewach parzystych
- DEFINE `scoring` punktacja jak za grę w
- DEFINE `nt` NT

W tym rozdaniu można licytować następujące miana, każde z nich oznacza wybór koloru atutowego osobno dla pierwszej i każdej kolejnej nieparzystej oraz osobno dla drugiej i każdej kolejnej parzystej lewy.

&(table)
