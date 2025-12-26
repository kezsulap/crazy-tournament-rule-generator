# META
- id = 9685427317585169 
- version = 1
- category = before

# CODE
```

used_up = []
for (let i = 0; i < 13; ++i) used_up.push([0, 0, 0, 0]);

for_contract = [];
for (let i = 0; i < 7; ++i) for_contract.push([[], [], [], [], []]);

function push_card(rank, suit, level, denomination) {
    used_up[rank][suit] = 1;
    for_contract[level - 1][denomination].push([rank, suit]);
}

for (let suit = 0; suit < 4; ++suit) {
    for (let rank = 0; rank < 6; ++rank) { //Including offset ranks 2-7
        push_card(rank, suit, rank + 2, suit);
    }
}

function parse_cards(level, denomination) {
    let cards = for_contract[level][denomination];
    let cards_str = [];
    for (let [rank, suit] of cards) {
        cards_str.push(SUITS[suit] + '{' + RANKS[rank] + '}');
    }
    return cards_str.join(', ');
}

let one_level = random_int(0, 2);
if (one_level == 0) {
    for (let i = 0; i < 4; ++i) {
        push_card(8, i, 1, i);
    }
}
else if (one_level == 1) {
    for (let i = 0; i < 4; ++i) {
        push_card(12, i, 1, i);
    }
}
else if (one_level == 2) {
    for (let i = 0; i < 4; ++i) {
        push_card(8, i, 1, i);
        push_card(12, i, 1, i);
    }
}

have_game_bid = (random_int(0, 9) < 7 ? 1 : 0);
have_small_slam_bid = (random_int(0, 9) < 7 ? 1 : 0);
have_grand_slam_bid = (random_int(0, 9) < 7 ? 1 : 0);

total_extra = (have_game_bid + have_small_slam_bid + have_grand_slam_bid);

let free = [];
for (let i = 8; i <= 12; ++i) { //Honours only
    if (!used_up[i][0]) free.push(i);
}

selected = shuffled_subset(total_extra, 0, free.length - 1);

at = 0;
if (have_game_bid) {
    for (let s = 0; s < 4; ++s) {
        level = (s <= 1 ? 5 : 4);
        push_card(free[selected[at]], s, level, s);
    }
    at++;
}
if (have_small_slam_bid) {
    for (let s = 0; s < 4; ++s) {
        level = 6;
        push_card(free[selected[at]], s, level, s);
    }
    at++;
}
if (have_grand_slam_bid) {
    for (let s = 0; s < 4; ++s) {
        level = 7;
        push_card(free[selected[at]], s, level, s);
    }
    at++;
}

for_notrump = [];
let suits_reversed = random_int(0, 2);
for (let rank = 12; rank >= 0; --rank) {
    for (let s = 0; s <= 3; ++s) {
        let suit = (suits_reversed ? 3 - s : s);
        if (!used_up[rank][suit]) {
            for_notrump.push([rank, suit]);
        }
    }
}


slots = [1, 1, 1, 1, 1, 1, 1];
let sum_slots = 7;
function try_add_slot(i) {
    if (sum_slots + 1 <= for_notrump.length) {
        slots[i - 1]++;
        sum_slots++;
    }
}

if (have_game_bid) try_add_slot(3);
if (have_small_slam_bid) try_add_slot(6);
if (have_grand_slam_bid) try_add_slot(7);
if (random_int(0, 9) < 7) try_add_slot(1);
if (random_int(0, 9) < 7) try_add_slot(1);

at = 0;

for (let i = 6; i >= 0; --i) {
    for (let _ = 0; _ < slots[i]; ++_) {
        let [rank, suit] = for_notrump[at];
        at++;
        push_card(rank, suit, i + 1, 4);
    }
}



table = "| | ♣ | ♦ | ♥ | ♠ | NT |\n"
table += "|---|---|---|---|---|---|\n"

for (let i = 0; i < 7; ++i) {
    table += "|" + (i + 1) + "|";
    for (let j = 0; j < 5; ++j) {
        table += parse_cards(i, j) + "|";
    }
    table += "\n";
}


```
# EN 

During the bidding contracts can be bid using either cards from bidding boxes or by putting a card from hand face up on the table according to the following table:

&(table)

Over a contract bid with cards from bidding box it is allowed bid the same contract with a card from hand.

Only contracts bid with card from hand and contracts that are doubled or redoubled are played, others are scored 0 tricks for declarer without play phase.
