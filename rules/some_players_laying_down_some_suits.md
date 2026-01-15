# META
- id = 98979736486498 
- version = 2 
- category = after
- similar rules = 64131096084543
# CODE
```javascript

count = random_int_with_cache("count", 4, 6)
declaring_side_count = random_int_with_cache("declarer_count" + count, Math.ceil(count / 2), count - 1)
dummy = random_int_with_cache("dummy_count" + declaring_side_count, Math.ceil(declaring_side_count / 2), Math.min(3, declaring_side_count))
declarer = declaring_side_count - dummy;

suits = balanced_sequence(count, 0, 3)

defenders_count = count - declaring_side_count;

left_defender = random_int_with_cache("left_defender" + defenders_count, 0, defenders_count)

right_defender = defenders_count - left_defender

who = []
for (let i = 0; i < left_defender; ++i) who.push('left_defender');
for (let i = 0; i < right_defender; ++i) who.push('right_defender');
for (let i = 0; i < dummy; ++i) who.push('dummy');
for (let i = 0; i < declarer; ++i) who.push('declarer');

let repeated = false;
do {
    repeated = false;
    suits = random_order(suits);
    for (let i = 0; i < count; ++i) for (let j = i + 1; j < count; ++j) if (suits[i] == suits[j] && who[i] == who[j]) repeated = true;
}
while (repeated);

lay_down_list = []

for (player of ['left_defender', 'dummy', 'right_defender', 'declarer']) {
    face_up_suits = [];
    for (let i = 0; i < count; ++i) if (who[i] == player) face_up_suits.push(suits[i]);
    face_up_suits.sort();
    suits_str = '';
    for (let i = 0; i < face_up_suits.length; ++i) {
        if (i > 0 && i == face_up_suits.length - 1) suits_str += LANG_PHRASES('and') + ' ';
        else if (i != 0) suits_str += ', ';
        suits_str += SUITS[face_up_suits[i]];
    }
    if (face_up_suits.length)
        lay_down_list += '- ' + LANG_PHRASES('lays_down').replace('%p', LANG_PHRASES(player)).replace('%s', suits_str) + '\n';
}

```

# EN 

- DEFINE `left_defender` the player on lead
- DEFINE `dummy` dummy
- DEFINE `right_defender` the partner of the player on lead
- DEFINE `declarer` declarer
- DEFINE `lays_down`  %p lays down all of their %s
- DEFINE `and` and 

After the opening lead:
&(lay_down_list)

Whenever a player with any cards left face-up is to play a card the procedure goes as follows:
- If they're to lead the first card to a trick their partner either selects a face-up card, or orders them to select a card from their closed hand
- If they're to follow to a trick
    - If they have a card face-up of the same suit, their partner selects one
    - Otherwise if they have any cards of the suit lead in their closed hand they select one of them themselves
    - Otherwise they announce they don't have a card to follow and their partner either selects a face-up card or orders them to select a card from their closed hand


# PL 

- DEFINE `left_defender` wistujący
- DEFINE `dummy` dziadek
- DEFINE `right_defender` partner wistującego
- DEFINE `declarer` rozgrywający
- DEFINE `lays_down`  %p wykłada wszystkie swoje %s
- DEFINE `and` i

Po pierwszym wiście:
&(lay_down_list)

Kiedy gracz mający jakiekolwiek karty odkryte ma zagrać kartę procedura jest następująca:
- Jeśli gracz ten wychodzi jego partner albo wybiera jedną z odkrytych kart, albo nakazuje partnerowi samemu wybranie jednej z zakrytych
- Jeśli gracz ma dołożyć kolejną kartę w lewie
    - Jeśli wciąż ma na stole kartę w kolorze wyjścia jego partner wybiera jedną z nich
    - Jeśli nie, ale ma kartę w kolorze wyjścia w ręku sam wybiera jedną z nich
    - Jeśli nie ma do koloru ani w ręku ani w kartach odkrytych mówi, że nie ma i jego partner albo wybiera jedną z kart odkrytych, albo nakazuje mu samemu wybranie jednej z kart z ręki.
