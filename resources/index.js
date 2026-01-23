function load(url) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false); //TODO: make asynchronous 

	xhr.onload = function () {
			if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200) {
					}
			}
	};

	xhr.send(null);
	if (xhr.status == 404) throw new FileNotFound(url);
	return xhr.responseText;
}


function xhrPromise(url) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = "text";

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(xhr.response);
			} else {
				reject(new Error(`HTTP ${xhr.status}`));
			}
		};

		xhr.onerror = () => reject(new Error("Network error"));
		xhr.send();
	});
}

function fetchAll(urls) {
	const requests = urls.map(xhrPromise);
	return Promise.all(requests);
}


function split_into_sections(raw_markdown) {
	let current_section_name = undefined;
	let current_section_content = [];
	let ret = new Map();
	function add_section(title, content) {
		if (ret.has(title)) {
			throw "Duplicate section " + title;
		}
		ret.set(title, content)
	}
	function process_line(line) {
		//TODO: reduce depth for markdown headers by 1
		return line;
	}
	for (let line of raw_markdown.split('\n')) {
		if (line.trim() == '') {
			if (current_section_name !== undefined)
				current_section_content.push(line);
			continue;
		}
		if (line.substr(0, 2) == '# ') {
			let title = line.substr(2).trim();
			if (current_section_name !== undefined) {
				add_section(current_section_name, current_section_content);
			}
			current_section_name = title;
			current_section_content = [];
		}
		else {
			if (current_section_name === undefined) {
				throw "Nonempty line " + line + " before any header tag";
			}
			current_section_content.push(process_line(line));
		}
	}
	if (current_section_name !== undefined)
		add_section(current_section_name, current_section_content);
	return ret;
}

function extract_args_from_meta(lines) {
	let ret = new Map();
	for (let line of lines) {
		if (!line.trim().length) continue;
		if (line[0] != '-') throw "Expecting lines in META section to begin with -, found: " + line;
		let split = line.split('=')
		if (split.length != 2) throw 'Expecting exactly one = in META line, found: ' + line 
		let key = split[0].substr(1,).trim(); //Remove the leading -
		let value = split[1].trim();
		if (ret.has(key)) throw 'Duplicate key ' + key + ' in META section';
		ret.set(key, value);
	}
	return ret;
}

const variable_regex = /\&\([^)]*\)/;

function splitmix64(x) {
	let mod = BigInt(1) << BigInt(64);
	x = BigInt(x);
	x = (x + BigInt('0x9e3779b97f4a7c15')) % mod;
	x = (x ^ (x >> BigInt(30))) * BigInt('0xbf58476d1ce4e5b9') % mod;
	x = (x ^ (x >> BigInt(27))) * BigInt('0x94d049bb133111eb') % mod;
	return x ^ (x >> BigInt(31));
}

class Random {
	constructor(seed) {
		this.value = seed;
	}
	_advance_state() {
		this.value = splitmix64(this.value)
	}
	random_int(low, high) {
		this._advance_state();
		let ret = this.value;
		if (low > high) throw "Can't pick from [" + low + ", " + high + "] as low > high";
		return Number(BigInt(low) + BigInt(ret) % (BigInt(high) - BigInt(low) + BigInt(1)));
	}
	random_subset(count, low, high) {
		if (count > (high - low + 1)) throw "Can't pick " + count + " elements from range [" + low + ", " + high + "]";
		let ret = new Set();
		while (ret.size < count) ret.add(this.random_int(low, high));
		let array_ret = Array.from(ret);
		array_ret.sort((x, y) => x - y);
		return array_ret;
	}
	random_order(iterable) {
		let arr = Array.from(iterable);
		let n = arr.length;
		for (let i = 1; i < n; ++i) {
			let j = this.random_int(0, i);
			if (i != j) {
				let temp = arr[i];
				arr[i] = arr[j];
				arr[j] = temp;
			}
		}
		return arr;
	}
	shuffled_subset(count, low, high) {
		return this.random_order(this.random_subset(count, low, high));
	}
	balanced_sequence(length, low, high) {
		let ret = [];
		let subset_size = (high - low) + 1;
		let full = Math.floor(length / subset_size);
		let rest = length % subset_size;
		for (let i = low; i <= high; ++i) for (let j = 0; j < full; ++j) ret.push(i);
		let rest_subset = this.random_subset(rest, low, high);
		for (let x of rest_subset) ret.push(x);
		return this.random_order(ret);
	}
	random_choice(iterable) {
		let array = Array.from(iterable);
		if (array.length == 0) throw "Can't choose from an empty container";
		return array[this.random_int(0, array.length - 1)];
	}
}

