js_files = %w(session timer scrambler ui)
merge = js_files.map {|f| File.read f + ".js" }.join

if ARGV[0] == "-o"
	require "net/http"
	require "uri"
	
	url = URI.parse "http://closure-compiler.appspot.com/compile"
	http = Net::HTTP.new url.host, url.port
	request = Net::HTTP::Post.new url.request_uri
	request.set_form_data :compilation_level => 'ADVANCED_OPTIMIZATIONS', :output_format => 'text', :output_info => 'compiled_code', :js_code => merge 
	response = http.request request
	merge = response.body
end

output = File.read "jjtimer.html"
output.gsub!(/<script type="text\/javascript" src="[^"]+"><\/script>\n/, "")
output.gsub!(/<\/head>/, merge + "</head>")

File.open("index.html", "w") do |out|
	out.print output
end
