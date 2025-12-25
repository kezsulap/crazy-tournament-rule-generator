# META
- id = 04752976108786265 
- version = 1 
- category = before
- similar rules = 54847564235923902


# CODE
```
maximum_skipped = random_int(4, 7)

highest_start = bid_to_str(maximum_skipped)
example_1_low = bid_to_str(1);
example_1_high = bid_to_str(1 + maximum_skipped);
example_2_low = bid_to_str(4);
example_2_high = bid_to_str(4 + maximum_skipped);
example_top = bid_to_str(35 - maximum_skipped);
```

# EN 

The first bid contract can be at most &(highest_start), every other can be at most &(maximum_skipped) higher then the previous one
e.g. after &(example_1_low) the highest allowed bid is &(example_1_high), after &(example_2_low) it's &(example_2_high),
       after a bid of &(example_top) or higher all bids up to 7NT are allowed.