class RandomWithCache {
	constructor() {
		this.cache = new Map();
		this.previous = 0;
	}
	_get_cached(tag) {
		if (this.cache.has(tag)) return this.cache.get(tag);
		let new_list = [];
		this.cache.set(tag, new_list);
		return new_list;
	}
	random_int(tag, low, high, rng) {
		let this_list = this._get_cached(tag);
		let range_length = high - low + 1;
		if (this_list.length >= range_length) {
			let count = new Array(range_length).fill(0);
			for (let a of this_list)
				if (a >= low && a <= high)
					count[a - low]++;
			let lowest = Math.min(...count);
			let candidates = [];
			for (let i = 0; i < range_length; ++i)
				if (count[i] == lowest)
					candidates.push(i + low);
			let x = rng.random_choice(candidates);
			this_list.push(x);
			return x;
		}
		else {
			while (true) {
				let x = rng.random_int(low, high);
				if (!this_list.includes(x)) {
					this_list.push(x);
					return x;
				}
			}
		}
	}
	mark_completed() {
		this.previous++;
	}
};

function object_to_map(x) {
	function* entries(obj) {
		for (let key in obj)
				yield [key, obj[key]];
	}
	const map = new Map(entries(x));
	return map;
}

function getVariablesFromCode(jsCode, context = {}) {
	const vars = { ...context }; // start with predefined constants/functions

	const proxy = new Proxy(vars, {
		has: () => true, // make 'with' not throw
		set(target, prop, value) {
			target[prop] = value; // all new variables go here
			return true;
		},
		get(target, prop) {
			return target[prop];
		}
	});

	const wrappedCode = `with(proxy) { ${jsCode} }`;

	new Function('proxy', wrappedCode)(proxy);

	return object_to_map(vars);
}

function splitWithMatches(str, regex) {
		const parts = [];
		let lastIndex = 0;

		// Ensure regex has the global flag
		const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');

		for (const match of str.matchAll(re)) {
				const index = match.index;
				// Part before the match (possibly empty)
				parts.push(str.slice(lastIndex, index));
				// The match itself
				parts.push(match[0]);
				lastIndex = index + match[0].length;
		}

		// Part after the last match (possibly empty)
		parts.push(str.slice(lastIndex));
		return parts;
}


class language_version {
	constructor(content, lang_strings) {
		this.content = content;
		this.lang_strings = lang_strings;
	}
};


function vulnerability(i) {
	return ['None', 'NS', 'EW', 'All'][((i - 1) + ((i - 1) >> 2)) & 3];
}

function NS_vulnerable(i) {
	let vul = vulnerability(i);
	return vul == 'NS' || vul == 'All';
}

function EW_vulnerable(i) {
	let vul = vulnerability(i);
	return vul == 'EW' || vul == 'All';
}

function dealer(i) {
	return ['W', 'N', 'E', 'S'][i & 3];
}

function dealer_vulnerable(i) {
	if (dealer(i) == 'E' || dealer(i) == 'W') return EW_vulnerable(i);
	return NS_vulnerable(i);
}

function dealers_opps_vulnerable(i) {
	if (dealer(i) == 'E' || dealer(i) == 'W') return NS_vulnerable(i);
	return EW_vulnerable(i);
}

