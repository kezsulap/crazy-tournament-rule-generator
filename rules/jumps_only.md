# META
- id = 54847564235923902 
- version = 1 
- category = before
- similar rules = 04752976108786265

# CODE
```
minimum_skipped = random_int(2, 7)

example_1_low = bid_to_str(1)
example_1_high = bid_to_str(1 + minimum_skipped)
example_2_low = bid_to_str(4)
example_2_high = bid_to_str(4 + minimum_skipped)
example_top = bid_to_str(35 - minimum_skipped + 1)

```

# EN 

Except for the first contract every other bid must be higher then the previous one by at least &(minimum_skipped), e.g. after &(example_1_low) the lowest allowed bid is &(example_1_high), after &(example_2_low) it's &(example_2_high),
       after a bid of &(example_top) or higher no other bids can be made, only passes, doubles and redoubles are allowed.
