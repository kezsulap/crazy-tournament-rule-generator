# META
- id = 411942266576967 
- version = 2 
- category = after 
- similar rules = 6002948166163, 094797420481777
- tags = minor_play
- meta_only = true

# CODE
```javascript
card_one = random_int_with_cache("card", 2, 9)
do
    card_two = random_int_with_cache("card", 2, 9)
while (card_one == card_two);

if (card_one > card_two) {
    let temp = card_one;
    card_one = card_two;
    card_two = temp;
}
forced_in_suits_other_than_lead = random_int_with_cache("", 0, 1);


card_one_english_article = (card_one == 8 ? 'an' : 'a');

if (forced_in_suits_other_than_lead) {
    rule69 = LANG_PHRASES('any_suit').replace('%a', card_one).replace('%b', card_two).replace('%EN_article', card_one_english_article);
} else {
    rule69 = LANG_PHRASES('suit_lead_only').replace('%a', card_one).replace('%b', card_two).replace('%EN_article', card_one_english_article);
}

```

# EN 
- DEFINE `suit_lead_only` If a player has %EN_article %a in the suit lead and the trick already contains %b of the same suit or the other way round, they must play it. This rule only applies to cards in the suit lead.
- DEFINE `any_suit` If a player has %EN_article %a in any suit and the trick already contains %b of the same suit or the other way round and the player can play it they must.

&(rule69)

# PL
- DEFINE `suit_lead_only` Jeśli gracz ma %a w kolorze wyjścia a w lewie już jest %b lub odwrotnie, to musi ją zagrać. Zasada ta dotyczy jedynie kart w kolorze wyjścia.
- DEFINE `any_suit` Jeśli gracz ma %a w dowolnym kolorze, a w lewie jest już karta %b tego samego koloru, lub odwrotnie i gracz może ją zagrać, to musi to zrobić.

&(rule69)