function dealer_vulnerability(i) {
	if (dealer_vulnerable(i)) {
		if (dealers_opps_vulnerable(i)) return 'All';
		return 'Unfavourable';
	}
	else {
		if (dealers_opps_vulnerable(i)) return 'Favourable';
		return 'None';
	}
}

class rule {
	constructor(raw_markdown) {
		let sections = split_into_sections(raw_markdown);
		if (!sections.has('META')) {
			throw "Missing required section 'META'";
		}
		let meta_args = extract_args_from_meta(sections.get('META'));
		if (meta_args.has('id')) this.id = meta_args.get('id');
		else throw 'missing id in keyword section';
		if (meta_args.has('version')) this.version = meta_args.get('version');
		else throw 'missing version in keyword section';
		if (meta_args.has('category')) {
			this.category = meta_args.get('category');
			if (this.category != 'before' && this.category != 'after') {
				throw 'Expected category to be either before or after, got ' + this.category;
			}
		} else throw 'missing category in keyword section';
		if (meta_args.has('similar rules')) this.similar_rules = meta_args.get('similar rules').split(',').map((x) => x.trim());
		else this.similar_rules = [];
		if (meta_args.has('special_dealing')) {
			let value = meta_args.get('special_dealing');
			if (value == 'true') this.special_dealing = true;
			else if (value == 'false') this.special_dealing = false;
			else throw 'Expected special_dealing to be either \'true\' or \'false\', got :' + value;
		}
		else this.special_dealing = false;
		let POSSIBLE_VULNERABILITY = ['all', 'unfavourable', 'favourable', 'none'];
		this.vulnerability = new Set();
		if (meta_args.has('vulnerability')) {
			for (let x of meta_args.get('vulnerability').split(',')) {
				x = x.trim();
				if (!POSSIBLE_VULNERABILITY.includes(x.toLowerCase())) {
					throw 'Expected one of: ' + POSSIBLE_VULNERABILITY + ' as vulnerability, got: ' + x + ' (vulnerability is given from dealer\'s perspective)';
				}
				x = x.toLowerCase();
				if (this.vulnerability.has(x)) {
					throw 'Duplicated vulnerability: ' + x;
				}
				this.vulnerability.add(x);
			}
		}
		else {
			for (let x of POSSIBLE_VULNERABILITY) this.vulnerability.add(x);
		}
		if (meta_args.has('tags')) {
			let tags_str = meta_args.get('tags').split(',');
			for (let i = 0; i < tags_str.length; ++i) {
				tags_str[i] = tags_str[i].trim();
			}
			this.tags = new Set();
			for (let x of tags_str) this.tags.add(x);
		}
		else {
			this.tags = new Set();
		}
		if (meta_args.has('meta')) {
			let value = meta_args.get('meta');
			if (value == 'true') this.meta = true;
			else if (value == 'false') this.meta = false;
			else throw 'Expected meta to be either \'true\' or \'false\', got :' + value;
		}
		else this.meta = false;
		if (meta_args.has('meta_only')) {
			let value = meta_args.get('meta_only');
			if (value == 'true') this.meta_only = true;
			else if (value == 'false') this.meta_only = false;
			else throw 'Expected meta_only to be either \'true\' or \'false\', got :' + value;
		}
		else this.meta_only = false;
		if (meta_args.has('no_meta')) {
			let value = meta_args.get('no_meta');
			if (value == 'true') this.no_meta = true;
			else if (value == 'false') this.no_meta = false;
			else throw 'Expected no_meta to be either \'true\' or \'false\', got :' + value;
		}
		else this.no_meta = false;
		if (this.no_meta + this.meta + this.meta_only > 1) throw 'Can specify at most one of no_meta, meta and meta_only to be true';
		for (const [key, _] of meta_args)
			if (!['id', 'version', 'category', 'similar rules', 'special_dealing', 'vulnerability', 'tags', 'meta', 'meta_only', 'no_meta'].includes(key))
				throw 'Unknown key ' + key + ' in META section';
		this.code = undefined;
		if (sections.has('CODE')) {
			let section_content = sections.get('CODE');
			let code_content = [];
			for (let x of section_content) //TODO: do something more resistant to invalid CODE section
				if (!x.trim().startsWith('```'))
					code_content.push(x);
			this.code = code_content.join('\n');
		}
		this.lang = new Map();
		let previous_lang_dict = undefined;
		let previous_lang_name = undefined;
		for (let [section_name, section_content] of sections) if (section_name != 'META' && section_name != 'CODE') {
			if (this.lang.has(section_name)) throw 'Duplicate section for language ' + section_name;
			let section_raw_content = [];
			let defined_phrases = new Map();
			for (let line of section_content) {
				if (/^- DEFINE `.+`/.test(line)) {
					let segments = line.split('`');
					let variable_name = segments[1];
					let variable_expansion = segments[2];
					if (defined_phrases.has(variable_name)) {
						throw 'Duplicate phrase definition for ' + variable_name + ' in language ' + section_name;
					}
					defined_phrases.set(variable_name, variable_expansion);
				}
				else {
					section_raw_content.push(line);
				}
			}
			let lang_content = section_raw_content.join('\n');
			this.lang.set(section_name, new language_version(lang_content, defined_phrases));
			if (this.code === undefined && variable_regex.test(lang_content)) {
				throw 'Found a variable in lang ' + section_name + ' while no CODE section'
			}
			if (previous_lang_dict !== undefined) {
				for (let x of defined_phrases.keys()) {
					if (!previous_lang_dict.has(x)) {
						throw 'Phrase ' + x + ' defined for language ' + section_name + ', but not for ' + previous_lang_name;
					}
				}
				for (let x of previous_lang_dict.keys()) {
					if (!defined_phrases.has(x)) {
						throw 'Phrase ' + x + ' defined for language ' + previous_lang_name + ', but not for ' + section_name;
					}
				}
			}
			else {
				previous_lang_dict = defined_phrases;
				previous_lang_name = section_name;
			}
		}
		this.random_cache = new RandomWithCache();
	}
	render(seed, language, meta_rule_searcher) {
		let content = undefined;
		for (let lang_tried of [language, 'EN']) {
			if (this.lang.has(lang_tried)) {
				content = this.lang.get(lang_tried);
				break;
			}
		}
		if (content === undefined) {
			for (let [lang, this_content] of this.lang) {
				content = this_content.content;
				break;
			}
		}
		if (this.code !== undefined) {
			let rng = new Random(seed);
			let random_cache = this.random_cache;
			let is_meta = this.meta;
			function random_subset(count, low, high) { //TODO: handle more errors
				return rng.random_subset(count, low, high);
			}
			function random_int(low, high) {
				return rng.random_int(low, high);
			}
			function shuffled_subset(count, low, high) {
				return rng.shuffled_subset(count, low, high);
			}
			function random_order(iterable) {
				return rng.random_order(iterable);
			}
			function balanced_sequence(length, low, high) {
				return rng.balanced_sequence(length, low, high);
			}
			function random_choice(iterable) {
				return rng.random_choice(iterable);
			}
			function random_int_with_cache(tag, low, high) {
				return random_cache.random_int(tag, low, high, rng);
			}
			function count_previous() {
				return random_cache.previous;
			}
			function get_previous_for_tag(tag) {
				return random_cache._get_cached(tag);
			}
			function bid_to_str(x) {
				return (1 + Math.floor((x - 1) / 5)) + '' + DENOMINATIONS[(x - 1) % 5];
			}
			function LANG_PHRASES(phrase_id) {
				return content.lang_strings.get(phrase_id);
			}
			function get_rules(count, tags) {
				if (!is_meta) throw 'get_rules only available from a meta rule';
				return meta_rule_searcher.get_rules(count, tags);
			}
			let CLUB = '♣';
			let DIAMOND = '♦';
			let HEART = '♥';
			let SPADE = '♠';
			let RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
			let PLAYERS = ['N', 'E', 'S', 'W'];
			let SUITS = [CLUB, DIAMOND, HEART, SPADE];
			let DENOMINATIONS = [CLUB, DIAMOND, HEART, SPADE, 'NT']
			let variables = getVariablesFromCode(this.code, {random_subset, random_int, shuffled_subset, random_order, balanced_sequence, random_choice, random_int_with_cache, count_previous, get_previous_for_tag, bid_to_str, CLUB, DIAMOND, HEART, SPADE, RANKS, PLAYERS, SUITS, DENOMINATIONS, LANG_PHRASES, Math, get_rules});
			this.random_cache.mark_completed();
			let split = splitWithMatches(content.content, variable_regex);
			for (let i = 1; i < split.length; i += 2) { //Alternates between nonmatched part and variable match
				let variable_name = split[i].substr(2, split[i].length - 3).trim();
				if (!variables.has(variable_name)) {
					throw 'Unset variable + ' + variable_name;
				}
				split[i] = variables.get(variable_name);
			}
			return split.join('');
		}
		return content.content;
	}
	is_similar(other_rule) {
		return this.similar_rules.includes(other_rule.id) || other_rule.similar_rules.includes(this.id);
	}
	reset_cache() {
		this.random_cache = new RandomWithCache();
	}
};

