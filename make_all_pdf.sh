mkdir pdf-rules -p
set -e
for x in $(ls rules | grep -v 'list_all.txt'); do 
	pandoc rules/${x} -o pdf-rules/${x%md}pdf   --pdf-engine=xelatex   -V mainfont="DejaVu Serif" &
done
wait
