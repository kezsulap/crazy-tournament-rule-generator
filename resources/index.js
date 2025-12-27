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
		return array[this.random_int(0, array.length - 1)];
	}
}

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
		for (const [key, _] of meta_args)
			if (!['id', 'version', 'category', 'similar rules', 'special_dealing'].includes(key))
				throw 'Unknown key ' + key + ' in META section';
		this.code = undefined;
		if (sections.has('CODE')) {
			let section_content = sections.get('CODE');
			let code_content = [];
			for (let x of section_content) //TODO: do something more resistant to invalid CODE section
				if (x.trim() != '```')
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
	}
	render(seed, language) {
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
			function bid_to_str(x) {
				return (1 + Math.floor((x - 1) / 5)) + '' + DENOMINATIONS[(x - 1) % 5];
			}
			function LANG_PHRASES(phrase_id) {
				return content.lang_strings.get(phrase_id);
			}
			let CLUB = '♣';
			let DIAMOND = '♦';
			let HEART = '♥';
			let SPADE = '♠';
			let RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
			let PLAYERS = ['N', 'E', 'S', 'W'];
			let SUITS = [CLUB, DIAMOND, HEART, SPADE];
			let DENOMINATIONS = [CLUB, DIAMOND, HEART, SPADE, 'NT']
			let variables = getVariablesFromCode(this.code, {random_subset, random_int, shuffled_subset, random_order, balanced_sequence, random_choice, bid_to_str, CLUB, DIAMOND, HEART, SPADE, RANKS, PLAYERS, SUITS, DENOMINATIONS, LANG_PHRASES, Math});
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
};

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

function render(count, seed, lang) {
	if (hardcoded === undefined) return;
	let rules_div = document.querySelector('#rules');
	let menu_div = document.querySelector('#rules_menu');
	let rules = [];
	for (let [filename, raw_rule_markdown] of hardcoded) {
		try {
			rules.push(new rule(raw_rule_markdown))
		}
		catch (e) {
			document.querySelector('h1').innerText = 'Error when parsing filename: ' + filename + ": " + e;
			throw e;
		}
	}
	let rng = new Random(seed);
	let ids = rng.balanced_sequence(count, 0, rules.length - 1);
	for (let i = 0; i < count; ++i) {
		try {
			let content = rules[ids[i]].render(rng.random_int(0, BigInt("1000000000000")), lang);
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
	menu_div.style.display = '';
}

function handleSubmit() {
	document.querySelector('#menu').style.display = 'none';
	render(document.querySelector('#number_of_boards').value, document.querySelector('#seed').value, document.querySelector('#lang').value);
}

function init() {
	window.addEventListener('load', async function() {
		if (hardcoded === undefined) {
			let all_found = load('https://raw.githubusercontent.com/kezsulap/crazy-tournament-rule-generator/refs/heads/rules/rules/list_all.txt');
			let file_names = [], file_urls = [];
			for (let file of all_found.split('\n')) {
				file = file.trim();
				if (file.length) {
					file_urls.push('https://raw.githubusercontent.com/kezsulap/crazy-tournament-rule-generator/refs/heads/rules/rules/' + file);
					file_names.push(file);
				}
			}
			let content = await fetchAll(file_urls);
			hardcoded = [];
			for (let i = 0; i < file_names.length; ++i)
				hardcoded.push([file_names[i], content[i]]);
		}
	})
}
init();
