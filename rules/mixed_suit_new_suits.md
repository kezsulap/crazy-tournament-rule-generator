# META
- id = 2463158597859 
- version = 2 
- category = before
- similar rules = 6080035998141

# CODE
```javascript
suit_names_list = LANG_PHRASES('suit_names').trim().split(' ')
type = random_int_with_cache('type', 0, 2)
permutations = []
function is_even_permutation(permutation) {
    let sign = 0;
    let N = permutation.length;
    for (let i = 0; i < N; ++i) {
        for (let j = i + 1; j < N; ++j) {
            if (permutation[i] == permutation[j])
                return false;
            if (permutation[i] > permutation[j]) {
                sign ^= 1;
            }
        }
    }
    return sign == 0;
}
for (let i = 0; i < 4; ++i) for (let j = 0; j < 4; ++j) for (let k = 0; k < 4; ++k) for (let l = 0; l < 4; ++l) {
    let this_permutation = [i, j, k, l];
    if (is_even_permutation(this_permutation))
        permutations.push(this_permutation);
}
sorting_order = []
for (let i = 0; i < 4; ++i) sorting_order.push([i, random_int(0, 1) ? 1 : -1]);
sorting_order = random_order(sorting_order);
function compare(p1, p2) {
    for (let [i, dir] of sorting_order) {
        if (p1[i] != p2[i])
            return dir * (p1[i] - p2[i]);
    }
    return 0;
}
permutations.sort(compare);
suits = []
if (type == 0) {
    function make_suit(x, y) {
        return SUITS[x] + '{AKQJT}' + SUITS[y] + '{98765432}';
    }
    for (let [a, b, c, d] of permutations) {
        suits.push([make_suit(a, b), make_suit(b, a), make_suit(c, d), make_suit(d, c)]);
    }
}
else if (type == 1) {
    function make_suit(x, y) {
        let ret = '';
        for (let i = 12; i >= 0; --i) ret += SUITS[i % 2 ? x : y] + '{' + RANKS[i] + '}';
        return ret;
    }
    for (let [a, b, c, d] of permutations) {
        suits.push([make_suit(a, b), make_suit(b, a), make_suit(c, d), make_suit(d, c)]);
    }
}
else if (type == 2) {
    function make_suit(x, y, z, t) {
        return SUITS[x] + '{AKQ}' + SUITS[y] + '{JT9}' + SUITS[z] + '{876}' + SUITS[t] + '{5432}';
    }
    for (let [a, b, c, d] of permutations) {
        suits.push([make_suit(a, b, c, d), make_suit(b, c, d, a), make_suit(c, d, a, b), make_suit(d, a, b, c)]);
    }
}

suit_symbols = ['🍎', '🍊', '🍉', '🍌', '🍓', '🫐', '🍇', '🥑', '🍅', '🍋', '🎃', '🥥']

table = "| | " + LANG_PHRASES('trump_suit') + "|" + LANG_PHRASES('other_suits') + "|||" + LANG_PHRASES('scoring') + "|\n";
table += "|--- |---|---|---|---|---|\n"
for (let i = 0; i < 12; ++i) {
    table += '|' + suit_names_list[i] + ' (' + suit_symbols[i] + ')' + '|';
    for (let suit of suits[i])
        table += suit + '|';
    if (i < 5) table += LANG_PHRASES('minor_suit')
    else if (i < 10) table += LANG_PHRASES('major_suit')
    else table += LANG_PHRASES('nt');
    table += '|\n';
}

```

# EN 
- DEFINE `suit_names` apples oranges watermelons bananas strawberries blueberries grapes avocados tomatoes lemons pumpkins coconuts
- DEFINE `minor_suit` minor
- DEFINE `major_suit` major
- DEFINE `trump_suit` trump suit
- DEFINE `other_suits` other suits
- DEFINE `scoring` scoring as if played in
- DEFINE `nt` NT

In this board the following suits can be bid:

&(table)

# PL
- DEFINE `suit_names` jabłka pomarańcze arbuzy banany truskawki jagody winogrona awokada pomidory cytryny dynie kokosy
- DEFINE `minor_suit` młodszy
- DEFINE `major_suit` starszy
- DEFINE `trump_suit` kolor atutowy
- DEFINE `other_suits` pozostałe kolory
- DEFINE `scoring` punktacja jak za grę w
- DEFINE `nt` NT

W tym rozdaniu można licytować następujące kolory:

&(table)