class rule_with_seed_and_language_wrapper {
	constructor(rule, seed, language) {
		this.rule = rule;
		this.seed = seed;
		this.language = language;
	}
	render() {
		let ret = this.rule.render(this.seed, this.language);
		this.seed++;
		return ret;
	}
};

class meta_rule_searcher {
	constructor(rules, rng, language) {
		this.rules = rules;
		this.rng = rng;
		this.language = language;
		this.history = [];
	}
	get_rules(count, tags_str) { //whitespace separated
		let tags = tags_str.split(',');
		for (let i = 0; i < tags.length; ++i) tags[i] = tags[i].trim(); //TODO: ANY tag mode
		let matching = [];
		function matches_tag(tag, rule) {
			if (tag[0] == '-') return !rule.tags.has(tag.slice(1));
			return rule.tags.has(tag);
		}
		function matches(rule) {
			if (rule.no_meta) return false;
			for (let tag of tags) if (!matches_tag(tag, rule)) return false;
			return true;
		}
		for (let rule of rules) {
			if (matches(rule))
				matching.push(rule);
		}
		if (matching.length == 0) throw `No rules matching selector ${tags_str} found`
		let indices = this.rng.balanced_sequence(count, 0, matching.length - 1);
		let ret = [];
		for (let i of indices) {
			let this_seed = this.rng.random_int(0, BigInt("1000000000000"));
			this.history.push([matching[i].id, matching[i].version, this_seed]);
			ret.push(new rule_with_seed_and_language_wrapper(matching[i], this_seed, this.language));
		}
		return ret;
	}
	get_history() {
		return this.history;
	}
}

