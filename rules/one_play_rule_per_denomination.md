# META
- id = 97100930565088 
- version = 1
- category = before
- similar rules = 4294004678475500
- meta = true

# CODE
```javascript
[club_rule, diamond_rule, heart_rule, spade_rule, nt_rule] = get_rules(5, 'minor_play')
club_rule_content = club_rule.render()
diamond_rule_content = diamond_rule.render()
heart_rule_content = heart_rule.render()
spade_rule_content = spade_rule.render()
nt_rule_content = nt_rule.render()

```

# EN 

Depending on the contract denomination the following rule will apply in play phase:
<table>
<tr><td>♣</td><td>&(club_rule_content)</td></tr>
<tr><td>♦</td><td>&(diamond_rule_content)</td></tr>
<tr><td>♥</td><td>&(heart_rule_content)</td></tr>
<tr><td>♠</td><td>&(spade_rule_content)</td></tr>
<tr><td>NT</td><td>&(nt_rule_content)</td></tr>

</table>
# PL 

Zależnie od miana kontraktu następująca regułka obowiązuje w trakcie rozgrywki:
<table>
<tr><td>♣</td><td>&(club_rule_content)</td></tr>
<tr><td>♦</td><td>&(diamond_rule_content)</td></tr>
<tr><td>♥</td><td>&(heart_rule_content)</td></tr>
<tr><td>♠</td><td>&(spade_rule_content)</td></tr>
<tr><td>NT</td><td>&(nt_rule_content)</td></tr>

</table>
