# META
- id = 70079499385144
- version = 2 
- category = before

# CODE
```javascript
passes_count = random_int_with_cache('passes_count', 5, 8);
[a, b, c, d, e] = random_order([LANG_PHRASES('next_player_must_pass'), LANG_PHRASES('bidding_continues_as_normal'), LANG_PHRASES('one_pass_used_up_by_bid'), LANG_PHRASES('bidding_order_reverses'), LANG_PHRASES('bidding_hops_over')])

```

# EN 

- DEFINE `next_player_must_pass` the next player must pass (if they were already forced to pass by their partner doubling earlier on this pass counts too and on their next turn they can bid normally)
- DEFINE `bidding_continues_as_normal` the bidding continues as usual
- DEFINE `one_pass_used_up_by_bid` the bidding proceeds as usual, but there's one fewer pass to use
- DEFINE `bidding_order_reverses` bidding order reverses from clockwise to counter-clockwise (or from counter-clockwise back to clockwise
- DEFINE `bidding_hops_over` bidding turn skips the next player

During the bidding after every bid in:
- ♣: &(a)
- ♦: &(b)
- ♥: &(c)
- ♠: &(d)
- NT: &(e)


The bidding ends after there were &(passes_count) passes in total


# PL

- DEFINE `next_player_must_pass` następny gracz musi spasować (jeśli zawodnik był i tak zmuszony do spasowania wcześniejszą kontrą partnera to ten pas też się liczy i przy następnej okazji może zalicytować cokolwiek)
- DEFINE `bidding_continues_as_normal` licytacja biegnie normalnie
- DEFINE `one_pass_used_up_by_bid` licytacja biegnie normalnie, ale do wykorzystania jest jeden pas mniej
- DEFINE `bidding_order_reverses` licytacja zmienia kierunek na przeciwny ze zgodnego na przeciwny do ruchu wskazówek zegara (lub z przeciwnego z powrotem na zgodny)
- DEFINE `bidding_hops_over` licytacja omija następnego gracza

Po każdej odzywce w:
- ♣: &(a)
- ♦: &(b)
- ♥: &(c)
- ♠: &(d)
- NT: &(e)


Licytacja kończy się kiedy padnie łącznie &(passes_count) pasów
