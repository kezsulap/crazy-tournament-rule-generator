# META
- id = (insert a random number when creating, don't change it throughout the existence of the rule)
- version = 1 (start with 1 and only increment after making a substantive change to the rule, including change to the code which could make it construct different rule with the same seed, keep it the same when fixing typos, claryfing the intent which was the same in the previous version etc.)
- category = (before/after)
- similar rules = 1,10,100 (ids, or remove completely if there are none)
- meta = true #Keep if it's a rule meant to process other rules
- meta_only = true #Keep if it's a rule meant to only be used when processing by meta rules and never used by itself
- no_meta = true #Keep if the rule shouldn't be used as a meta rule

# CODE
```javascript
// insert code here, or remove section if doesn't apply

// Available: functions and constants:
/// random_subset(count, low, high) // returns an array of `count` different sorted integers between low and high (inclusive), raises an error if count > high - low + 1
/// random_int(low, high) // returns a random integer between low and high (inclusive)
/// shuffled_subset(count, low, high) // returns an array of `count` different integers in random order between low and high (inclusive), raises an error if count > high - low + 1
/// balanced_sequence(length, low, high) // returns an array of length `length` with integers between low and high (inclusive) where each element occurs either floor(length / (high - low + 1)) or ceil(length / (high - low + 1)) times
/// random_choice(iterable) // returns a random element from the iterable, raises an error if the iterable is empty
/// random_int_with_cache(tag, low, high) // returns a random integer between low and high (inclusive), tag can be any string,
    // guaranteed to return one of the numbers in the range that was returned the fewest times by other calls with the same tag
    // (including executing the code when rendering the same rule for a different board, including from another META rule)
/// count_previous() // returns how many times this rule has already been rendered
/// function get_previous_for_tag(tag) // returns an array of all values returned by random_int for given tag in all instances of this rule

/// bid_to_str(x) convert bid from number to string (0 = 1♣, 34 = 7NT)
/// LANG_PHRASES(phrase_id) value of variable defined using -DEFINE `phrase_id`
/// CLUB = '♣';
/// DIAMOND = '♦';
/// HEART = '♥';
/// SPADE = '♠';
/// RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
/// PLAYERS = ['N', 'E', 'S', 'W'];
/// SUITS = [CLUB, DIAMOND, HEART, SPADE];
/// DENOMINATIONS = [CLUB, DIAMOND, HEART, SPADE, 'NT']

```

# EN 

- DEFINE `phrase_id` phrase_content, need to define the same phrase in all language versions

Description of rule in English using &(a) syntax for pasting value of variable a set as global in the CODE if applicable

# Other language versions (optional)