class predefined_rule_searcher {
	constructor(rules, order, lang) {
		this.rules = rules;
		this.order = order;
		this.lang = lang;
		this.index = 0;
	}
	find_rule(id, version) {
		for (let rule of this.rules) if (rule.id == id && rule.version == version) return rule;
		throw `No rule with id ${id} and version ${version} found`;
	}
	get_rules(count, __tags) { //Process the same rules regardless of tags, updating tags doesn't count as different rule version
		let ret = [];
		if (this.index + count > this.order.length) throw `Try to get ${count} more rules (for ${this.index + count} total) while there were only ${this.order.length} expected`;
		for (let _ = 0; _ < count; ++_) {
			let [id, version, seed] = this.order[this.index++];
			ret.push(new rule_with_seed_and_language_wrapper(this.find_rule(id, version), seed, this.language));
		}
		return ret;
	}
}


function parse_suits(s) {
	let suit_with_cards = /(♣|♦|♥|♠|!c|!d|!h|!s){[AKQJT98765432]+}/;
	let raw_suit_regex = /♣|♦|♥|♠|!c|!d|!h|!s/;
	let split = splitWithMatches(s, suit_with_cards);
	function replace_exclam_with_suit_symbol(s) {
		return s.replace('!c', '♣').replace('!d', '♦').replace('!h', '♥').replace('!s', '♠');
	}
	function wrap_with_span(s) {
		if (s.search('♣') != -1) return '<span class="club">' + s + '</span>';
		if (s.search('♦') != -1) return '<span class="diamond">' + s + '</span>';
		if (s.search('♥') != -1) return '<span class="heart">' + s + '</span>';
		if (s.search('♠') != -1) return '<span class="spade">' + s + '</span>';
		return s;
	}
	for (let i = 1; i < split.length; i += 2) {
		split[i] = wrap_with_span(replace_exclam_with_suit_symbol(split[i].replace('{', '').replace('}', '')));
	}
	for (let i = 0; i < split.length; i += 2) {
		let subsplit = splitWithMatches(split[i], raw_suit_regex);
		for (let j = 1; j < subsplit.length; j += 2)
			subsplit[j] = wrap_with_span(subsplit[j]);
		split[i] = subsplit.join('');
	}
	return split.join('');
}

