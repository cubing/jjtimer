js_files = %w(session timer scrambler shortcuts ui)
merge = js_files.map {|f| File.read "js/" + f + ".js" }.join

if ARGV[0] == "-o"
	require "net/http"
	require "uri"
	
	url = URI.parse "http://closure-compiler.appspot.com/compile"
	http = Net::HTTP.new url.host, url.port
	request = Net::HTTP::Post.new url.request_uri
	request.set_form_data :compilation_level => 'ADVANCED_OPTIMIZATIONS', :output_format => 'text', :output_info => 'compiled_code', :js_code => merge 
	response = http.request request
	orig_size = merge.size
	merge = response.body
	new_size = merge.size
	puts "Saved #{new_size*1.0/orig_size*100}%"
end

output = File.read "index.html"
output.gsub!(/<script type="text\/javascript" src="[^"]+"><\/script>\n/, "")
output.gsub!(/<\/head>/, "<script type='text/javascript'>" + merge + "</script></head>")
output.gsub!(/<link rel="stylesheet" href="css\/ui.css" \/>/, "<style type='text/css'>\n#{File.read("css/ui.css").chomp}</style>")

File.open("release.html", "w") do |out|
	out.print output
end
