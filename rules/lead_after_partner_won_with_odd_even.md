# META
- id = 14943957936700715 
- version = 1
- category = after
- similar rules = 1275320882719

# CODE
```javascript
if (random_int(0, 1)) {
    me_continue = LANG_PHRASES('odd');
    partner_continue = LANG_PHRASES('even')
}
else {
    me_continue = LANG_PHRASES('even');
    partner_continue = LANG_PHRASES('odd')
}
```

# EN 

- DEFINE `odd` odd-ranked
- DEFINE `even` even-ranked

On trick one the player on lead is the same as under ordinary rules, on every subsequent trick if the previous trick was won with an &(me_continue) the player who won that trick leads to the next trick, if with an &(partner_continue) their partner does.

# PL

- DEFINE `odd` nieparzystą
- DEFINE `even` parzystą
W pierwszej lewie wychodzi ten sam gracz, co wg standardowych zasad, w każdej kolejnej jeśli poprzednia lewa została wzięta kartą &(me_continue) wychodzi gracz, który ją wziął, jeśli &(partner_continue) wychodzi jego partner.
