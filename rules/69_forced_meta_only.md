# META
- id = 411942266576967 
- version = 1 
- category = after 
- similar rules = 6002948166163, 094797420481777
- tags = minor_play
- meta_only = true

# CODE
```javascript
is_first = count_previous() == 0

if (is_first) {
    pair_one = random_int_with_cache("card", 6, 6)
    pair_two = random_int_with_cache("card", 9, 9)
    turn = random_int_with_cache("card", 4, 4)
}
else {
    card_one = random_int_with_cache("card", 2, 9)
    do
        card_two = random_int_with_cache("card", 2, 9)
    while (card_one == card_two);
    do
        card_three = random_int_with_cache("card", 2, 9)
    while (card_three == card_one || card_three == card_two);

    [pair_one, pair_two, turn] = random_order([card_one, card_two, card_three])

    if (pair_one > pair_two) {
        temp = pair_one;
        pair_one = pair_two;
        pair_two = temp;
    }
}

pair_one_english_article = (pair_one == 8 ? 'an' : 'a');
turn_english_article = (turn == 8 ? 'an' : 'a');

forced_in_suits_other_than_lead = random_int_with_cache("", 0, 1);

if (forced_in_suits_other_than_lead) {
    rule69 = LANG_PHRASES('any_suit').replace('%a', pair_one).replace('%b', pair_two).replace('%EN_article', pair_one_english_article);
} else {
    rule69 = LANG_PHRASES('suit_lead_only').replace('%a', pair_one).replace('%b', pair_two).replace('%EN_article', pair_one_english_article);
}

```

# EN 
- DEFINE `suit_lead_only` If a player has %EN_article %a in the suit lead and the trick already contains %b of the same suit, they must play it. This rule only applies to cards in the suit lead.
- DEFINE `any_suit` If a player has %EN_article %a in any suit and the trick already contains %b of the same suit and the player can play it they must.

&(rule69)

If the trick contains &(turn_english_article) &(turn) from the next trick onwards the order of playing cards reverses from clockwise to counter-clockwise or the other way round.
If there's an even number of &(turn)s in one trick they cancel out and the next tricks proceeds normally.

# PL
- DEFINE `suit_lead_only` Jeśli gracz ma %a w kolorze wyjścia a w lewie już jest %b lub odwrotnie, to musi ją zagrać. Zasada ta dotyczy jedynie kart w kolorze wyjścia.
- DEFINE `any_suit` Jeśli gracz ma %a w dowolnym kolorze, a w lewie jest już karta %b tego samego koloru, lub odwrotnie i gracz może ją zagrać, to musi to zrobić.

&(rule69)

Jeśli w lewie zostaje zagrana zostaje &(turn) od następnej lewy karty zagrywane są w kierunku przeciwnym niż do tej pory, przeciwnie do ruchu wskazówek zegara jeśli do tej pory były zgodnie, lub odwrotnie.
Jeśli w lewie znajduje się parzysta liczba &(turn)-ek to się wzajemnie znoszą i w następnej lewie dokładamy karty w tej samej kolejności co do tej pory.