function flip_rule_visible(event) {
	let node = event.currentTarget;
	let target_node = node.parentElement.children[1];
	if (target_node.style.display == '') target_node.style.display = 'none';
	else target_node.style.display = '';
}

function reveal_all() {
	for (let x of document.querySelectorAll('.rule_content'))
		x.style.display = '';
}
function hide_all() {
	for (let x of document.querySelectorAll('.rule_content'))
		x.style.display = 'none';
}

function compareLex(a, b) {
	const len = Math.min(a.length, b.length);

	for (let i = 0; i < len; i++) {
		if (a[i] < b[i]) return -1;
		if (a[i] > b[i]) return 1;
	}

	// All elements equal so far → shorter array is smaller
	if (a.length < b.length) return -1;
	if (a.length > b.length) return 1;
	return 0;
}


function select_rules(rules, rng, count) {
	let N = rules.length;
	let used_before = 0, used_after = 0;
	let used_count = new Array(N).fill(0);
	let similar = new Array(N);
	let id_to_index = new Map();
	for (let i = 0; i < N; ++i) id_to_index.set(rules[i].id, i);
	for (let i = 0; i < N; ++i) similar[i] = new Set();
	for (let i = 0; i < N; ++i) {
		for (let oth_index of rules[i].similar_rules) {
			if (id_to_index.has(oth_index)) {
				similar[i].add(id_to_index.get(oth_index));
				similar[id_to_index.get(oth_index)].add(i);
			}
		}
	}
	let ids = [];
	for (let _ = 0; _ < count; ++_) {
		let best_score = undefined;
		let best_ids = [];
		for (let i = 0; i < N; ++i) {
			if (rules[i].meta_only) continue;
			let similar_count = 0;
			for (let j of similar[i]) similar_count += used_count[j];
			let this_score = [used_count[i], similar_count, (rules[i].category == 'before' ? used_before : used_after)]; //TODO: Somehow exclude from using too much "special dealing" tag?
			if (best_score == undefined) {
				best_score = this_score;
				best_ids.push(i);
			}
			else {
				let compare = compareLex(best_score, this_score);
				if (compare == 1) {
					best_score = this_score;
					best_ids = [i];
				}
				else if (compare == 0) {
					best_ids.push(i);
				}
			}
		}
		console.log(_ + 1, best_score, best_ids);
		let chosen = rng.random_choice(best_ids);
		ids.push(chosen);
		used_count[chosen]++;
		if (rules[chosen].category == 'before') used_before++;
		else used_after++;
	}
	return rng.random_order(ids);
}

function decode_rules(rules_content) {
	let decoded = base64DecodeUtf8(rules_content);
	let split = decoded.split(';');
	for (let i = 0; i < split.length; ++i) {
		split[i] = split[i].split(',');
	}
	return split;
}

