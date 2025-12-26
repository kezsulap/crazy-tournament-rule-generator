mkdir pdf-rules -p
set -e
for x in $(ls rules | grep -v 'list_all.txt'); do 
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
