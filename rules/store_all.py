import os
import re
import subprocess

RED = "\u001b[31m";
ORANGE='\033[38:2:255:165:0m';
GREEN = "\u001b[32m";
YELLOW = "\u001b[33m";
RESET_COLOURS = "\u001b[0m";
EXPECTED_OTHER_FILES = 'list_all.txt', 'store_all.py' 

def get_file(filename, version) -> str:
	if ':' in filename:
		version, filename = filename.split(':', 1)
		if not filename:
			raise ValueError('Missing filename after ')
	if version is None:
		with open(filename, 'r') as f:
			return f.read()
	else:
		return subprocess.run(['git', 'show', f'{version}:{filename}'], capture_output=True, text=True).stdout


def extract_id_and_version(filename, version):
	content = get_file(filename, version)
	lines = content.split('\n')
	this_id = None
	this_version = None
	in_meta_section = False
	for line in lines:
		if re.fullmatch(r'#\s+META\s*', line):
			in_meta_section = True
		elif re.match(r'^#\s', line):
			in_meta_section = False
		elif re.match(r'^-\s*id\s*=', line):
			if this_id is not None:
				raise Exception(f"File {filename} {f'at {version}' if version is not None else ''} contains multiple id lines")
			this_id = line.split('=')[1].strip()
		elif re.match(r'^-\s*version\s*=', line):
			if this_version is not None:
				raise Exception(f"File {filename} {f'at {version}' if version is not None else ''} contains multiple version lines")
			this_version = line.split('=')[1].strip()
	if this_id is None:
		raise Exception(f"File {filename} {f'at {version}' if version is not None else ''} is missing id tag")
	if this_version is None:
		raise Exception(f"File {filename} {f'at {version}' if version is not None else ''} is missing version tag")
	return this_id, this_version

BROKEN_FILES = [('7d39ba2e6f6c2920689d2e5baadbbe28710db924', 'rules/1.md')]

def main():
	current_files = os.listdir('.')
	md_files = sorted([x for x in current_files if x.endswith('.md')])
	other_files = [x for x in current_files if not x.endswith('.md')]
	for x in other_files:
		if x not in EXPECTED_OTHER_FILES:
			print(YELLOW + f'Warning unexpected file: {x}'  + RESET_COLOURS) #TODO: exclude vim .swp files
	best_match = {}
	def touch(filename, this_id, this_version, git_version):
		key = (this_id, this_version)	
		if key not in best_match:
			best_match[key] = (filename, git_version)
		else:
			if git_version is None and best_match[key][1] is None:
				raise Exception(f'Files {filename} and {best_match[key][0]} have the same id: {this_id}')
			print(f'{filename = } {this_id = } {this_version = } {git_version = } is duplicate of existing best_match[{key = }] = {best_match[key]}')
	for md_file in md_files:
		this_id, this_version = extract_id_and_version(md_file, None)
		touch(md_file, this_id, this_version, None)
	git_log = subprocess.run(['git', 'log', '--pretty=format:%H', '--name-status' ,'--follow', '--', '.'], capture_output=True, text=True, check=True).stdout
	expect_hash = True
	current_hash = None
	for line in git_log.split('\n'):
		if not line.strip():
			expect_hash = True;
		elif expect_hash:
			current_hash = line
			expect_hash = False
		else:
			status, *_, filename = line.split('\t')
			assert filename.startswith('rules/')
			if filename.removeprefix('rules/') in EXPECTED_OTHER_FILES:
				continue
			if status == 'D':
				continue
			if (current_hash, filename) in BROKEN_FILES:
				continue
			this_id, this_version = extract_id_and_version(filename, current_hash)
			touch(filename.removeprefix('rules/'), this_id, this_version, current_hash)
	with open('list_all.txt', 'w') as f:
		for (this_id, this_version), (filename, git_version) in best_match.items():
			if git_version is None:
				print(f'{filename} {this_id} {this_version}', file=f)
			else:
				print(f'{filename} {this_id} {this_version} {git_version}', file=f)

if __name__ == '__main__':
	main()
