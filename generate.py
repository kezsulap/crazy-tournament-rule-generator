import subprocess
import shutil
import os
import argparse
import tempfile

def escape(c):
	c = c.replace('\\', '\\\\');
	c = c.replace('\r', '\\r');
	c = c.replace('\n', '\\n');
	c = c.replace('\'', '\\\'');
	c = '\'' + c + '\''
	return c

def get_file(filename, version):
	if ':' in filename:
		version, filename = filename.split(':', 1)
		if not filename:
			raise ValueError('Missing filename after ')
	if version is None:
		with open(filename, 'r') as f:
			return f.read()
	else:
		return subprocess.run(['git', 'show', f'{version}:{filename}'], capture_output=True, text=True).stdout

def copy_file(filename, destination, version):
	if version is None:
		shutil.copy(filename, destination)
	else:
		with open(destination, 'w') as output_file:
			subprocess.run(['git', 'show', version + ':' + filename], stdout=output_file)

def extract_directory(revision, src_dir, destination_dir):
	if revision is None:
		shutil.copytree(src_dir, destination_dir)
	else:
		shutil.rmtree(destination_dir, ignore_errors=True)
		os.mkdir(destination_dir)
		subprocess.run(f'git archive {revision} {src_dir} | tar -x -C {destination_dir} --strip-components=1', shell=True, check=True) #TODO: any sanitization

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--code-branch', '-c', action='store_true')

	args = parser.parse_args();

	if args.code_branch:
		rules_dir = 'rules'
		rules_version = None
	else:
		rules_dir = tempfile.mkdtemp()
		rules_version = 'rules'
		extract_directory(rules_version, 'rules', rules_dir)
	
	hardcoded = []

	for file in os.listdir(rules_dir): #TODO: support subdirectories, images etc.
		if file.endswith('.md'):
			with open(os.path.join(rules_dir, file), 'r') as f:
				hardcoded.append(f'[{escape(file)}, {escape(f.read())}]')

	hardcoded_content = "hardcoded=[" + ",".join(hardcoded) + "]"
	input_file = 'index.html'
	output_file = 'output.html'

	if args.code_branch:
		input_content = get_file(input_file, 'master')
	else:
		with open(input_file, 'r') as f:
			input_content = f.read()
	input_content = input_content.replace('hardcoded=undefined', hardcoded_content)
	if args.code_branch:
		extract_directory('master', 'resources', 'resources_copy')
		input_content = input_content.replace('resources', 'resources_copy')
	with open(output_file, 'w') as f:
		f.write(input_content)

if __name__ == '__main__':
	main()
