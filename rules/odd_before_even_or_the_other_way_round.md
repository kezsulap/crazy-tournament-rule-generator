# META
- id = 622530134474860447 
- version = 1 
- category = after

# CODE
```
if (random_int(0, 1)) card_parity = LANG_PHRASES('odd_card')
else card_parity = LANG_PHRASES('even_card')
```

# EN 

- DEFINE `odd_card` an odd-ranked card
- DEFINE `even_card` an even-ranked card

Every player whenever possible must play &(card_parity)

# PL
- DEFINE `odd_card` kartę nieparzystą
- DEFINE `even_card` kartę parzystą

Każdy gracz dopóki ma taką możliwość musi zagrać &(card_parity)
