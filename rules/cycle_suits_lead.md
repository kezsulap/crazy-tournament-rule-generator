# META
- id = 26839290439050518 
- version = 1
- category = after

# CODE
```
suit_id = random_int(0, 3);
first_suit = SUITS[suit_id];
second_suit = SUITS[(suit_id + 1) % 4];
third_suit = SUITS[(suit_id + 2) % 4];
fourth_suit = SUITS[(suit_id + 3) % 4];
```

# EN 

On the first trick a player is required to lead a &(first_suit), on the second &(second_suit), on the third &(third_suit), on the fourth &(fourth_suit) etc. leading a suit 1 higher ranked then the suit lead on the previous trick (♣s after a ♠)
If a player has no cards of the suit they're supposed to lead, they can lead any other card which begins the new cycle.
