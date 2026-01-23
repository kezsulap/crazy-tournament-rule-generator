# META
- id = 54362263934001 
- version = 1 
- category = after 
- similar rules = 710523224811, 557555391507, 094797420481777
- tags = minor_play
- meta_only = true

# CODE
```javascript
turn = random_int_with_cache("card", 2, 9)
turn_english_article = (turn == 8 ? 'an' : 'a');

```

# EN 
If the trick contains &(turn_english_article) &(turn) from the next trick onwards the order of playing cards reverses from clockwise to counter-clockwise or the other way round.
If there's an even number of &(turn)s in one trick they cancel out and the next tricks proceeds normally.

# PL
Jeśli w lewie zostaje zagrana zostaje &(turn) od następnej lewy karty zagrywane są w kierunku przeciwnym niż do tej pory, przeciwnie do ruchu wskazówek zegara jeśli do tej pory były zgodnie, lub odwrotnie.
Jeśli w lewie znajduje się parzysta liczba &(turn)-ek to się wzajemnie znoszą i w następnej lewie dokładamy karty w tej samej kolejności co do tej pory.
