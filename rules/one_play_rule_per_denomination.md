# META
- id = 4294004678475500
- version = 1
- category = before
- similar rules = 97100930565088
- meta = true

# CODE
```javascript
[club_rule, diamond_rule, heart_rule, spade_rule, nt_rule, club_x_rule, diamond_x_rule, heart_x_rule, spade_x_rule, nt_x_rule, club_xx_rule, diamond_xx_rule, heart_xx_rule, spade_xx_rule, nt_xx_rule] = get_rules(15, 'minor_play')
club_rule_content = club_rule.render()
diamond_rule_content = diamond_rule.render()
heart_rule_content = heart_rule.render()
spade_rule_content = spade_rule.render()
nt_rule_content = nt_rule.render()

club_x_rule_content = club_x_rule.render()
diamond_x_rule_content = diamond_x_rule.render()
heart_x_rule_content = heart_x_rule.render()
spade_x_rule_content = spade_x_rule.render()
nt_x_rule_content = nt_x_rule.render()


club_xx_rule_content = club_xx_rule.render()
diamond_xx_rule_content = diamond_xx_rule.render()
heart_xx_rule_content = heart_xx_rule.render()
spade_xx_rule_content = spade_xx_rule.render()
nt_xx_rule_content = nt_xx_rule.render()
```

# EN 

Depending on the contract denomination and whether it's doubled the following rule will apply in play phase:
<table>
<tr><td></td><td></td><td>X</td><td>XX</td>
<tr>
<td>♣</td>
<td>&(club_rule_content)</td>
<td>&(club_x_rule_content)</td>
<td>&(club_xx_rule_content)</td>
</tr>
<tr>
<td>♦</td>
<td>&(diamond_rule_content)</td>
<td>&(diamond_x_rule_content)</td>
<td>&(diamond_xx_rule_content)</td>
</tr>
<tr>
<td>♥</td>
<td>&(heart_rule_content)</td>
<td>&(heart_x_rule_content)</td>
<td>&(heart_xx_rule_content)</td>
</tr>
<tr>
<td>♠</td>
<td>&(spade_rule_content)</td>
<td>&(spade_x_rule_content)</td>
<td>&(spade_xx_rule_content)</td>
</tr>
<tr>
<td>NT</td>
<td>&(nt_rule_content)</td>
<td>&(nt_x_rule_content)</td>
<td>&(nt_xx_rule_content)</td>
</tr>

</table>