function process_and_store_rules_globally() {
	if (hardcoded === undefined) throw 'process_and_store_rules_globally can only be called when hardcoded !== undefined';
	rules = []; //Intentionally stored as global
	for (let [filename, raw_rule_markdown] of hardcoded) {
		try {
			rules.push(new rule(raw_rule_markdown))
		}
		catch (e) {
			document.querySelector('h1').innerText = 'Error when parsing filename: ' + filename + ": " + e;
			throw e;
		}
	}
}

function render(count, seed, lang) {
	if (hardcoded === undefined) return;
	let rules_div = document.querySelector('#rules');
	let menu_div = document.querySelector('#rules_menu');
	let rng = new Random(seed);
	process_and_store_rules_globally();
	let ids = select_rules(rules, rng, count);
	let generation_log = [1]; //Starting board
	for (let i = 0; i < count; ++i) {
		try {
			let seed = rng.random_int(0, BigInt("1000000000000"));
			let this_meta_rule_searcher = undefined;
			if (rules[ids[i]].meta) this_meta_rule_searcher = new meta_rule_searcher(rules, new Random(rng.random_int(0, BigInt("1000000000000"))));
			let content = rules[ids[i]].render(seed, lang, this_meta_rule_searcher);
			generation_log.push([i, rules[ids[i]].id, rules[ids[i]].version, seed].concat(this_meta_rule_searcher === undefined ? [] : this_meta_rule_searcher.get_history()).join(","));
			let content_node = document.createElement('div');
			let board_id = document.createElement('div');
			board_id.classList.add('board_id');
			board_id.classList.add(rules[ids[i]].category);
			board_id.innerHTML = 'Board ' + (i + 1) + ' (' + rules[ids[i]].category + (rules[ids[i]].special_dealing ? ', requires dealing the cards in a special way' : '') + ')';
			board_id.addEventListener('click', flip_rule_visible);
			let rule_content = document.createElement('div');
			rule_content.classList.add('rule_content');
			rule_content.innerHTML = parse_suits(marked.parse(content));
			rule_content.style.display = 'none';
			content_node.appendChild(board_id);
			content_node.appendChild(rule_content);
			rules_div.appendChild(content_node);
		}
		catch (e) {
			document.querySelector('h1').innerText = 'Error when rule number ' + i + ": " + e;
			throw e;
		}
	}
	let serialised = generation_log.join(';');
	const rules_url = window.location.origin + window.location.pathname + '?chosen_rules=' + base64EncodeUtf8(serialised);
	document.querySelector('a#rules_url').setAttribute('href', rules_url);
	console.log(serialised);
	menu_div.style.display = '';
}

function base64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace('+', '-').replace('/', '_').replace('=', '.');
}

