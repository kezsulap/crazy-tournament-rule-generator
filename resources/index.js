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
		if (line.trim() == '') continue;
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
		for (const [key, _] of meta_args)
			if (!['id', 'version', 'category', 'similar rules'].includes(key))
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
		for (let [section_name, section_content] of sections) if (section_name != 'META' && section_name != 'CODE') {
			if (this.lang.has(section_name)) throw 'Duplicate section for language ' + section_name;
			let lang_content = section_content.join('\n');
			this.lang.set(section_name, lang_content);
			if (this.code === undefined && variable_regex.test(lang_content)) {
				throw 'Found a variable in lang ' + section_name + ' while no CODE section'
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
				content = this_content;
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
			let CLUB = '♣';
			let DIAMOND = '♦';
			let HEART = '♥';
			let SPADE = '♠';
			let variables = getVariablesFromCode(this.code, {random_subset, random_int, shuffled_subset, random_order, CLUB, DIAMOND, HEART, SPADE});
			let split = splitWithMatches(content, variable_regex);
			for (let i = 1; i < split.length; i += 2) { //Alternates between nonmatched part and variable match
				let variable_name = split[i].substr(2, split[i].length - 3).trim();
				if (!variables.has(variable_name)) {
					throw 'Unset variable + ' + variable_name;
				}
				split[i] = variables.get(variable_name);
			}
			return split.join('');
		}
		return content;
	}
};

function render(seed, lang) {
	if (hardcoded !== undefined) {
		let rules_div = document.querySelector('#rules');
		let rules = [];
		for (let [filename, raw_rule_markdown] of hardcoded) {
			try {
				rules.push(new rule(raw_rule_markdown))
			}
			catch (e) {
				document.querySelector('h1').innerText = 'Error when parsing filename: ' + filename + ": " + e;
				throw e;
			}
			try {
				let content = rules[rules.length - 1].render(seed, lang);
				let content_node = document.createElement('div');
				content_node.innerHTML = marked.parse(content);
				rules_div.appendChild(content_node);
			}
			catch (e) {
				document.querySelector('h1').innerText = 'Error when rendering filename: ' + filename + ": " + e;
				throw e;
			}
		}
		console.log(rules);
	}
}

function handleSubmit() {
	document.querySelector('#menu').style.display = 'none';
	render(document.querySelector('#seed').value, document.querySelector('#lang').value);
}

function init() {
	window.addEventListener('load', function() {
		if (hardcoded === undefined) {
			let all_found = load('https://raw.githubusercontent.com/kezsulap/crazy-tournament-rule-generator/refs/heads/rules/rules/list_all.txt');
			hardcoded = [];
			for (let file of all_found.split('\n')) {
				file = file.trim();
				if (file.length) {
					hardcoded.push([file, load('https://raw.githubusercontent.com/kezsulap/crazy-tournament-rule-generator/refs/heads/rules/rules/' + file)]);
				}
			}
		}
	})
}
init();
