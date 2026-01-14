mkdir pdf-rules -p
set -e
for x in $(ls rules | grep '\.md$'); do 
	input_file=rules/${x}
	output_file=pdf-rules/${x%md}pdf
	if [ "$input_file" -ot "$output_file" ]; then
		echo "$output_file is up to date";
	else
		echo -n "Compiling $output_file ... "
		pandoc rules/${x} -o pdf-rules/${x%md}pdf   --pdf-engine=xelatex   -V mainfont="DejaVu Serif";
		echo " Done";
	fi
done
for x in $(ls pdf-rules); do
	expected_md_file=rules/${x%pdf}md
	if ! [ -f $expected_md_file ]; then
		echo "Warning, file pdf-rules/$x doesn't match any existing .md file in rules directory" 
	fi
done
pdftk pdf-rules/*.pdf cat output merged.pdf
