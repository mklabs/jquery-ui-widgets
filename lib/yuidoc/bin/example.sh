yuidoc_home="/Users/mdaniel/yuidoc"
parser_in="/Users/mdaniel/Documents/workspace/jquery-ui-controller/src"
parser_out=~/www/docs/parser
generator_out=~/www/docs/generator
template=$yuidoc_home/template
version=1.0.0
yuiversion=2

sudo $yuidoc_home/bin/yuidoc.py $parser_in -p $parser_out -o $generator_out -t $template -v $version -Y $yuiversion