function base64DecodeUtf8(base64) {
	const nonescaped = base64.replace('-', '+').replace('_', '/').replace('.', '=');
  const binary = atob(nonescaped);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function put_content(contents, captions, categories) {
	let rules_div = document.querySelector('#rules');
	let menu_div = document.querySelector('#rules_menu');
	for (let i = 0; i < contents.length; ++i) {
		let content_node = document.createElement('div');
		let board_id = document.createElement('div');
		board_id.classList.add('board_id');
		board_id.classList.add(categories[i]);
		board_id.innerHTML = captions[i];
		board_id.addEventListener('click', flip_rule_visible);
		let rule_content = document.createElement('div');
		rule_content.classList.add('rule_content');
		rule_content.innerHTML = parse_suits(marked.parse(contents[i]));
		rule_content.style.display = 'none';
		content_node.appendChild(board_id);
		content_node.appendChild(rule_content);
		rules_div.appendChild(content_node);
	}
	menu_div.style.display = '';
}

function extract_rules_ids_and_versions() {
	let params = new URLSearchParams(document.location.search);
	let chosen_rules = params.get('chosen_rules');
	if (chosen_rules === null) return undefined;
	let decoded_rules = decode_rules(chosen_rules);
	let rules_config = decoded_rules.slice(1);
	let ret = [];
	for (let rule_config of rules_config) {
		for (let j = 1; j < rule_config.length; j += 3) {
			let [rule_id, rule_version, _seed] = rule_config.slice(j, j + 3);
			ret.push([rule_id, rule_version])
		}
	}
	return ret;
}

function decode_and_display(encoded_rules) { //TODO: some more error handling of invalid urls
	document.querySelector('#menu').style.display = 'none';
	process_and_store_rules_globally();
	let decoded_rules = decode_rules(encoded_rules);
	let start_board = Number(decoded_rules[0]);
	let rules_config = decoded_rules.slice(1);
	let N = rules_config.length;
	let content = new Array(N);
	let caption = new Array(N);
	let category = new Array(N);
	
	let lang = 'EN';

	for (let rule_config of rules_config) {
		let [i, rule_id, rule_version, seed] = rule_config.slice(0, 4);
		let meta_rule_config = rule_config.slice(4);
		let order = [];
		for (let j = 0; j < meta_rule_config.length; j += 3) {
			order.push(meta_rule_config.slice(j, j + 3));
		}
		let this_predefined_rule_searcher = new predefined_rule_searcher(rules, order, lang);
		i = Number(i);
		let found_rule = undefined;
		for (let rule of rules) {
			if (rule.id === rule_id && rule.version === rule_version) {
				found_rule = rule;
				break;
			}
		}
		if (found_rule === undefined) {
			throw 'Rule ' + rule_id + ' with version ' + rule_version + ' not found';
		}
		content[i] = found_rule.render(seed, lang, this_predefined_rule_searcher);
		caption[i] = 'Board ' + (i + start_board) + ' (' + found_rule.category + (found_rule.special_dealing ? ', requires dealing the cards in a special way' : '') + ')';
		category[i] = found_rule.category;
	}
	put_content(content, caption, category);
	document.querySelector('a#rules_url').setAttribute('href', window.location.href);
}


function handleSubmit() {
	document.querySelector('#menu').style.display = 'none';
	render(document.querySelector('#number_of_boards').value, document.querySelector('#seed').value, document.querySelector('#lang').value);
}

function init() {
	window.addEventListener('load', async function() {
		document.querySelector('#seed').value = Math.floor(Math.random() * 1000000000);
		if (hardcoded === undefined) {
			let all_found = load('https://raw.githubusercontent.com/kezsulap/crazy-tournament-rule-generator/refs/heads/rules/rules/list_all.txt');
			let file_names = [], file_urls = [];
			let chosen_rules_ids_and_versions = extract_rules_ids_and_versions();
			for (let file_line of all_found.split('\n')) {
				let [filename, this_rule_id, this_rule_version, this_rule_commit] = file_line.split(' ');
				let proceed = undefined;
				if (chosen_rules_ids_and_versions === undefined) proceed = this_rule_commit === undefined;
				else {
					for (let [rule_id, rule_version] of chosen_rules_ids_and_versions) {
						if (rule_id == this_rule_id && rule_version == this_rule_version) {
							proceed = true;
							break;
						}
					}
				}
				if (proceed) {
					file = filename.trim();
					if (file.length) {
						file_urls.push('https://raw.githubusercontent.com/kezsulap/crazy-tournament-rule-generator/refs/heads/' + (this_rule_commit === undefined ? 'rules' : this_rule_commit) + '/rules/' + file);
						file_names.push(file);
					}
				}
			}
			let content = await fetchAll(file_urls);
			hardcoded = [];
			for (let i = 0; i < file_names.length; ++i)
				hardcoded.push([file_names[i], content[i]]);
		}
		let params = new URLSearchParams(document.location.search);
		let chosen_rules = params.get('chosen_rules');
		if (chosen_rules !== null) {
			decode_and_display(chosen_rules);
		}
	})
}
init();
